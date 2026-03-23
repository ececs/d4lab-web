// api/chat.js — Vercel Serverless Function
// Llama a Gemini 2.0 Flash con Google Search grounding
// Detecta presupuestos y envía email via Resend

const SYSTEM_PROMPT = `Eres el asistente virtual de D4Lab, el estudio tecnológico de Eudaldo Cal Saul, ubicado en San Isidro, Santa Cruz de Tenerife. Tu misión es ayudar a los visitantes a entender los servicios disponibles y calcular presupuestos estimados de forma precisa.

## INFORMACIÓN DE D4Lab
- Propietario: Eudaldo Cal Saul
- Ubicación base: San Isidro, Santa Cruz de Tenerife (Canarias)
- WhatsApp: +34 666 750 753
- Email: eudaldocal@gmail.com
- Web: d4lab.es

## SERVICIOS Y TARIFAS

### SOPORTE IT
| Perfil | Modalidad | Tarifa |
|--------|-----------|--------|
| Particular | Remoto | 30 €/hora (sin desplazamiento) |
| Particular | Presencial | 30 €/hora + coste de desplazamiento |
| Empresa | Remoto | 50 €/hora (sin desplazamiento) |
| Empresa | Presencial | 50 €/hora + coste de desplazamiento |

### COSTE DE DESPLAZAMIENTO (solo si es presencial)
- Coste por km: 0,30 € × km por carretera (ida y vuelta)
- Más el tiempo de conducción a la tarifa horaria correspondiente
- ⚠️ MUY IMPORTANTE — Distancias en Tenerife:
  Tenerife tiene una orografía muy montañosa. Las distancias por carretera son FRECUENTEMENTE el doble o el triple de la distancia en línea recta, porque las carreteras rodean la montaña central del Teide.
  SIEMPRE busca en Google la distancia y el tiempo reales por carretera desde "San Isidro, Tenerife" al destino indicado.
  Ejemplo: San Isidro → Puerto de la Cruz son solo ~35 km en línea recta, pero ~85-90 km y unos 70-80 min por carretera.
  Nunca uses distancias en línea recta.

### DESARROLLO WEB / APPS
- Landing page sencilla: 300–600 €
- Web corporativa: 600–1.500 €
- Tienda online (e-commerce): 800–2.000 €
- App web o móvil a medida: desde 1.500 €

### OTROS SERVICIOS
- Integración de IA (chatbots, automatizaciones): presupuesto según proyecto
- Infraestructura IT y redes: presupuesto según proyecto
- Domótica e instalaciones: presupuesto según proyecto (siempre presencial)

## FLUJO DE CONVERSACIÓN

### Para SOPORTE IT:
1. Preguntar si es para un particular o una empresa (afecta a la tarifa)
2. Pedir descripción detallada del problema o trabajo a realizar
3. Analizar si el problema puede resolverse en remoto o requiere presencia física:
   - REMOTO (posible): configuración de software, virus/malware, problemas de red por software, configuración de email o cuentas, instalación de programas, soporte Windows/Mac/Linux, acceso remoto, backup
   - PRESENCIAL (necesario): fallo de hardware físico (disco, RAM, fuente), cambio o instalación de piezas, instalación de redes físicas, cableado, impresoras/periféricos que no funcionan, domótica, instalaciones
4. Comunicar al cliente claramente si el servicio es remoto o requiere desplazamiento y por qué
5. Si es presencial: preguntar municipio o dirección → buscar en Google la distancia real por carretera y el tiempo de conducción desde San Isidro, Tenerife
6. Estimar la duración del trabajo basándose en la descripción del problema
7. Calcular presupuesto total: (horas estimadas × tarifa/hora) + desplazamiento si aplica
8. Incluir SIEMPRE el aviso de que el presupuesto es orientativo

### Para DESARROLLO WEB / APPS:
1. Preguntar si es para un particular o una empresa
2. Si el cliente dice que es empresa: preguntar el nombre de la empresa indicando que es opcional: "¿Cuál es el nombre de tu empresa? (opcional — nos ayuda a personalizar el presupuesto)". Si lo proporciona, buscar en Google información sobre ella (sector, tamaño, empleados, facturación aproximada) para personalizar el trato. Si prefiere no darlo, continuar normalmente sin esa información
3. Preguntar por el alcance del proyecto: funcionalidades deseadas, si tiene diseño ya definido, plazo deseado
4. Dar estimación de tiempo de desarrollo y coste total

### Para OTROS SERVICIOS:
1. Recopilar información sobre el proyecto o necesidad
2. Indicar que se dará un presupuesto personalizado y ofrecer continuar por WhatsApp

## NORMAS IMPORTANTES
- Responde SIEMPRE en el idioma del usuario (español si no se especifica otro)
- Tono: profesional, directo y amigable
- No inventes precios fuera de los indicados en esta ficha
- Si tienes dudas sobre el alcance técnico, indícalo y ofrece que Eudaldo lo confirmará personalmente
- SIEMPRE que presentes un presupuesto, incluye el aviso: "Este presupuesto es orientativo y puede variar tras el diagnóstico completo o la revisión in situ. Nos comprometemos a intentar ajustarnos al importe indicado."
- Al finalizar un presupuesto, ofrece continuar la conversación por WhatsApp: +34 666 750 753 para cerrar los detalles

## BLOQUE DE PRESUPUESTO — OBLIGATORIO
Cuando presentes cualquier presupuesto (aunque sea estimado), incluye AL FINAL de tu respuesta el siguiente bloque exacto. El sistema lo procesa automáticamente y el cliente NO lo verá. Rellena todos los campos:

<BUDGET_SUMMARY>
{"cliente_nombre":"NOMBRE_O_DESCONOCIDO","cliente_empresa":"EMPRESA_O_VACIO","tipo_cliente":"particular|empresa","modalidad":"remoto|presencial|mixto","descripcion":"DESCRIPCION_BREVE_DEL_TRABAJO","horas_estimadas":0,"tarifa_hora":0,"km_desplazamiento":0,"coste_desplazamiento":0,"total_estimado":0,"notas":"NOTAS_ADICIONALES"}
</BUDGET_SUMMARY>`;

