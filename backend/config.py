from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str = ""
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    deepseek_api_key: str = ""

    # Model name overrides (optional)
    gemini_model: str = "models/gemini-2.5-flash"
    openai_model: str = "gpt-4o-mini"
    anthropic_model: str = "claude-haiku-20240307"
    deepseek_model: str = "deepseek-chat"

    # Server config
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8080",
        "https://legal-ai-chi-liart.vercel.app",
    ]
    max_case_length: int = 5000
    cache_ttl_seconds: int = 3600
    debug: bool = False

settings = Settings()

def startup_check():
    if not settings.gemini_api_key:
        print("WARNING: GEMINI_API_KEY is not set. AI analysis will be unavailable.")
    else:
        print("[OK] Startup Check Passed.")
    print(f"   Allowed Origins : {settings.allowed_origins}")
    print(f"   Cache TTL       : {settings.cache_ttl_seconds}s")
    print(f"   Gemini Model    : {settings.gemini_model}")
