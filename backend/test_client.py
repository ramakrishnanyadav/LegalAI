from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
response = client.post("/analyze", json={
    "case_text": "A neighbor has forcefully constructed a boundary wall encroaching 5 feet into my legally owned agricultural land. When confronted, they threatened me with physical harm and refused to show property documents.",
    "language": "en"
})

print(response.status_code)
print(response.json())
