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

        # Cuerpo de la petición para obtener el rendimiento general de los últimos 30 días
        body = {
            "startDate": "2026-06-01",
            "endDate": "2026-06-30",
            "dimensions": ["date"],
            "rowLimit": 10
        }
        
        req_data = json.dumps(body).encode('utf-8')

        # Consultar searchAnalytics
        req = urllib.request.Request(
            f'https://www.googleapis.com/webmasters/v3/sites/{encoded_site_url}/searchAnalytics/query',
            data=req_data,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            },
            method='POST'
        )

        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(json.dumps(data, indent=2))
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
