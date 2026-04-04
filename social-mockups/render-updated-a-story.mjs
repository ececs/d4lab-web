import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('social-mockups/output');
const filePath = path.join(outDir, 'concepto-a-principal-story-v2.png');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background:
        radial-gradient(circle at 15% 10%, rgba(255,166,77,0.25), transparent 26%),
        radial-gradient(circle at 88% 16%, rgba(143,231,221,0.20), transparent 24%),
        linear-gradient(180deg, #06101d 0%, #0d2238 46%, #154769 100%);
      color: white;
      font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
    }
    .story {
      width: 100%;
      height: 100%;
      padding: 80px 72px 84px;
      display: grid;
      grid-template-rows: auto auto auto auto 1fr auto;
      gap: 26px;
    }
    .badge {
      display: inline-flex;
      justify-self: start;
      padding: 12px 22px;
      border-radius: 999px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.14);
      font-size: 26px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }
    .eyebrow {
      font-size: 28px;
      font-weight: 800;
      color: #8fe7dd;
      text-transform: uppercase;
      letter-spacing: 1.4px;
    }
    h1 {
      margin: 0;
      font-size: 94px;
      line-height: 0.96;
      letter-spacing: -2.8px;
      max-width: 900px;
    }
    .quote {
      padding: 34px;
      border-radius: 34px;
      background: linear-gradient(135deg, rgba(255,179,92,0.22), rgba(143,231,221,0.16));
      font-size: 42px;
      line-height: 1.34;
      color: #fff8f0;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 20px 48px rgba(0,0,0,0.18);
    }
    .panel {
      padding: 34px;
      border-radius: 34px;
      background: rgba(6, 16, 29, 0.48);
      border: 1px solid rgba(255,255,255,0.09);
      box-shadow: 0 24px 50px rgba(0,0,0,0.22);
      align-self: stretch;
    }
    .panel-label {
      font-size: 22px;
      text-transform: uppercase;
      letter-spacing: 1.3px;
      color: #ffcf93;
      font-weight: 800;
      margin-bottom: 18px;
    }
    .bullet {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 36px;
      line-height: 1.28;
      margin-bottom: 20px;
      color: #eef7ff;
    }
    .bullet:last-child { margin-bottom: 0; }
    .dot {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: #ffb35c;
      flex: 0 0 auto;
      margin-top: 6px;
    }
    .bottom {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 8px;
    }
    .cta {
      padding: 28px 30px;
      border-radius: 24px;
      background: #ffb35c;
      color: #082033;
      text-align: center;
      font-size: 40px;
      font-weight: 900;
      box-shadow: 0 18px 40px rgba(255,179,92,0.22);
    }
    .subcta {
      text-align: center;
      font-size: 30px;
      line-height: 1.35;
      color: #dceaf6;
      max-width: 860px;
      justify-self: center;
    }
    .brand {
      text-align: center;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 1.8px;
      color: #8fe7dd;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="story">
    <div class="badge">BLOG D4LAB</div>
    <div class="eyebrow">CONTENIDO UTIL CON ENFOQUE COMERCIAL</div>
    <h1>Automatiza la captacion de clientes sin volverte loco</h1>
    <div class="quote">Publica mejor, responde antes y convierte las dudas de tus clientes en oportunidades reales con automatizacion, IA y procesos bien montados.</div>
    <div class="panel">
      <div class="panel-label">Esto te interesa si buscas</div>
      <div class="bullet"><span class="dot"></span><span>Menos tareas manuales</span></div>
      <div class="bullet"><span class="dot"></span><span>Mas seguimiento comercial</span></div>
      <div class="bullet"><span class="dot"></span><span>Mas opciones de cerrar ventas</span></div>
    </div>
    <div class="bottom">
      <div class="cta">Responde a esta story y te orientamos</div>
      <div class="subcta">Quieres ver como aplicarlo en tu negocio?</div>
      <div class="brand">D4LAB.ES</div>
    </div>
  </div>
</body>
</html>`;

await mkdir(outDir, { recursive: true });

const response = await fetch('http://192.168.31.199:3001/screenshot?token=tesia_bless', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ html, viewport: { width: 1080, height: 1920 } }),
});

if (!response.ok) {
  throw new Error(`Render failed: ${response.status} ${response.statusText}`);
}

const buffer = Buffer.from(await response.arrayBuffer());
await writeFile(filePath, buffer);
console.log(filePath);
