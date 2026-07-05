import json
import urllib.request
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

        # Consultar la lista de sitios
        req = urllib.request.Request(
            'https://www.googleapis.com/webmasters/v3/sites',
            headers={'Authorization': f'Bearer {token}'}
        )

        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(json.dumps(data, indent=2))
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