// Construye el HTML del email con la conversación y el resumen del presupuesto
function buildEmailHtml(messages, summary, fecha) {
  const conversacionHtml = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(msg => {
      const isUser = msg.role === 'user';
      const contenido = (msg.content || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      return `
      <div style="margin:8px 0;padding:12px 16px;border-radius:6px;background:${isUser ? '#1d2d50' : '#0d1b2e'};border-left:3px solid ${isUser ? '#64FFDA' : '#8892b0'}">
        <div style="color:${isUser ? '#64FFDA' : '#8892b0'};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px">
          ${isUser ? '👤 Cliente' : '🤖 D4Lab Bot'}
        </div>
        <div style="color:#ccd6f6;font-size:14px;line-height:1.6">${contenido}</div>
      </div>`;
    }).join('');

  const desplazamientoRow = summary.km_desplazamiento > 0
    ? `<tr><td style="color:#8892b0;font-size:13px;padding:6px 0;border-bottom:1px solid rgba(100,255,218,0.1)">Desplazamiento (${summary.km_desplazamiento} km ida/vuelta)</td><td style="color:#ccd6f6;font-size:13px;text-align:right;padding:6px 0;border-bottom:1px solid rgba(100,255,218,0.1)">${summary.coste_desplazamiento} €</td></tr>`
    : '';

  const horasRow = summary.horas_estimadas > 0
    ? `<tr><td style="color:#8892b0;font-size:13px;padding:6px 0;border-bottom:1px solid rgba(100,255,218,0.1)">Trabajo (${summary.horas_estimadas}h × ${summary.tarifa_hora} €/h)</td><td style="color:#ccd6f6;font-size:13px;text-align:right;padding:6px 0;border-bottom:1px solid rgba(100,255,218,0.1)">${(summary.horas_estimadas * summary.tarifa_hora).toFixed(0)} €</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Nuevo presupuesto D4Lab</title>
</head>
<body style="margin:0;padding:0;background:#020c1b;font-family:Inter,'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:620px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#112240,#1d2d50);border:1px solid rgba(100,255,218,0.25);border-radius:8px;padding:24px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <span style="font-family:monospace;font-size:20px;font-weight:700;color:#64FFDA">D4Lab</span>
        <span style="font-size:20px">🤖</span>
      </div>
      <h1 style="margin:0 0 4px;color:#ffffff;font-size:22px;font-weight:700">Nuevo presupuesto generado</h1>
      <p style="margin:0;color:#8892b0;font-size:12px">${fecha}</p>
    </div>

    <!-- Datos del cliente -->
    <div style="background:#112240;border:1px solid rgba(100,255,218,0.15);border-radius:8px;padding:20px;margin-bottom:16px">
      <h2 style="margin:0 0 14px;color:#64FFDA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em">Datos del cliente</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="color:#8892b0;font-size:12px;padding:5px 0;width:130px;vertical-align:top">Nombre</td>
          <td style="color:#ccd6f6;font-size:14px;font-weight:600;padding:5px 0">${summary.cliente_nombre || '—'}</td>
        </tr>
        ${summary.cliente_empresa ? `<tr><td style="color:#8892b0;font-size:12px;padding:5px 0;vertical-align:top">Empresa</td><td style="color:#ccd6f6;font-size:14px;padding:5px 0">${summary.cliente_empresa}</td></tr>` : ''}
        <tr>
          <td style="color:#8892b0;font-size:12px;padding:5px 0;vertical-align:top">Tipo cliente</td>
          <td style="color:#ccd6f6;font-size:14px;padding:5px 0;text-transform:capitalize">${summary.tipo_cliente || '—'}</td>
        </tr>
        <tr>
          <td style="color:#8892b0;font-size:12px;padding:5px 0;vertical-align:top">Modalidad</td>
          <td style="padding:5px 0">
            <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;background:${summary.modalidad === 'remoto' ? 'rgba(100,255,218,0.1)' : 'rgba(255,180,50,0.15)'};color:${summary.modalidad === 'remoto' ? '#64FFDA' : '#ffb432'};text-transform:capitalize">${summary.modalidad || '—'}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Descripción y presupuesto -->
    <div style="background:#112240;border:1px solid rgba(100,255,218,0.15);border-radius:8px;padding:20px;margin-bottom:16px">
      <h2 style="margin:0 0 10px;color:#64FFDA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em">Trabajo solicitado</h2>
      <p style="margin:0 0 18px;color:#ccd6f6;font-size:14px;line-height:1.6">${(summary.descripcion || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>

      <h2 style="margin:0 0 10px;color:#64FFDA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em">Desglose del presupuesto</h2>
      <table style="width:100%;border-collapse:collapse">
        ${horasRow}
        ${desplazamientoRow}
        <tr>
          <td style="color:#ffffff;font-size:15px;font-weight:700;padding:10px 0 4px">TOTAL ESTIMADO</td>
          <td style="text-align:right;padding:10px 0 4px">
            <span style="color:#64FFDA;font-size:22px;font-weight:700">${summary.total_estimado} €</span>
            <span style="color:#8892b0;font-size:11px;margin-left:4px">+ IVA</span>
          </td>
        </tr>
      </table>

      ${summary.notas ? `<div style="margin-top:12px;padding:10px 14px;background:rgba(100,255,218,0.05);border-radius:4px;border-left:2px solid rgba(100,255,218,0.3)"><p style="margin:0;color:#8892b0;font-size:12px"><strong style="color:#64FFDA">Notas:</strong> ${(summary.notas || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>` : ''}

      <p style="margin:12px 0 0;color:#8892b0;font-size:11px;font-style:italic">⚠️ Presupuesto orientativo. Puede variar tras diagnóstico completo o revisión in situ.</p>
    </div>

    <!-- Conversación completa -->
    <div style="background:#112240;border:1px solid rgba(100,255,218,0.15);border-radius:8px;padding:20px">
      <h2 style="margin:0 0 14px;color:#64FFDA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em">Conversación completa</h2>
      ${conversacionHtml}
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;margin-top:8px">
      <p style="margin:0;color:#8892b0;font-size:11px">D4Lab · Eudaldo Cal Saul · San Isidro, S.C. de Tenerife · d4lab.es</p>
    </div>

  </div>
</body>
</html>`;
}

// Envía el email de notificación vía Resend API
async function sendBudgetEmail(messages, summary) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[D4Lab] RESEND_API_KEY no configurada, omitiendo envío de email');
    return;
  }

  const fecha = new Date().toLocaleString('es-ES', {
    timeZone: 'Atlantic/Canary',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const html = buildEmailHtml(messages, summary, fecha);
  const nombre = summary.cliente_nombre && summary.cliente_nombre !== 'NOMBRE_O_DESCONOCIDO'
    ? summary.cliente_nombre
    : 'Cliente';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'D4Lab Bot <onboarding@resend.dev>',
      to: [process.env.NOTIFY_EMAIL || 'eudaldocal@gmail.com'],
      subject: `🤖 Nuevo presupuesto D4Lab — ${nombre} — ${summary.total_estimado || '?'} € (est.)`,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('[D4Lab] Error Resend:', response.status, err);
  } else {
    console.log('[D4Lab] Email de presupuesto enviado correctamente');
  }
}

// Handler principal de la función serverless
module.exports = async function handler(req, res) {
  // CORS — permite llamadas desde cualquier origen (la web es estática en el mismo dominio)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages requerido' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
  }

  // Convertir historial al formato de Gemini (role: user|model)
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('[D4Lab] Gemini API error:', geminiRes.status, errBody);
      return res.status(502).json({
        error: 'Error al conectar con el asistente. Por favor, inténtalo de nuevo o contacta directamente por WhatsApp.',
      });
    }

    const data = await geminiRes.json();
    const candidate = data.candidates?.[0];

    if (!candidate) {
      return res.status(502).json({ error: 'Respuesta vacía del asistente.' });
    }

    // Extraer texto de todas las partes (puede haber varias cuando hay grounding)
    const parts = candidate.content?.parts || [];
    const responseText = parts.filter(p => p.text).map(p => p.text).join('');

    // Detectar bloque de presupuesto
    const budgetMatch = responseText.match(/<BUDGET_SUMMARY>\s*([\s\S]*?)\s*<\/BUDGET_SUMMARY>/);
    let budgetDetected = false;

    if (budgetMatch) {
      budgetDetected = true;
      try {
        const summary = JSON.parse(budgetMatch[1]);
        // Enviar email en background (no bloqueamos la respuesta)
        sendBudgetEmail(messages, summary).catch(e =>
          console.error('[D4Lab] Error enviando email:', e)
        );
      } catch (e) {
        console.error('[D4Lab] Error parseando BUDGET_SUMMARY:', e, '\nContenido:', budgetMatch[1]);
      }
    }

    // Limpiar el bloque BUDGET_SUMMARY de la respuesta visible al usuario
    const cleanResponse = responseText
      .replace(/<BUDGET_SUMMARY>[\s\S]*?<\/BUDGET_SUMMARY>/g, '')
      .trim();

    return res.status(200).json({ reply: cleanResponse, budgetDetected });
  } catch (error) {
    console.error('[D4Lab] Error inesperado:', error);
    return res.status(500).json({
      error: 'Error inesperado. Por favor, inténtalo de nuevo o escríbenos por WhatsApp.',
    });
  }
};
