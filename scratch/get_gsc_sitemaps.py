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

        # Codificar el siteUrl
        site_url = 'https://www.d4lab.es/'
        encoded_site_url = urllib.parse.quote_plus(site_url)

        # Consultar la lista de sitemaps
        req = urllib.request.Request(
            f'https://www.googleapis.com/webmasters/v3/sites/{encoded_site_url}/sitemaps',
            headers={'Authorization': f'Bearer {token}'}
        )

        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(json.dumps(data, indent=2))
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
