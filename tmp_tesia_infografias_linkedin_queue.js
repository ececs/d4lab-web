import { workflow, node, trigger, expr } from '@n8n/workflow-sdk';

const scheduleTrigger = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.2,
  config: {
    name: 'Schedule_Trigger',
    position: [0, -160],
    parameters: {
      rule: {
        interval: [
          {
            field: 'cronExpression',
            expression: '0 0 9 * * *',
          },
        ],
      },
    },
  },
});

const manualTrigger = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: {
    name: 'Manual_Trigger',
    position: [0, 0],
    parameters: {},
  },
});

const firestoreListInfografias = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Firestore_List_Infografias',
    position: [260, -80],
    parameters: {
      method: 'POST',
      url: 'https://firestore.googleapis.com/v1/projects/tai-examenes/databases/(default)/documents:runQuery',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleFirebaseCloudFirestoreOAuth2Api',
      sendBody: true,
      specifyBody: 'json',
      jsonBody:
        '{ "structuredQuery": { "from": [{"collectionId": "preguntas"}], "where": { "fieldFilter": { "field": {"fieldPath": "infografiaUrl"}, "op": "GREATER_THAN", "value": {"stringValue": ""} } }, "limit": 200 } }',
      options: {},
    },
  },
});

const aggregateInfografias = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Aggregate_Infografias',
    position: [500, -80],
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `const results = $input.all();
const seenDriveIds = new Set();
const infografias = [];

function extractDriveFileId(url = '') {
  const raw = String(url || '').trim();
  if (!raw) return '';

  const patterns = [
    /\\/d\\/([a-zA-Z0-9_-]{10,})/i,
    /[?&]id=([a-zA-Z0-9_-]{10,})/i,
    /\\/uc\\?(?:[^#]*&)?id=([a-zA-Z0-9_-]{10,})/i,
    /\\/thumbnail\\?(?:[^#]*&)?id=([a-zA-Z0-9_-]{10,})/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) return match[1];
  }

  return '';
}

for (const r of results) {
  const doc = r.json.document;
  if (!doc) continue;

  const fields = doc.fields || {};
  const infografiaUrl = fields.infografiaUrl?.stringValue || '';
  if (!infografiaUrl) continue;

  const driveFileId = extractDriveFileId(infografiaUrl);
  if (!driveFileId || seenDriveIds.has(driveFileId)) continue;

  seenDriveIds.add(driveFileId);

  const preguntaId = doc.name.split('/').pop();
  const temaTitulo = fields.temaTitulo?.stringValue || fields.utTitulo?.stringValue || fields.tema?.stringValue || '';
  const asignatura = fields.asignatura?.stringValue || '';
  const siglaNueva = fields.siglaNueva?.stringValue || '';
  const resumenEstudio = (fields.resumenEstudio?.stringValue || '').substring(0, 600);

  infografias.push({
    preguntaId,
    temaTitulo,
    asignatura,
    siglaNueva,
    driveFileId,
    infografiaUrl,
    resumenEstudio,
  });
}

console.log('Infografias únicas (por driveFileId):', infografias.length);
return [{ json: { infografias } }];`,
    },
  },
});

const getLiQueue = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get_LI_Queue',
    position: [740, -80],
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: {
        mode: 'id',
        value: 'tRWM4ah3VVFGMnNB',
      },
    },
  },
});

const pickOne = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Pick_One',
    position: [980, -80],
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `const { infografias } = $('Aggregate_Infografias').first().json;
const queueRows = $input.all().map((r) => r.json);
const queuedDriveIds = new Set(queueRows.map((r) => r.source_row_id).filter(Boolean));
const pending = infografias.filter((i) => i.driveFileId && !queuedDriveIds.has(i.driveFileId));

console.log('Infografias pendientes:', pending.length, '/', infografias.length);

if (pending.length === 0) {
  throw new Error('Sin infografias nuevas - todas ya están en cola');
}

return [{ json: pending[0] }];`,
    },
  },
});

const prepGemini = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Prep_Gemini',
    position: [1220, -80],
    parameters: {
      mode: 'runOnceForEachItem',
      jsCode: `const { preguntaId, temaTitulo, asignatura, siglaNueva, driveFileId, resumenEstudio, infografiaUrl } = $json;
const topic = temaTitulo || asignatura || 'material educativo';
const subject = [asignatura, siglaNueva].filter(Boolean).join(' - ');
const context = resumenEstudio ? '\\n- Extracto del contenido: "' + resumenEstudio + '"' : '';
const prompt = \`Eres el community manager de TesIA.es, plataforma de preparación de exámenes con IA para estudiantes universitarios en España.

Escribe un post de LinkedIn (máximo 1200 caracteres) presentando esta infografía educativa:
- Tema: "\${topic}"
- Asignatura: "\${subject}"\${context}

Tono: útil, cercano, motivador. Dirigido a estudiantes universitarios y sus familias.
Estructura: 1 frase de gancho potente, 2-3 frases sobre el valor de la infografía para el estudio, cierre con CTA sutil a TesIA.es.
No uses bullet points. Escribe en párrafos.
Termina con: #TesIA #EstudioConIA #Apuntes #Universidad #EstudianteUniversitario #IAEducativa\`;

const geminiBody = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: { temperature: 0.8, maxOutputTokens: 500 },
};

return {
  json: {
    preguntaId,
    temaTitulo,
    asignatura,
    driveFileId,
    infografiaUrl,
    gemini_key: 'AIzaSyBN41V3EIT0CTpn3SjnsCSqI3zZDh0VvbE',
    gemini_body: JSON.stringify(geminiBody),
  },
};`,
    },
  },
});

