import json
import asyncio
import hashlib
import time
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, List, Tuple, Optional
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from config import settings, startup_check
import google.generativeai as genai
import uuid

# Configure AI clients
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)
# --- Firebase Admin Init ---
import os
try:
    firebase_admin.get_app()
except ValueError:
    try:
        service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        if service_account_json:
            import json
            cred_dict = json.loads(service_account_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized via Production JSON Variable.")
        else:
            # Default application credentials fallback
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized via ApplicationDefault credentials.")
    except Exception as e:
        print(f"Warning: Firebase Admin initialization failed ({e}). Token verification will throw 401 unless configured.")

# No custom rate limiter to avoid proxy header conflicts on serverless

# --- Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_check()
    if settings.gemini_api_key:
        genai.configure(api_key=settings.gemini_api_key)
    yield

app = FastAPI(title="Lumina Legal API", lifespan=lifespan)

@app.get("/")
@app.head("/")
def root_health_check():
    return {"status": "ok", "version": "2.0.0", "message": "Lumina Legal API is Live"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    err_msg = traceback.format_exc()
    print(f"\n--- FATAL ERROR ---\n{err_msg}\n-------------------\n")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error_message": str(exc)}
    )

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins + [
        "https://legal-ai-chi-liart.vercel.app",
        "*" # Broad allowance due to Render/Vercel port complexities in preview
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Authenication Middleware ---
def verify_firebase_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing or invalid Bearer token")
    
    token = authorization.split("Bearer ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Token Verification Failed: {e}")
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Firebase token")

# --- Pydantic Models ---
class CaseRequest(BaseModel):
    case_text: str = Field(..., min_length=50, max_length=settings.max_case_length)
    language: Literal["en", "hi"] = "en"

class AnalysisSection(BaseModel):
    ipc_section: str
    bns_section: str
    title: str
    confidence: float = Field(..., ge=0, le=1)
    reasoning: str
    severity: str
    is_cognizable: bool
    punishment: str

class AnalysisResponse(BaseModel):
    sections: List[AnalysisSection]
    summary: str
    provider_used: str
    analysis_id: str
    cached: bool
    processing_time_ms: int
    disclaimer: str = "This analysis is based on the case description provided and may not reflect all applicable laws. Section applicability requires professional legal verification."

class HealthResponse(BaseModel):
    status: str
    providers_available: List[str]
    version: str

# --- Caching ---
_cache = {}
_cache_lock = asyncio.Lock()

async def get_cached(text: str) -> Tuple[AnalysisResponse, float] | None:
    key = hashlib.md5(text.lower().encode()).hexdigest()
    async with _cache_lock:
        if key in _cache:
            data, timestamp = _cache[key]
            if time.time() - timestamp < settings.cache_ttl_seconds:
                return data, timestamp
            else:
                del _cache[key]
    return None

async def set_cache(text: str, response: AnalysisResponse):
    key = hashlib.md5(text.lower().encode()).hexdigest()
    async with _cache_lock:
        _cache[key] = (response, time.time())

# --- AI Providers ---
MASTER_LEGAL_PROMPT = """
You are a senior Indian legal expert at a top-tier law firm. Your task is to analyze the user's case description with extreme precision. 

Follow this strict Chain of Thought process:
1. IDENTIFY all material facts and allegations in the case text.
2. DETERMINE the applicable Bharatiya Nyaya Sanhita (BNS) 2023 sections as primary laws.
3. MAP each BNS section to its legacy Indian Penal Code (IPC) equivalent accurately.
4. ASSESS applicability under the IT Act 2000, DPDP Act 2023, or other acts if relevant.

Return ONLY a perfectly formatted JSON array with absolutely no markdown wrapping, no code blocks (` ```json `), and no explanations outside of the JSON. If no sections apply, return an empty array `[]`.

Format per section:
[
  {{
    "ipc_section": "String (Always tag 'legacy')",
    "bns_section": "String (Always primary reference)",
    "title": "String (Exact legal title)",
    "confidence": 0.0 to 1.0 (float),
    "reasoning": "String (Brief professional analysis showing why this section applies)",
    "severity": "String (e.g., Non-bailable, Bailable)",
    "is_cognizable": boolean,
    "punishment": "String"
  }}
]

Case description: {case_text}
"""

async def analyze_with_gemini(case_text: str) -> List[AnalysisSection]:
    prompt = MASTER_LEGAL_PROMPT.replace("{case_text}", case_text)
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config={"response_mime_type": "application/json"}
    )
    response = model.generate_content(prompt)
    try:
        # Strip potential markdown formatting from JSON
        resp_text = response.text.strip()
        if resp_text.startswith("```json"):
            resp_text = resp_text[7:-3]
        elif resp_text.startswith("```"):
            resp_text = resp_text[3:-3]
        
        data = json.loads(resp_text)
        return [AnalysisSection(**item) for item in data]
    except Exception as e:
        print(f"Gemini Parse Error: {e}")
        return []

async def analyze_with_fallback(case_text: str) -> Tuple[List[AnalysisSection], str]:
    # Providers in order: gemini → openai → anthropic → deepseek
    # Simplified fallback to just Gemini for prototype, other stubs return empty.
    if settings.gemini_api_key:
        sections = await analyze_with_gemini(case_text)
        if sections:
            return sections, "Gemini Pro"
    
    # In full production, we try OpenAI, etc. Here we emulate the chain.
    raise HTTPException(status_code=503, detail="All AI providers unavailable")

# --- Endpoints ---
@app.post("/analyze")
async def analyze(request: Request, case_req: CaseRequest, user: dict = Depends(verify_firebase_token)):
    try:
        start_time = time.time()
        
        # Check cache
        cached = await get_cached(case_req.case_text)
        if cached:
            cached_resp, _ = cached
            cached_resp.cached = True
            return cached_resp
            
        sections, provider = await analyze_with_fallback(case_req.case_text)
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        summary_text = f"Automated analysis identified {len(sections)} potential legal sections."
        
        response = AnalysisResponse(
            sections=sections,
            summary=summary_text,
            provider_used=provider,
            analysis_id=str(uuid.uuid4()),
            cached=False,
            processing_time_ms=processing_time_ms
        )
        
        await set_cache(case_req.case_text, response)
        return response
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        # Save exact error to a file to bypass Windows cp1252 printing errors
        with open("crash.txt", "w", encoding="utf-8") as f:
            f.write(err_msg)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/stream")
async def analyze_stream(case_req: CaseRequest, user: dict = Depends(verify_firebase_token)):
    async def sse_generator():
        yield f"data: {json.dumps({'type': 'thinking', 'message': 'Analysing sections...'})}\n\n"
        await asyncio.sleep(1) # Fake delay for effect
        yield f"data: {json.dumps({'type': 'thinking', 'message': 'Matching IPC and BNS mappings...'})}\n\n"
        
        try:
            start_time = time.time()
            sections, provider = await analyze_with_fallback(case_req.case_text)
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            summary_text = f"Automated analysis identified {len(sections)} potential legal sections."
            
            resp = AnalysisResponse(
                sections=sections,
                summary=summary_text,
                provider_used=provider,
                analysis_id=str(uuid.uuid4()),
                cached=False,
                processing_time_ms=processing_time_ms
            )
            yield f"data: {json.dumps({'type': 'complete', 'data': resp.model_dump()})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")

@app.get("/health", response_model=HealthResponse)
def health_check():
    providers = []
    if settings.gemini_api_key: providers.append("Gemini")
    if settings.openai_api_key: providers.append("OpenAI")
    return HealthResponse(
        status="running",
        providers_available=providers,
        version="1.0.0"
    )
