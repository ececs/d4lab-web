import json
import urllib.request
import urllib.parse
from google.oauth2 import service_account
import google.auth.transport.requests

def main():
    try:
        # Cargar credenciales
        creds = service_account.Credentials.from_service_account_file(
            '/Users/daldo/gsc-credentials.json',
            scopes=['https://www.googleapis.com/auth/webmasters.readonly']
        )

        # Refrescar para obtener el token de acceso
        auth_req = google.auth.transport.requests.Request()
        creds.refresh(auth_req)
        token = creds.token

        site_url = 'https://www.d4lab.es/'
        encoded_site_url = urllib.parse.quote_plus(site_url)

        # 1. Obtener páginas principales
        body_pages = {
            "startDate": "2026-06-01",
            "endDate": "2026-06-30",
            "dimensions": ["page"],
            "rowLimit": 10
        }
        
        req_data_pages = json.dumps(body_pages).encode('utf-8')
        req = urllib.request.Request(
            f'https://www.googleapis.com/webmasters/v3/sites/{encoded_site_url}/searchAnalytics/query',
            data=req_data_pages,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            },
            method='POST'
        )

        print("--- TOP PAGES ---")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(json.dumps(data, indent=2))

        # 2. Obtener búsquedas principales
        body_queries = {
            "startDate": "2026-06-01",
            "endDate": "2026-06-30",
            "dimensions": ["query"],
            "rowLimit": 10
        }
        
        req_data_queries = json.dumps(body_queries).encode('utf-8')
        req_q = urllib.request.Request(
            f'https://www.googleapis.com/webmasters/v3/sites/{encoded_site_url}/searchAnalytics/query',
            data=req_data_queries,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            },
            method='POST'
        )

        print("\n--- TOP QUERIES ---")
        with urllib.request.urlopen(req_q) as response:
            data_q = json.loads(response.read().decode())
            print(json.dumps(data_q, indent=2))
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
