# Lessons Learned

- **MCP Server Launching in Node v26+:** Running community MCP packages via `npx -y <package-name>` inside configuration files may fail due to module resolution issues inside the temporary `npx` cache directory (e.g. missing `extend` package). Installing the package locally (`npm install <package-name>`) and launching it directly with `node` pointing to its build file is a robust workaround that resolves dependency lookup errors.
- **Semantic Footer Headings:** When a page has major sections defined by `<h2>` tags, check the headers of the footer columns. They should be structured as `<h3>` elements (even if they look small) to avoid skipping levels in the document outline, which triggers accessibility warnings.
