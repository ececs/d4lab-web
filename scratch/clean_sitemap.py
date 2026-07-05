import re

def main():
    sitemap_path = '/Users/daldo/VsCode/Pagina servicios/sitemap.xml'
    
    with open(sitemap_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Reemplazar la extensión .html dentro de las etiquetas <loc>
    new_content = re.sub(r'\.html</loc>', '</loc>', content)

    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("Sitemap limpiado correctamente.")

if __name__ == '__main__':
    main()
