import urllib.request
import urllib.parse
from google.oauth2 import service_account
import google.auth.transport.requests

def main():
    try:
        # Cargar credenciales
        creds = service_account.Credentials.from_service_account_file(
            '/Users/daldo/gsc-credentials.json',
            scopes=['https://www.googleapis.com/auth/webmasters']
        )

        # Refrescar para obtener el token de acceso
        auth_req = google.auth.transport.requests.Request()
        creds.refresh(auth_req)
        token = creds.token

        site_url = 'https://www.d4lab.es/'
        sitemap_url = 'https://www.d4lab.es/sitemap.xml'
        
        encoded_site_url = urllib.parse.quote_plus(site_url)
        encoded_sitemap_url = urllib.parse.quote_plus(sitemap_url)

        # La petición para enviar el sitemap usa el método PUT
        req = urllib.request.Request(
            f'https://www.googleapis.com/webmasters/v3/sites/{encoded_site_url}/sitemaps/{encoded_sitemap_url}',
            headers={'Authorization': f'Bearer {token}'},
            method='PUT'
        )

        with urllib.request.urlopen(req) as response:
            status_code = response.getcode()
            print(f"Respuesta de la API de Google (Código de estado): {status_code}")
            if status_code in [200, 204]:
                print("Sitemap enviado correctamente a Google Search Console.")
            else:
                print("Ocurrió un comportamiento inesperado al enviar el sitemap.")
            
    except Exception as e:
        print(f"Error al enviar el sitemap: {e}")

if __name__ == '__main__':
    main()
