import os
import re

def clean_links_in_content(content):
    # Regex para buscar href="link.html" o href='link.html'
    # Evitamos enlaces externos (que tengan ://) a menos que sean de d4lab.es o localhost
    # Coincide con:
    # 1. Enlaces internos absolutos o relativos: sin "://"
    # 2. Enlaces absolutos del propio dominio: "https://www.d4lab.es/..." o "https://d4lab.es/..."
    
    # Patrón para comillas dobles
    pattern_double = r'href="((?:https?://(?:www\.)?d4lab\.es)?(?:/[^"]*?|[^":]+?))\.html"'
    # Patrón para comillas simples
    pattern_single = r"href='((?:https?://(?:www\.)?d4lab\.es)?(?:/[^']*?|[^':]+?))\.html'"

    content, count_double = re.subn(pattern_double, r'href="\1"', content)
    content, count_single = re.subn(pattern_single, r"href='\1'", content)
    
    return content, count_double + count_single

def main():
    root_dir = '/Users/daldo/VsCode/Pagina servicios'
    total_files_modified = 0
    total_replacements = 0

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Omitir directorios ocultos (como .git, .vercel, etc.) y node_modules
        if any(part.startswith('.') for part in dirpath.split(os.sep)) or 'node_modules' in dirpath:
            continue
            
        for filename in filenames:
            if filename.endswith('.html'):
                file_path = os.path.join(dirpath, filename)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content, replacements = clean_links_in_content(content)
                
                if replacements > 0:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Modificado: {os.path.relpath(file_path, root_dir)} ({replacements} reemplazos)")
                    total_files_modified += 1
                    total_replacements += replacements

    print(f"\nProceso completado. Se modificaron {total_files_modified} archivos con un total de {total_replacements} reemplazos.")

if __name__ == '__main__':
    main()