const geminiCall = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Gemini_Call',
    position: [1460, -80],
    parameters: {
      mode: 'runOnceForEachItem',
      jsCode: `const item = $input.item.json;
const apiKey = item.gemini_key;
const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + apiKey;
const geminiBody = JSON.parse(item.gemini_body);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let response;

for (let attempt = 1; attempt <= 4; attempt++) {
  try {
    response = await this.helpers.httpRequest({ method: 'POST', url: geminiUrl, body: geminiBody, json: true });
    break;
  } catch (err) {
    const status = err.response?.status || err.statusCode || 0;
    if ((status === 503 || status === 429 || status === 500) && attempt < 4) {
      await wait(attempt * 15000);
    } else {
      throw err;
    }
  }
}

if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
  throw new Error('Gemini sin contenido: ' + JSON.stringify(response).slice(0, 500));
}

return {
  json: {
    ...item,
    generated_caption: response.candidates[0].content.parts[0].text,
  },
};`,
    },
  },
});

const downloadInfografia = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Download_Infografia',
    position: [1700, -80],
    parameters: {
      mode: 'runOnceForEachItem',
      jsCode: `const item = $json;
const directImageUrl = 'https://drive.usercontent.google.com/download?id=' + item.driveFileId + '&export=download';

return {
  json: {
    ...item,
    directImageUrl,
  },
};`,
    },
  },
});

const formatPost = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Format_Post',
    position: [1940, -80],
    parameters: {
      mode: 'runOnceForEachItem',
      jsCode: `const meta = $json;
const imageUrl = String(meta.directImageUrl || '').trim();
if (!imageUrl) {
  throw new Error('No se pudo construir la URL directa de la infografía.');
}

const caption = String(meta.generated_caption || '').trim();
const titulo = String(meta.temaTitulo || meta.asignatura || 'Infografía TesIA').substring(0, 200);

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\"/g, '&quot;');
}

const html_final = \`<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1080px; overflow: hidden;
  background: #0A192F; position: relative;
  display: flex; align-items: center; justify-content: center;
}
img.main { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
.overlay {
  position: absolute; bottom: 0; left: 0; right: 0; height: 80px;
  background: linear-gradient(transparent, rgba(10,25,47,0.92));
  display: flex; align-items: center; padding: 0 32px; justify-content: space-between;
}
.brand { color: #64FFDA; font-family: sans-serif; font-size: 22px; font-weight: 800; letter-spacing: 1px; }
.badge { color: #CCD6F6; font-family: sans-serif; font-size: 15px; background: rgba(100,255,218,0.12); padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(100,255,218,0.25); }
</style></head>
<body>
<img class="main" src="\${esc(imageUrl)}" />
<div class="overlay">
  <span class="brand">TesIA.es</span>
  <span class="badge">📚 Infografía de estudio</span>
</div>
</body></html>\`;

return {
  json: {
    preguntaId: meta.preguntaId,
    titulo,
    caption,
    html_final,
    tipo: 'Infografia',
    estado: 'pendiente',
    intentos: 0,
    source_row_id: meta.driveFileId,
  },
};`,
    },
  },
});

const insertLiQueue = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Insert_LI_Queue',
    position: [2180, -80],
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: {
        mode: 'id',
        value: 'tRWM4ah3VVFGMnNB',
      },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          titulo: expr('{{ $json.titulo }}'),
          caption: expr('{{ $json.caption }}'),
          html_final: expr('{{ $json.html_final }}'),
          tipo: 'Infografia',
          estado: 'pendiente',
          intentos: expr('{{ 0 }}'),
          source_row_id: expr('{{ $json.source_row_id }}'),
        },
      },
      options: {},
    },
  },
});

const done = node({
  type: 'n8n-nodes-base.noOp',
  version: 1,
  config: {
    name: 'Done',
    position: [2420, -80],
    parameters: {},
  },
});

const webhookTest = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Webhook_Test',
    position: [0, 160],
    parameters: {
      path: 'infografias-li-test',
      responseMode: 'onReceived',
    },
  },
});

const firestoreQueueTesiaSocial = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.2,
  config: {
    name: 'Firestore_Queue_TesIA_Social',
    position: [2420, 80],
    parameters: {
      method: 'POST',
      url: 'https://firestore.googleapis.com/v1/projects/tai-examenes/databases/(default)/documents/_social_cola',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'googleFirebaseCloudFirestoreOAuth2Api',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr(`{{ JSON.stringify({
        fields: {
          tipo: { stringValue: 'infografia' },
          estado: { stringValue: 'pendiente' },
          driveFileId: { stringValue: $('Pick_One').first().json.driveFileId },
          titulo: { stringValue: $('Format_Post').first().json.titulo },
          caption: { stringValue: $('Format_Post').first().json.caption.substring(0, 1200) },
          preguntaId: { stringValue: $('Pick_One').first().json.preguntaId },
          creadoEn: { stringValue: new Date().toISOString() },
        },
      }) }}`),
      options: {},
    },
  },
});

export default workflow('YHHm1PhURH5McEE4', '🖼️ TesIA Infografías → LinkedIn Queue')
  .add(scheduleTrigger)
  .to(firestoreListInfografias)
  .to(aggregateInfografias)
  .to(getLiQueue)
  .to(pickOne)
  .to(prepGemini)
  .to(geminiCall)
  .to(downloadInfografia)
  .to(formatPost)
  .to(insertLiQueue)
  .to(firestoreQueueTesiaSocial)
  .to(done)
  .add(manualTrigger)
  .to(firestoreListInfografias)
  .add(webhookTest)
  .to(firestoreListInfografias);
