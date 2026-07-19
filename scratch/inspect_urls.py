import json
import urllib.request
import urllib.parse
from google.oauth2 import service_account
import google.auth.transport.requests

def inspect_url(token, url, site_url):
    try:
        body = {
            "inspectionUrl": url,
            "siteUrl": site_url,
            "languageCode": "es"
        }
        req_data = json.dumps(body).encode('utf-8')
        req = urllib.request.Request(
            'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
            data=req_data,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            },
            method='POST'
        )
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data
    except Exception as e:
        return {"error": str(e)}

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
        urls_to_inspect = [
            "https://www.d4lab.es/",
            "https://www.d4lab.es/servicios",
            "https://www.d4lab.es/preview-logo.html",
            "https://www.d4lab.es/preview-logo",
            "https://www.d4lab.es/stitch/maqueta-b2b-servicios-stitch-01.html"
        ]

        for url in urls_to_inspect:
            print(f"Inspeccionando {url}...")
            result = inspect_url(token, url, site_url)
            # Imprimir partes relevantes de la respuesta
            if "error" in result:
                print(f"Error: {result['error']}")
            else:
                inspection_result = result.get("inspectionResult", {})
                index_status_result = inspection_result.get("indexStatusResult", {})
                verdict = index_status_result.get("verdict", "UNKNOWN")
                coverage_state = index_status_result.get("coverageState", "UNKNOWN")
                robots_txt_state = index_status_result.get("robotsTxtState", "UNKNOWN")
                indexing_state = index_status_result.get("indexingState", "UNKNOWN")
                print(f"  Verdict: {verdict}")
                print(f"  Coverage State: {coverage_state}")
                print(f"  Robots.txt State: {robots_txt_state}")
                print(f"  Indexing State: {indexing_state}")
                print(json.dumps(result, indent=2))
            print("-" * 50)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
