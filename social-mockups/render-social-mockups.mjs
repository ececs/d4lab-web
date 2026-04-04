import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('social-mockups/output');

const sample = {
  type: 'Blog d4lab',
  title: 'Automatiza la captacion de clientes sin volverte loco',
  summary:
    'Publica mejor, responde antes y convierte las dudas de tus clientes en oportunidades reales con automatizacion, IA y procesos bien montados.',
  value:
    'Creamos flujos que conectan formularios, WhatsApp, email y seguimiento comercial para que no se enfrien los leads.',
  question: 'Quieres ver como aplicarlo en tu negocio?',
  bullets: [
    'Menos tareas manuales',
    'Mas seguimiento comercial',
    'Mas opciones de cerrar ventas',
  ],
  url: 'd4lab.es',
};

const concepts = [
  {
    key: 'concepto-a-principal',
    label: 'Principal',
    buildPost: () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1080px;
      height: 1350px;
      overflow: hidden;
      background:
        radial-gradient(circle at top left, rgba(255,166,77,0.22), transparent 28%),
        radial-gradient(circle at 85% 18%, rgba(28,197,180,0.18), transparent 24%),
        linear-gradient(160deg, #07111f 0%, #0d2138 54%, #12365a 100%);
      color: #f7fbff;
      font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .frame {
      width: 948px;
      height: 1208px;
      border-radius: 44px;
      padding: 54px;
      background: rgba(7, 17, 31, 0.72);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 30px 80px rgba(0,0,0,0.32);
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .halo {
      position: absolute;
      inset: auto -120px -120px auto;
      width: 320px;
      height: 320px;
      border-radius: 999px;
      background: rgba(255,166,77,0.15);
      filter: blur(40px);
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 12px 22px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.14);
      font-size: 24px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }
    .brand {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 1.8px;
      text-transform: uppercase;
      color: #ffb35c;
    }
    .strap {
      margin-top: 36px;
      font-size: 28px;
      font-weight: 700;
      color: #8fe7dd;
      text-transform: uppercase;
      letter-spacing: 1.4px;
    }
    h1 {
      margin: 26px 0 24px;
      font-size: 82px;
      line-height: 0.98;
      letter-spacing: -2.4px;
      max-width: 780px;
    }
    .summary {
      margin: 0;
      max-width: 760px;
      font-size: 35px;
      line-height: 1.42;
      color: #d9e7f4;
    }
    .value-box {
      margin-top: 34px;
      padding: 30px 32px;
      border-radius: 28px;
      background: linear-gradient(135deg, rgba(255,179,92,0.18), rgba(143,231,221,0.12));
      border: 1px solid rgba(255,255,255,0.08);
    }
    .value-label {
      font-size: 20px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.4px;
      color: #ffcf93;
      margin-bottom: 12px;
    }
    .value-copy {
      font-size: 31px;
      line-height: 1.38;
      color: #fff6eb;
    }
    .spacer { flex: 1; }
    .footer {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 24px;
      align-items: end;
    }
    .question {
      font-size: 31px;
      line-height: 1.35;
      color: #eef7ff;
      max-width: 520px;
    }
    .cta {
      justify-self: end;
      align-self: end;
      padding: 18px 28px;
      border-radius: 18px;
      background: #ffb35c;
      color: #082033;
      font-size: 25px;
      font-weight: 800;
      text-align: center;
      max-width: 280px;
      box-shadow: 0 18px 40px rgba(255,179,92,0.2);
    }
    .url {
      margin-top: 16px;
      font-size: 21px;
      color: #8fe7dd;
    }
  </style>
</head>
<body>
  <div class="frame">
    <div class="halo"></div>
    <div class="topbar">
      <div class="badge">${sample.type}</div>
      <div class="brand">${sample.url}</div>
    </div>
    <div class="strap">Contenido util con enfoque comercial</div>
    <h1>${sample.title}</h1>
    <p class="summary">${sample.summary}</p>
    <div class="value-box">
      <div class="value-label">Que gana tu empresa</div>
      <div class="value-copy">${sample.value}</div>
    </div>
    <div class="spacer"></div>
    <div class="footer">
      <div>
        <div class="question">${sample.question}</div>
        <div class="url">${sample.url}</div>
      </div>
      <div class="cta">Escribenos y te orientamos</div>
    </div>
  </div>
</body>
</html>`,
    buildStory: () => `<!DOCTYPE html>
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
      padding: 88px 72px 96px;
      display: flex;
      flex-direction: column;
    }
    .badge {
      display: inline-flex;
      align-self: flex-start;
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
      margin-top: 34px;
      font-size: 28px;
      font-weight: 800;
      color: #8fe7dd;
      text-transform: uppercase;
      letter-spacing: 1.4px;
    }
    h1 {
      margin: 24px 0 24px;
      font-size: 96px;
      line-height: 0.96;
      letter-spacing: -2.8px;
    }
    .panel {
      margin-top: 18px;
      padding: 34px;
      border-radius: 34px;
      background: rgba(6, 16, 29, 0.48);
      border: 1px solid rgba(255,255,255,0.09);
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
      font-size: 37px;
      line-height: 1.28;
      margin-bottom: 18px;
      color: #eef7ff;
    }
    .dot {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: #ffb35c;
      flex: 0 0 auto;
      margin-top: 6px;
    }
    .quote {
      margin-top: 34px;
      padding: 34px;
      border-radius: 34px;
      background: linear-gradient(135deg, rgba(255,179,92,0.2), rgba(143,231,221,0.14));
      font-size: 44px;
      line-height: 1.34;
      color: #fff8f0;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .spacer { flex: 1; }
    .cta {
      padding: 26px 30px;
      border-radius: 24px;
      background: #ffb35c;
      color: #082033;
      text-align: center;
      font-size: 40px;
      font-weight: 900;
    }
    .subcta {
      margin-top: 18px;
      text-align: center;
      font-size: 30px;
      line-height: 1.35;
      color: #dceaf6;
    }
    .brand {
      margin-top: 18px;
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
    <div class="badge">${sample.type}</div>
    <div class="eyebrow">Contenido util con enfoque comercial</div>
    <h1>${sample.title}</h1>
    <div class="panel">
      <div class="panel-label">Esto te interesa si buscas</div>
      <div class="bullet"><span class="dot"></span><span>${sample.bullets[0]}</span></div>
      <div class="bullet"><span class="dot"></span><span>${sample.bullets[1]}</span></div>
      <div class="bullet" style="margin-bottom:0;"><span class="dot"></span><span>${sample.bullets[2]}</span></div>
    </div>
    <div class="quote">${sample.summary}</div>
    <div class="spacer"></div>
    <div class="cta">Responde a esta story y te orientamos</div>
    <div class="subcta">${sample.question}</div>
    <div class="brand">${sample.url}</div>
  </div>
</body>
</html>`,
  },
  {
    key: 'concepto-b-editorial',
    label: 'Editorial',
    buildPost: () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1080px;
      height: 1350px;
      background: linear-gradient(145deg, #f4efe7 0%, #efe2d1 45%, #d9c3aa 100%);
      color: #26170f;
      font-family: Georgia, 'Times New Roman', serif;
      padding: 56px;
    }
    .sheet {
      width: 100%;
      height: 100%;
      border-radius: 34px;
      background: rgba(255,248,240,0.88);
      padding: 60px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 28px 70px rgba(74,40,18,0.14);
      border: 1px solid rgba(38,23,15,0.08);
    }
    .meta {
      display: flex;
      justify-content: space-between;
      font-family: 'Arial Narrow', Arial, sans-serif;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 22px;
      color: #8b5e3b;
    }
    h1 {
      margin: 34px 0 24px;
      font-size: 88px;
      line-height: 0.95;
      letter-spacing: -2px;
      max-width: 760px;
    }
    .summary {
      font-size: 36px;
      line-height: 1.45;
      max-width: 760px;
      color: #4b3325;
    }
    .divider {
      margin: 34px 0;
      height: 1px;
      background: rgba(38,23,15,0.16);
    }
    .value {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 24px;
      align-items: start;
      font-family: 'Arial Narrow', Arial, sans-serif;
    }
    .value-label {
      font-size: 22px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #8b5e3b;
    }
    .value-copy {
      font-size: 34px;
      line-height: 1.4;
      color: #26170f;
    }
    .spacer { flex: 1; }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 24px;
    }
    .question {
      max-width: 520px;
      font-size: 31px;
      line-height: 1.35;
    }
    .cta {
      padding: 18px 24px;
      border-radius: 18px;
      background: #26170f;
      color: #f6ede2;
      font-family: 'Arial Narrow', Arial, sans-serif;
      text-transform: uppercase;
      letter-spacing: 1.6px;
      font-size: 22px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="meta">
      <span>${sample.type}</span>
      <span>${sample.url}</span>
    </div>
    <h1>${sample.title}</h1>
    <div class="summary">${sample.summary}</div>
    <div class="divider"></div>
    <div class="value">
      <div class="value-label">Resultado</div>
      <div class="value-copy">${sample.value}</div>
    </div>
    <div class="spacer"></div>
    <div class="footer">
      <div class="question">${sample.question}</div>
      <div class="cta">Pide una idea aplicada a tu caso</div>
    </div>
  </div>
</body>
</html>`,
    buildStory: () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1080px;
      height: 1920px;
      background: linear-gradient(180deg, #f5efe7 0%, #e6d3be 100%);
      color: #26170f;
      font-family: Georgia, 'Times New Roman', serif;
      padding: 54px;
    }
    .story {
      width: 100%;
      height: 100%;
      border-radius: 38px;
      background: rgba(255,250,244,0.86);
      padding: 58px;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(38,23,15,0.08);
    }
    .meta {
      font-family: 'Arial Narrow', Arial, sans-serif;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 24px;
      color: #8b5e3b;
    }
    h1 {
      margin: 26px 0 28px;
      font-size: 98px;
      line-height: 0.95;
      letter-spacing: -2.6px;
    }
    .summary {
      padding: 30px;
      border-left: 6px solid #8b5e3b;
      font-size: 45px;
      line-height: 1.34;
      background: rgba(139,94,59,0.08);
    }
    .grid {
      margin-top: 30px;
      display: grid;
      gap: 16px;
    }
    .chip {
      padding: 20px 24px;
      border-radius: 18px;
      background: rgba(38,23,15,0.06);
      font-size: 34px;
      line-height: 1.3;
    }
    .spacer { flex: 1; }
    .cta {
      padding: 26px 28px;
      border-radius: 22px;
      background: #26170f;
      color: #f6ede2;
      text-align: center;
      font-family: 'Arial Narrow', Arial, sans-serif;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 30px;
    }
    .subcta {
      margin-top: 18px;
      text-align: center;
      font-size: 30px;
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <div class="story">
    <div class="meta">${sample.type} · ${sample.url}</div>
    <h1>${sample.title}</h1>
    <div class="summary">${sample.summary}</div>
    <div class="grid">
      <div class="chip">${sample.bullets[0]}</div>
      <div class="chip">${sample.bullets[1]}</div>
      <div class="chip">${sample.bullets[2]}</div>
    </div>
    <div class="spacer"></div>
    <div class="cta">Responder y pedir una idea concreta</div>
    <div class="subcta">${sample.question}</div>
  </div>
</body>
</html>`,
  },
  {
    key: 'concepto-c-impacto',
    label: 'Impacto',
    buildPost: () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1080px;
      height: 1350px;
      background:
        radial-gradient(circle at 18% 16%, rgba(255,255,255,0.08), transparent 20%),
        linear-gradient(135deg, #0a0a0a 0%, #1e1e1e 45%, #343434 100%);
      color: white;
      font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
      padding: 50px;
    }
    .poster {
      width: 100%;
      height: 100%;
      border-radius: 36px;
      background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
      border: 2px solid rgba(255,255,255,0.08);
      padding: 56px;
      display: flex;
      flex-direction: column;
    }
    .meta {
      font-size: 28px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #ffd34f;
    }
    h1 {
      margin: 28px 0 24px;
      font-size: 104px;
      line-height: 0.9;
      letter-spacing: 0.5px;
      max-width: 840px;
    }
    .summary {
      max-width: 820px;
      font-size: 33px;
      line-height: 1.35;
      font-family: 'Arial Narrow', Arial, sans-serif;
      color: rgba(255,255,255,0.86);
    }
    .banner {
      margin-top: 34px;
      padding: 22px 26px;
      border-radius: 22px;
      background: #ffd34f;
      color: #111;
      font-size: 34px;
      line-height: 1.22;
      max-width: 860px;
    }
    .spacer { flex: 1; }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 24px;
    }
    .question {
      max-width: 520px;
      font-size: 30px;
      line-height: 1.3;
      font-family: 'Arial Narrow', Arial, sans-serif;
    }
    .cta {
      border: 2px solid #ffd34f;
      border-radius: 18px;
      padding: 16px 22px;
      color: #ffd34f;
      font-size: 26px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="poster">
    <div class="meta">${sample.type} · ${sample.url}</div>
    <h1>${sample.title}</h1>
    <div class="summary">${sample.summary}</div>
    <div class="banner">${sample.value}</div>
    <div class="spacer"></div>
    <div class="footer">
      <div class="question">${sample.question}</div>
      <div class="cta">Pregunta por tu caso</div>
    </div>
  </div>
</body>
</html>`,
    buildStory: () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1080px;
      height: 1920px;
      background: linear-gradient(180deg, #080808 0%, #1a1a1a 100%);
      color: white;
      font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
      padding: 50px;
    }
    .story {
      width: 100%;
      height: 100%;
      border-radius: 40px;
      border: 2px solid rgba(255,255,255,0.1);
      padding: 56px;
      display: flex;
      flex-direction: column;
      background:
        radial-gradient(circle at top right, rgba(255,211,79,0.12), transparent 20%),
        rgba(255,255,255,0.02);
    }
    .meta {
      font-size: 24px;
      text-transform: uppercase;
      letter-spacing: 1.4px;
      color: #ffd34f;
    }
    h1 {
      margin: 26px 0;
      font-size: 112px;
      line-height: 0.9;
    }
    .bar {
      padding: 18px 22px;
      border-radius: 18px;
      background: #ffd34f;
      color: #111;
      font-size: 30px;
    }
    .list {
      margin-top: 26px;
      display: grid;
      gap: 16px;
      font-family: 'Arial Narrow', Arial, sans-serif;
    }
    .item {
      padding: 18px 22px;
      border-radius: 18px;
      background: rgba(255,255,255,0.08);
      font-size: 34px;
      line-height: 1.25;
    }
    .spacer { flex: 1; }
    .cta {
      padding: 26px 28px;
      border-radius: 22px;
      background: #ffd34f;
      color: #111;
      text-align: center;
      font-size: 38px;
    }
    .subcta {
      margin-top: 18px;
      text-align: center;
      font-family: 'Arial Narrow', Arial, sans-serif;
      font-size: 30px;
      line-height: 1.3;
      color: rgba(255,255,255,0.86);
    }
  </style>
</head>
<body>
  <div class="story">
    <div class="meta">${sample.type}</div>
    <h1>${sample.title}</h1>
    <div class="bar">${sample.summary}</div>
    <div class="list">
      <div class="item">${sample.bullets[0]}</div>
      <div class="item">${sample.bullets[1]}</div>
      <div class="item">${sample.bullets[2]}</div>
    </div>
    <div class="spacer"></div>
    <div class="cta">Responde y te decimos como aplicarlo</div>
    <div class="subcta">${sample.question}</div>
  </div>
</body>
</html>`,
  },
];

async function renderImage(html, width, height, targetFile) {
  const response = await fetch('http://192.168.31.199:3001/screenshot?token=tesia_bless', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, viewport: { width, height } }),
  });

  if (!response.ok) {
    throw new Error(`Render failed for ${targetFile}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(targetFile, buffer);
}

await mkdir(outDir, { recursive: true });

for (const concept of concepts) {
  const postFile = path.join(outDir, `${concept.key}-post.png`);
  const storyFile = path.join(outDir, `${concept.key}-story.png`);
  await renderImage(concept.buildPost(), 1080, 1350, postFile);
  await renderImage(concept.buildStory(), 1080, 1920, storyFile);
  console.log(`${concept.label}:`);
  console.log(`  ${postFile}`);
  console.log(`  ${storyFile}`);
}
