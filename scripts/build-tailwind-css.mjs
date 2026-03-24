import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, basename, dirname, resolve, relative } from "node:path";

const rootDir = process.cwd();
const inputCssPath = resolve(rootDir, "styles/tailwind.input.css");
const htmlFiles = walkHtmlFiles(rootDir);

for (const filePath of htmlFiles) {
  const html = readFileSync(filePath, "utf8");
  const configMatch = html.match(/<script id="tailwind-config">([\s\S]*?)<\/script>\s*/i);
  const configPath = resolve(dirname(filePath), `${basename(filePath, ".html")}.tailwind.config.cjs`);
  const cssFileName = `${basename(filePath, ".html")}.tailwind.css`;
  const cssPath = resolve(dirname(filePath), cssFileName);

  if (configMatch) {
    const configObject = extractConfigObject(configMatch[1], filePath);
    writeFileSync(configPath, buildConfigFile(configObject, filePath), "utf8");
  }

  if (!existsSync(configPath)) {
    continue;
  }

  normalizeConfigFile(configPath, filePath);

  const rewrittenHtml = rewriteHtml(html, cssFileName);
  if (rewrittenHtml !== html) {
    writeFileSync(filePath, rewrittenHtml, "utf8");
  }

  buildCss(configPath, cssPath);
}

function walkHtmlFiles(dirPath) {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === ".vercel" || entry.name === "node_modules") {
      continue;
    }

    const entryPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

function extractConfigObject(scriptBody, filePath) {
  const assignIndex = scriptBody.indexOf("tailwind.config");
  if (assignIndex === -1) {
    throw new Error(`No se encontró tailwind.config en ${relative(rootDir, filePath)}`);
  }

  const objectStart = scriptBody.indexOf("{", assignIndex);
  const objectEnd = scriptBody.lastIndexOf("}");
  if (objectStart === -1 || objectEnd === -1 || objectEnd <= objectStart) {
    throw new Error(`No se pudo extraer el objeto de config en ${relative(rootDir, filePath)}`);
  }

  return scriptBody.slice(objectStart, objectEnd + 1).trim();
}

function buildConfigFile(configObject, filePath) {
  const relativeContentPath = toTailwindContentPath(filePath);

  return `const baseConfig = ${configObject};

module.exports = {
  ...baseConfig,
  content: [${JSON.stringify(relativeContentPath)}],
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
    ...((baseConfig.plugins) || []),
  ],
};
`;
}

function rewriteHtml(html, cssFileName) {
  const cssLink = `<link href="${cssFileName}" rel="stylesheet"/>\n`;
  let output = html.replace(/<script\s+src="https:\/\/cdn\.tailwindcss\.com\?plugins=forms,container-queries"><\/script>\s*/gi, "");
  output = output.replace(/<script id="tailwind-config">[\s\S]*?<\/script>\s*/i, cssLink);

  const linkRegex = new RegExp(`<link\\s+[^>]*href=["']${escapeRegExp(cssFileName)}["'][^>]*>`, "i");
  if (!linkRegex.test(output) && output.includes("</head>")) {
    output = output.replace("</head>", `${cssLink}</head>`);
  }

  return output;
}

function buildCss(configPath, cssPath) {
  execFileSync(
    resolve(rootDir, "node_modules/.bin/tailwindcss"),
    ["-i", inputCssPath, "-o", cssPath, "-c", configPath, "--minify"],
    { cwd: rootDir, stdio: "pipe" },
  );
}

function normalizeConfigFile(configPath, filePath) {
  const relativeContentPath = toTailwindContentPath(filePath);
  const configSource = readFileSync(configPath, "utf8");
  const normalizedSource = configSource.replace(
    /content:\s*\[[^\]]*\],/,
    `content: [${JSON.stringify(relativeContentPath)}],`,
  );

  if (normalizedSource !== configSource) {
    writeFileSync(configPath, normalizedSource, "utf8");
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toTailwindContentPath(filePath) {
  const relativePath = relative(rootDir, filePath).split("\\").join("/");
  return `./${relativePath}`;
}
