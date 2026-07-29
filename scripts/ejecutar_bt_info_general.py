import requests
import json

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZGRkN2YwYy0zOWQ2LTQwY2UtODg2Ny1lZWVkZDRiNjgwZTgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzgxNTk5NTg1fQ.jJHqTRqm1nt_zlTErfcRnBGsAiE5faEwDeUmJBIcP74'
headers = {'X-N8N-API-KEY': token, 'Accept': 'application/json'}

with open('.tmp/BT_info_general.json', 'r', encoding='utf-8') as f:
    workflow = json.load(f)

res = requests.post(f"https://dfn8n.sistemadistribuidorafenix.com/api/v1/workflows/{workflow['id']}/execute", headers=headers)
print(res.status_code)
print(res.text)
