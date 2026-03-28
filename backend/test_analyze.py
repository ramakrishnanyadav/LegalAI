import requests
try:
    r = requests.post(
        "http://127.0.0.1:8000/analyze",
        json={
            "case_text": "A neighbor has forcefully constructed a boundary wall encroaching 5 feet into my legally owned agricultural land. When confronted, they threatened me with physical harm and refused to show property documents.",
            "language": "en"
        }
    )
    print(r.status_code)
    print(r.text)
except Exception as e:
    print("Error:", e)
