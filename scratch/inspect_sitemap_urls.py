import json
import xml.etree.ElementTree as ET
import urllib.request
import urllib.parse
import time
import os
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
        # Especificamos un timeout de 8 segundos para evitar bloqueos
        with urllib.request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode())
            return data
    except Exception as e:
        return {"error": str(e)}

def save_report(report_path, summary, blocked, unrecognized, indexed, other, all_results):
    report = {
        "summary": summary,
        "blocked": blocked,
        "unrecognized": unrecognized,
        "indexed": indexed,
        "other": other,
        "all_results": all_results
    }
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

def main():
    try:
        # 1. Leer sitemap.xml
        sitemap_path = '/Users/daldo/VsCode/Pagina servicios/sitemap.xml'
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        
        namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = []
        for loc in root.findall('.//ns:loc', namespace):
            urls.append(loc.text.strip())
            
        print(f"Total URLs encontradas en sitemap: {len(urls)}")
        
        # 2. Cargar credenciales
        creds = service_account.Credentials.from_service_account_file(
            '/Users/daldo/gsc-credentials.json',
            scopes=['https://www.googleapis.com/auth/webmasters.readonly']
        )
        
        auth_req = google.auth.transport.requests.Request()
        creds.refresh(auth_req)
        token = creds.token
        
        site_url = 'https://www.d4lab.es/'
        report_path = '/Users/daldo/VsCode/Pagina servicios/scratch/gsc_inspection_report.json'
        
        results = []
        blocked_urls = []
        unrecognized_urls = []
        indexed_urls = []
        other_urls = []
        
        for i, url in enumerate(urls):
            print(f"[{i+1}/{len(urls)}] Inspeccionando: {url} ...", flush=True)
            result = inspect_url(token, url, site_url)
            
            if "error" in result:
                print(f"  Error: {result['error']}", flush=True)
                results.append({"url": url, "error": result["error"]})
            else:
                inspection_result = result.get("inspectionResult", {})
                index_status_result = inspection_result.get("indexStatusResult", {})
                
                verdict = index_status_result.get("verdict", "UNKNOWN")
                coverage_state = index_status_result.get("coverageState", "UNKNOWN")
                robots_txt_state = index_status_result.get("robotsTxtState", "UNKNOWN")
                indexing_state = index_status_result.get("indexingState", "UNKNOWN")
                
                item = {
                    "url": url,
                    "verdict": verdict,
                    "coverageState": coverage_state,
                    "robotsTxtState": robots_txt_state,
                    "indexingState": indexing_state
                }
                
                results.append(item)
                
                if robots_txt_state == "BLOCKED" or "robots" in coverage_state.lower():
                    blocked_urls.append(item)
                    print(f"  --> ¡BLOQUEADA POR ROBOTS.TXT!: {coverage_state}", flush=True)
                elif verdict == "PASS":
                    indexed_urls.append(item)
                elif "no reconoce" in coverage_state.lower() or "no está en google" in coverage_state.lower():
                    unrecognized_urls.append(item)
                    print("  --> No indexada (Google no la reconoce)", flush=True)
                else:
                    other_urls.append(item)
                    print(f"  --> Otro estado: {verdict} - {coverage_state}", flush=True)
            
            # Guardar progresivamente
            summary = {
                "total_urls": len(urls),
                "processed": i + 1,
                "indexed": len(indexed_urls),
                "blocked_by_robots": len(blocked_urls),
                "unrecognized": len(unrecognized_urls),
                "other": len(other_urls)
            }
            save_report(report_path, summary, blocked_urls, unrecognized_urls, indexed_urls, other_urls, results)
            
            # Pequeña pausa
            time.sleep(0.3)
            
        print("\n=== PROCESO COMPLETADO ===", flush=True)
        
    except Exception as e:
        print(f"Error general: {e}", flush=True)

if __name__ == '__main__':
    main()
