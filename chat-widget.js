/**
 * chat-widget.js — Chatbot D4Lab
 * Widget flotante standalone. No requiere ninguna dependencia externa.
 * Se inyecta en todas las páginas via <script src="/chat-widget.js"></script>
 */
(function () {
  'use strict';

  // ─── Configuración ───────────────────────────────────────────────────────────
  var CFG = {
    whatsapp: '34666750753',
    api: '/api/chat',
    templateStorageKey: 'd4lab:selected-template',
    welcomeMsg: '¡Hola! Soy el asistente de **D4Lab**.\n\nPuedo ayudarte a resolver dudas sobre nuestros servicios y calcular un presupuesto estimado.\n\n¿En qué puedo ayudarte hoy?',
    quickActions: [
      { label: '💻 Solicitar presupuesto', msg: 'Hola, me gustaría solicitar un presupuesto para un proyecto.' },
      { label: '🔧 Soporte IT', msg: 'Necesito ayuda con soporte técnico.' },
      { label: '❓ Dudas sobre servicios', msg: 'Me gustaría saber más sobre los servicios que ofrecéis.' },
    ],
  };

  // ─── Estado ──────────────────────────────────────────────────────────────────
  var state = {
    open: false,
    messages: [],   // { role: 'user'|'assistant', content: string }
    loading: false,
    budgetSent: false,
    whatsappText: 'Hola D4Lab, me interesa vuestros servicios.',
    selectedTemplate: null,
  };

  // ─── Colores D4Lab ────────────────────────────────────────────────────────────
  var C = {
    primary:  '#64FFDA',
    onPrimary: '#001a14',
    surface:  '#0a192f',
    container: '#112240',
    containerHigh: '#1d2d50',
    text:     '#ccd6f6',
    muted:    '#8892b0',
    border:   'rgba(100,255,218,0.12)',
  };

  // ─── CSS ──────────────────────────────────────────────────────────────────────
  function injectStyles() {
    var s = document.createElement('style');
    s.id = 'd4chat-styles';
    s.textContent = [
      /* Botón flotante */
      '#d4chat-btn{position:fixed;bottom:28px;right:28px;z-index:9998;width:56px;height:56px;border-radius:50%;background:' + C.primary + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(100,255,218,0.35);transition:transform .2s,box-shadow .2s;outline:none}',
      '#d4chat-btn:hover{transform:scale(1.08);box-shadow:0 6px 32px rgba(100,255,218,0.5)}',
      '#d4chat-btn .material-symbols-outlined{color:' + C.onPrimary + ';font-size:26px;font-variation-settings:"FILL" 1}',
      '#d4chat-btn .d4chat-badge{position:absolute;top:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:#ff4f4f;border:2px solid ' + C.surface + ';animation:d4pulse 2s infinite}',
      '@keyframes d4pulse{0%,100%{opacity:1}50%{opacity:.5}}',

      /* Panel */
      '#d4chat-panel{position:fixed;bottom:100px;right:28px;z-index:9999;width:380px;max-height:580px;border-radius:12px;background:' + C.surface + ';border:1px solid ' + C.border + ';box-shadow:0 16px 60px rgba(0,0,0,0.6);display:flex;flex-direction:column;overflow:hidden;transition:opacity .2s,transform .2s}',
      '#d4chat-panel.d4chat-hidden{opacity:0;pointer-events:none;transform:translateY(16px) scale(.97)}',

      /* Header */
      '#d4chat-header{background:' + C.container + ';border-bottom:1px solid ' + C.border + ';padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}',
      '#d4chat-context{padding:10px 16px;border-bottom:1px solid ' + C.border + ';background:rgba(100,255,218,0.04);display:flex;align-items:flex-start;justify-content:space-between;gap:10px}',
      '#d4chat-context.d4chat-hidden{display:none}',
      '.d4chat-context-copy{display:flex;flex-direction:column;gap:3px}',
      '.d4chat-context-label{color:' + C.primary + ';font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em}',
      '.d4chat-context-title{color:#fff;font-size:13px;font-weight:700;font-family:"Space Grotesk",sans-serif}',
      '.d4chat-context-meta{color:' + C.muted + ';font-size:11px;line-height:1.4}',
      '#d4chat-context-clear{border:none;background:transparent;color:' + C.primary + ';font-size:11px;font-weight:600;cursor:pointer;padding:0;white-space:nowrap}',
      '#d4chat-context-clear:hover{text-decoration:underline}',
      '.d4chat-hinfo{display:flex;align-items:center;gap:10px}',
      '.d4chat-avatar{width:36px;height:36px;border-radius:8px;background:' + C.primary + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:' + C.onPrimary + ';font-family:"Space Grotesk",sans-serif;flex-shrink:0}',
      '.d4chat-hname{color:#fff;font-weight:700;font-size:13px;font-family:"Space Grotesk",sans-serif}',
      '.d4chat-hstatus{color:' + C.primary + ';font-size:10px;display:flex;align-items:center;gap:4px}',
      '.d4chat-dot{width:6px;height:6px;border-radius:50%;background:' + C.primary + ';animation:d4pulse 2s infinite}',
      '.d4chat-hbtns{display:flex;align-items:center;gap:4px}',
      '.d4chat-hbtns a,.d4chat-hbtns button{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:6px;border:1px solid ' + C.border + ';background:transparent;cursor:pointer;transition:background .2s;text-decoration:none}',
      '.d4chat-hbtns a:hover,.d4chat-hbtns button:hover{background:rgba(100,255,218,0.08)}',
      '.d4chat-hbtns a .material-symbols-outlined,.d4chat-hbtns button .material-symbols-outlined{color:' + C.primary + ';font-size:18px;font-variation-settings:"FILL" 0}',

      /* Mensajes */
      '#d4chat-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}',
      '#d4chat-msgs::-webkit-scrollbar{width:4px}',
      '#d4chat-msgs::-webkit-scrollbar-track{background:transparent}',
      '#d4chat-msgs::-webkit-scrollbar-thumb{background:rgba(100,255,218,0.2);border-radius:2px}',

      /* Burbuja mensaje */
      '.d4chat-msg{max-width:85%;display:flex;flex-direction:column;gap:2px}',
      '.d4chat-msg.user{align-self:flex-end;align-items:flex-end}',
      '.d4chat-msg.bot{align-self:flex-start;align-items:flex-start}',
      '.d4chat-bubble{padding:10px 14px;border-radius:12px;font-size:13.5px;line-height:1.6;color:' + C.text + ';word-break:break-word}',
      '.d4chat-msg.user .d4chat-bubble{background:rgba(100,255,218,0.12);border:1px solid rgba(100,255,218,0.2);border-bottom-right-radius:4px}',
      '.d4chat-msg.bot .d4chat-bubble{background:' + C.container + ';border:1px solid ' + C.border + ';border-bottom-left-radius:4px}',
      '.d4chat-bubble strong{color:' + C.primary + ';font-weight:600}',
      '.d4chat-bubble ul{margin:6px 0;padding-left:18px}',
      '.d4chat-bubble li{margin:3px 0}',
      '.d4chat-bubble code{background:rgba(100,255,218,0.1);padding:1px 5px;border-radius:3px;font-size:12px;font-family:monospace}',
      '.d4chat-bubble p{margin:0 0 8px}',
      '.d4chat-bubble p:last-child{margin-bottom:0}',
      '.d4chat-bubble h3,.d4chat-bubble h4{color:#fff;margin:8px 0 4px;font-size:13.5px}',

      /* Typing indicator */
      '#d4chat-typing{align-self:flex-start;padding:10px 16px;background:' + C.container + ';border:1px solid ' + C.border + ';border-radius:12px;border-bottom-left-radius:4px;display:flex;gap:5px;align-items:center}',
      '.d4chat-dot-bounce{width:7px;height:7px;border-radius:50%;background:' + C.muted + ';animation:d4bounce .9s infinite}',
      '.d4chat-dot-bounce:nth-child(2){animation-delay:.15s}',
      '.d4chat-dot-bounce:nth-child(3){animation-delay:.3s}',
      '@keyframes d4bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}',

      /* Quick actions */
      '#d4chat-quick{padding:8px 16px;display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid ' + C.border + ';flex-shrink:0}',
      '#d4chat-quick button{padding:6px 12px;border-radius:20px;border:1px solid rgba(100,255,218,0.25);background:rgba(100,255,218,0.05);color:' + C.primary + ';font-size:11.5px;font-weight:600;cursor:pointer;transition:background .2s,border-color .2s;font-family:inherit;white-space:nowrap}',
      '#d4chat-quick button:hover{background:rgba(100,255,218,0.12);border-color:rgba(100,255,218,0.5)}',

      /* Notificación de presupuesto */
      '#d4chat-budget-notice{margin:0 16px 8px;padding:10px 14px;border-radius:6px;background:rgba(100,255,218,0.08);border:1px solid rgba(100,255,218,0.3);color:' + C.primary + ';font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;flex-shrink:0}',
      '#d4chat-budget-notice.d4chat-hidden{display:none}',
      '#d4chat-budget-notice .material-symbols-outlined{font-size:16px;font-variation-settings:"FILL" 1}',

      /* Input */
      '#d4chat-input-wrap{padding:12px 16px;border-top:1px solid ' + C.border + ';display:flex;gap:8px;align-items:flex-end;flex-shrink:0;background:' + C.surface + '}',
      '#d4chat-input{flex:1;background:' + C.container + ';border:1px solid ' + C.border + ';border-radius:8px;padding:10px 12px;color:' + C.text + ';font-size:13.5px;font-family:inherit;resize:none;outline:none;min-height:40px;max-height:120px;line-height:1.5;transition:border-color .2s}',
      '#d4chat-input:focus{border-color:rgba(100,255,218,0.4)}',
      '#d4chat-input::placeholder{color:' + C.muted + '}',
      '#d4chat-send{width:40px;height:40px;border-radius:8px;background:' + C.primary + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:filter .2s}',
      '#d4chat-send:hover{filter:brightness(1.1)}',
      '#d4chat-send:disabled{opacity:.4;cursor:not-allowed}',
      '#d4chat-send .material-symbols-outlined{color:' + C.onPrimary + ';font-size:20px;font-variation-settings:"FILL" 1}',

      /* Tooltip flotante */
      '#d4chat-tooltip{position:fixed;bottom:96px;right:28px;z-index:9997;background:#fff;color:#0a192f;padding:11px 34px 11px 14px;border-radius:12px 12px 4px 12px;box-shadow:0 4px 24px rgba(0,0,0,0.3);font-size:13px;font-family:"Space Grotesk",sans-serif;max-width:220px;line-height:1.45;cursor:pointer;animation:d4slideup .3s ease}',
      '#d4chat-tooltip::after{content:"";position:absolute;bottom:-7px;right:18px;border:7px solid transparent;border-top-color:#fff;border-bottom:0}',
      '#d4chat-tooltip strong{color:' + C.onPrimary + ';font-weight:700}',
      '#d4chat-tooltip-close{position:absolute;top:5px;right:5px;width:20px;height:20px;border:none;background:rgba(0,0,0,0.08);border-radius:50%;cursor:pointer;font-size:13px;line-height:20px;text-align:center;color:#666;padding:0;display:flex;align-items:center;justify-content:center}',
      '#d4chat-tooltip-close:hover{background:rgba(0,0,0,0.15)}',
      '@keyframes d4slideup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',

      /* Mobile responsive */
      '@media(max-width:480px){#d4chat-panel{width:100%;right:0;bottom:0;border-radius:16px 16px 0 0;max-height:90vh}#d4chat-btn{bottom:20px;right:20px}#d4chat-tooltip{right:20px;bottom:88px;max-width:190px}}',
    ].join('');
    document.head.appendChild(s);
  }

  // ─── Markdown → HTML (simple) ─────────────────────────────────────────────────
  function md2html(text) {
    // Escapar HTML primero
    var t = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers ### y ####
    t = t.replace(/^#{3,4}\s+(.+)$/gm, '<h4>$1</h4>');

    // Bold **text**
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic *text* (no dentro de **bold**)
    t = t.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

    // Inline code `code`
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Listas con guión o asterisco
    t = t.replace(/(?:^|\n)((?:[ \t]*[-*+]\s+.+\n?)+)/gm, function (match, list) {
      var items = list.trim().split('\n').map(function (line) {
        return '<li>' + line.replace(/^[ \t]*[-*+]\s+/, '') + '</li>';
      }).join('');
      return '\n<ul>' + items + '</ul>\n';
    });

    // Listas numeradas
    t = t.replace(/(?:^|\n)((?:[ \t]*\d+\.\s+.+\n?)+)/gm, function (match, list) {
      var items = list.trim().split('\n').map(function (line) {
        return '<li>' + line.replace(/^[ \t]*\d+\.\s+/, '') + '</li>';
      }).join('');
      return '\n<ol>' + items + '</ol>\n';
    });

    // Párrafos: dividir por doble salto de línea
    var blocks = t.split(/\n{2,}/);
    t = blocks.map(function (block) {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|ul|ol|li|blockquote)/.test(block)) return block;
      return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
    }).filter(Boolean).join('');

    return t;
  }

  // ─── Construye la URL de WhatsApp ─────────────────────────────────────────────
  function buildWhatsAppUrl(extraText) {
    var text = extraText || state.whatsappText;
    return 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(text);
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {}
  }

  function safeStorageRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {}
  }

  function loadSelectedTemplate() {
    var raw = safeStorageGet(CFG.templateStorageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      safeStorageRemove(CFG.templateStorageKey);
      return null;
    }
  }

  function renderSelectedTemplateContext() {
    var el = document.getElementById('d4chat-context');
    if (!el) return;

    if (!state.selectedTemplate || !state.selectedTemplate.name) {
      el.classList.add('d4chat-hidden');
      el.innerHTML = '';
      return;
    }

    var meta = [];
    if (state.selectedTemplate.category) meta.push(state.selectedTemplate.category);
    if (state.selectedTemplate.style) meta.push(state.selectedTemplate.style);

    el.innerHTML = [
      '<div class="d4chat-context-copy">',
        '<span class="d4chat-context-label">Maqueta elegida</span>',
        '<span class="d4chat-context-title">' + escapeHtml(state.selectedTemplate.name) + '</span>',
        '<span class="d4chat-context-meta">' + escapeHtml(meta.join(' · ') || 'Se enviará junto al presupuesto') + '</span>',
      '</div>',
      '<button id="d4chat-context-clear" type="button">Cambiar</button>',
    ].join('');

    el.classList.remove('d4chat-hidden');
    document.getElementById('d4chat-context-clear').addEventListener('click', function () {
      setSelectedTemplate(null);
    });
  }

  function setSelectedTemplate(template) {
    state.selectedTemplate = template || null;
    if (state.selectedTemplate) {
      safeStorageSet(CFG.templateStorageKey, JSON.stringify(state.selectedTemplate));
    } else {
      safeStorageRemove(CFG.templateStorageKey);
    }
    renderSelectedTemplateContext();
    updateWhatsAppLink();
  }

  function getTemplateFromElement(el) {
    if (!el) return null;
    var name = el.getAttribute('data-d4-template-name');
    if (!name) return null;
    return {
      id: el.getAttribute('data-d4-template-id') || '',
      name: name,
      category: el.getAttribute('data-d4-template-category') || '',
      style: el.getAttribute('data-d4-template-style') || '',
      description: el.getAttribute('data-d4-template-description') || '',
      source: el.getAttribute('data-d4-template-source') || '',
      previewUrl: el.getAttribute('data-d4-template-preview') || '',
    };
  }

  function buildTemplateAutoMessage(baseMessage, template) {
    if (!template || !template.name) return baseMessage || null;

    var details = [];
    if (template.category) details.push('categoría ' + template.category.toLowerCase());
    if (template.style) details.push('estilo ' + template.style.toLowerCase());

    var templateLine = 'Quiero pedir presupuesto tomando como base la maqueta "' + template.name + '"' + (details.length ? ' (' + details.join(', ') + ')' : '') + '.';
    if (template.description) {
      templateLine += ' Referencia: ' + template.description + '.';
    }

    if (!baseMessage) return 'Hola, ' + templateLine;
    return baseMessage + '\n\n' + templateLine;
  }

  // ─── DOM: crea el widget completo ─────────────────────────────────────────────
  function buildDOM() {
    // Botón flotante
    var btn = document.createElement('button');
    btn.id = 'd4chat-btn';
    btn.setAttribute('aria-label', 'Abrir chat de D4Lab');
    btn.innerHTML = '<span class="material-symbols-outlined" id="d4chat-btn-icon">chat</span><div class="d4chat-badge"></div>';

    // Panel
    var panel = document.createElement('div');
    panel.id = 'd4chat-panel';
    panel.classList.add('d4chat-hidden');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat de asistencia D4Lab');

    // Header
    panel.innerHTML = [
      '<div id="d4chat-header">',
        '<div class="d4chat-hinfo">',
          '<div class="d4chat-avatar">D4</div>',
          '<div>',
            '<div class="d4chat-hname">Asistente D4Lab</div>',
            '<div class="d4chat-hstatus"><span class="d4chat-dot"></span>En línea</div>',
          '</div>',
        '</div>',
        '<div class="d4chat-hbtns">',
          '<a id="d4chat-wa-btn" href="' + buildWhatsAppUrl() + '" target="_blank" rel="noopener" title="Continuar por WhatsApp">',
            // WhatsApp SVG icon
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="#64FFDA"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
          '</a>',
          '<button id="d4chat-close-btn" aria-label="Cerrar chat">',
            '<span class="material-symbols-outlined">close</span>',
          '</button>',
        '</div>',
      '</div>',

      '<div id="d4chat-context" class="d4chat-hidden"></div>',

      // Mensajes
      '<div id="d4chat-msgs"></div>',

      // Budget notice
      '<div id="d4chat-budget-notice" class="d4chat-hidden">',
        '<span class="material-symbols-outlined">task_alt</span>',
        '<span>Resumen enviado a Eudaldo · <a id="d4chat-wa-budget" href="#" style="color:#64FFDA;text-decoration:underline" target="_blank">Continúa por WhatsApp</a></span>',
      '</div>',

      // Quick actions
      '<div id="d4chat-quick"></div>',

      // Input
      '<div id="d4chat-input-wrap">',
        '<textarea id="d4chat-input" placeholder="Escribe tu pregunta..." rows="1"></textarea>',
        '<button id="d4chat-send" aria-label="Enviar mensaje">',
          '<span class="material-symbols-outlined">send</span>',
        '</button>',
      '</div>',
    ].join('');

    document.body.appendChild(btn);
    document.body.appendChild(panel);
  }

  // ─── Agrega un mensaje al panel ───────────────────────────────────────────────
  function addMessage(role, content) {
    state.messages.push({ role: role, content: content });

    var msgs = document.getElementById('d4chat-msgs');
    var wrap = document.createElement('div');
    wrap.className = 'd4chat-msg ' + (role === 'user' ? 'user' : 'bot');

    var bubble = document.createElement('div');
    bubble.className = 'd4chat-bubble';
    bubble.innerHTML = md2html(content);
    wrap.appendChild(bubble);
    msgs.appendChild(wrap);

    // Usuario → scroll al final; Bot → scroll al inicio del nuevo mensaje
    if (role === 'user') {
      msgs.scrollTop = msgs.scrollHeight;
    } else {
      wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ─── Typing indicator ─────────────────────────────────────────────────────────
  function showTyping() {
    var msgs = document.getElementById('d4chat-msgs');
    var el = document.createElement('div');
    el.id = 'd4chat-typing';
    el.innerHTML = '<div class="d4chat-dot-bounce"></div><div class="d4chat-dot-bounce"></div><div class="d4chat-dot-bounce"></div>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('d4chat-typing');
    if (el) el.remove();
  }

  // ─── Renderiza los quick actions ──────────────────────────────────────────────
  function renderQuickActions() {
    var container = document.getElementById('d4chat-quick');
    container.innerHTML = '';
    CFG.quickActions.forEach(function (action) {
      var btn = document.createElement('button');
      btn.textContent = action.label;
      btn.addEventListener('click', function (e) {
        e.stopPropagation(); // evita que el click burbujee y cierre el panel
        sendMessage(action.msg);
        container.innerHTML = '';
      });
      container.appendChild(btn);
    });
  }

  // ─── Envía un mensaje al API ──────────────────────────────────────────────────
  function sendMessage(text) {
    text = (text || '').trim();
    if (!text || state.loading) return;

    // Ocultar quick actions tras el primer mensaje
    var quick = document.getElementById('d4chat-quick');
    if (quick) quick.innerHTML = '';

    addMessage('user', text);
    state.loading = true;

    var input = document.getElementById('d4chat-input');
    var sendBtn = document.getElementById('d4chat-send');
    if (input) { input.value = ''; input.style.height = 'auto'; }
    if (sendBtn) sendBtn.disabled = true;

    showTyping();

    // Actualizar el href del botón WhatsApp con el contexto actual
    updateWhatsAppLink(text);

    var payload = {
      messages: state.messages,
      selectedTemplate: state.selectedTemplate,
    };

    fetch(CFG.api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        hideTyping();
        state.loading = false;
        if (sendBtn) sendBtn.disabled = false;

        if (data.error) {
          addMessage('assistant', '⚠️ ' + data.error);
          return;
        }

        addMessage('assistant', data.reply || '');

        if (data.budgetDetected && !state.budgetSent) {
          state.budgetSent = true;
          showBudgetNotice();
        }
      })
      .catch(function (err) {
        console.error('[D4Lab Widget]', err);
        hideTyping();
        state.loading = false;
        if (sendBtn) sendBtn.disabled = false;
        addMessage('assistant', '⚠️ No se pudo conectar con el asistente. Puedes escribirnos directamente por WhatsApp.');
      });
  }

  // ─── Actualiza el link de WhatsApp con contexto de la conversación ────────────
  function updateWhatsAppLink(lastUserMsg) {
    var templateText = '';
    if (state.selectedTemplate && state.selectedTemplate.name) {
      templateText = ' usando la maqueta "' + state.selectedTemplate.name + '"';
    }
    var waText = 'Hola D4Lab, vengo del chat de la web y me interesa' + templateText + ': ' + (lastUserMsg || 'vuestros servicios');
    state.whatsappText = waText;
    var url = buildWhatsAppUrl(waText);

    var waBtn = document.getElementById('d4chat-wa-btn');
    if (waBtn) waBtn.href = url;

    var waBudget = document.getElementById('d4chat-wa-budget');
    if (waBudget) waBudget.href = url;
  }

  // ─── Muestra la notificación de presupuesto enviado ───────────────────────────
  function showBudgetNotice() {
    var notice = document.getElementById('d4chat-budget-notice');
    if (!notice) return;
    var waBudget = document.getElementById('d4chat-wa-budget');
    if (waBudget) waBudget.href = buildWhatsAppUrl();
    notice.classList.remove('d4chat-hidden');
    var msgs = document.getElementById('d4chat-msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  // ─── Abre / cierra el panel ───────────────────────────────────────────────────
  function openChat(autoMessage) {
    dismissTooltip(true);
    state.open = true;
    var panel = document.getElementById('d4chat-panel');
    var badge = document.querySelector('#d4chat-btn .d4chat-badge');
    var icon = document.getElementById('d4chat-btn-icon');

    panel.classList.remove('d4chat-hidden');
    if (badge) badge.style.display = 'none';
    if (icon) icon.textContent = 'close';

    var isFirst = state.messages.length === 0;

    // Mostrar mensaje de bienvenida la primera vez
    if (isFirst) {
      addMessage('assistant', CFG.welcomeMsg);
      // Solo mostrar quick actions si no hay mensaje automático de categoría
      if (!autoMessage) renderQuickActions();
    }

    // Si viene de una categoría o maqueta, enviamos el mensaje automático
    if (autoMessage && isFirst) {
      setTimeout(function () { sendMessage(autoMessage); }, 900);
    } else if (autoMessage) {
      setTimeout(function () { sendMessage(autoMessage); }, 200);
    } else {
      setTimeout(function () {
        var input = document.getElementById('d4chat-input');
        if (input) input.focus();
      }, 200);
    }
  }

  function closeChat() {
    state.open = false;
    var panel = document.getElementById('d4chat-panel');
    var icon = document.getElementById('d4chat-btn-icon');
    panel.classList.add('d4chat-hidden');
    if (icon) icon.textContent = 'chat';
  }

  // ─── Tooltip flotante de presentación ────────────────────────────────────────
  var tipAutoHideTimer = null;
  var tipIdleTimer     = null;
  var tipDismissed     = false;
  var tipActivityBound = false;

  // Comprueba que el tooltip no solapa contenido importante
  // (no mostrar si el usuario está en el 85% inferior de la página)
  function tipIsSafe() {
    var ratio = (window.scrollY + window.innerHeight) / Math.max(document.body.scrollHeight, 1);
    return ratio < 0.85;
  }

  // Reinicia el contador de inactividad; al cumplirse, reaparece el tooltip
  function armIdleWatch() {
    clearTimeout(tipIdleTimer);
    if (tipDismissed || state.open) return;
    tipIdleTimer = setTimeout(function () {
      if (!tipDismissed && !state.open && tipIsSafe()) showTooltip();
    }, 45000); // 45 s de inactividad
  }

  function showTooltip() {
    if (tipDismissed) return;
    if (state.open) return;
    if (document.getElementById('d4chat-tooltip')) return;
    if (!tipIsSafe()) { armIdleWatch(); return; } // no solapar

    var tip = document.createElement('div');
    tip.id = 'd4chat-tooltip';
    tip.setAttribute('role', 'status');
    tip.innerHTML = '<button id="d4chat-tooltip-close" aria-label="Cerrar">×</button>👋 ¿Tienes dudas o quieres un <strong>presupuesto gratis</strong>? ¡Pregúntame!';
    document.body.appendChild(tip);

    // Botón X → descarta para toda la sesión
    document.getElementById('d4chat-tooltip-close').addEventListener('click', function (e) {
      e.stopPropagation();
      dismissTooltip(true);
    });

    // Click en el cuerpo → abre el chat
    tip.addEventListener('click', function (e) {
      if (e.target.id === 'd4chat-tooltip-close') return;
      dismissTooltip(true);
      openChat();
    });

    // Scroll → oculta y activa vigilancia de inactividad
    function onScroll() {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(tipAutoHideTimer);
      dismissTooltip(false);
      armIdleWatch();
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // Auto-ocultar a los 60 s
    clearTimeout(tipAutoHideTimer);
    tipAutoHideTimer = setTimeout(function () {
      window.removeEventListener('scroll', onScroll);
      dismissTooltip(false);
      armIdleWatch();
    }, 60000);

    // Enlazar detectores de actividad una sola vez
    if (!tipActivityBound) {
      tipActivityBound = true;
      ['mousemove', 'keydown', 'touchstart', 'click'].forEach(function (ev) {
        document.addEventListener(ev, function () { armIdleWatch(); }, { passive: true });
      });
    }
  }

  function dismissTooltip(permanent) {
    clearTimeout(tipAutoHideTimer);
    if (permanent) { tipDismissed = true; clearTimeout(tipIdleTimer); }
    var tip = document.getElementById('d4chat-tooltip');
    if (!tip) return;
    tip.style.transition = 'opacity .25s,transform .25s';
    tip.style.opacity = '0';
    tip.style.transform = 'translateY(8px)';
    setTimeout(function () { if (tip.parentNode) tip.parentNode.removeChild(tip); }, 280);
  }

  // ─── Ajuste automático altura del textarea ───────────────────────────────────
  function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  // ─── Wire up eventos ──────────────────────────────────────────────────────────
  function bindEvents() {
    // Toggle chat
    document.getElementById('d4chat-btn').addEventListener('click', function () {
      if (state.open) closeChat(); else openChat();
    });

    // Cerrar
    document.getElementById('d4chat-close-btn').addEventListener('click', function (e) {
      e.stopPropagation();
      closeChat();
    });

    // Enviar con botón
    document.getElementById('d4chat-send').addEventListener('click', function () {
      var input = document.getElementById('d4chat-input');
      sendMessage(input ? input.value : '');
    });

    // Enviar con Enter (Shift+Enter = nueva línea)
    document.getElementById('d4chat-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(this.value);
      }
    });

    // Auto-resize textarea
    document.getElementById('d4chat-input').addEventListener('input', function () {
      autoResizeTextarea(this);
    });

    // Cerrar al hacer clic fuera (solo en escritorio)
    document.addEventListener('click', function (e) {
      if (!state.open) return;
      var panel = document.getElementById('d4chat-panel');
      var btn = document.getElementById('d4chat-btn');
      if (!panel.contains(e.target) && !btn.contains(e.target)) {
        closeChat();
      }
    });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    // Evitar doble inicialización
    if (document.getElementById('d4chat-btn')) return;

    injectStyles();
    buildDOM();
    state.selectedTemplate = loadSelectedTemplate();
    renderSelectedTemplateContext();
    updateWhatsAppLink();
    bindEvents();

    // Mostrar badge + tooltip después de 4s
    setTimeout(function () {
      if (!state.open) {
        var badge = document.querySelector('#d4chat-btn .d4chat-badge');
        if (badge) badge.style.display = 'block';
        showTooltip();
      }
    }, 4000);
  }

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init();
      wireOpenButtons();
    });
  } else {
    init();
    wireOpenButtons();
  }

  // Conectar todos los elementos con data-d4-open para que abran el chat
  function wireOpenButtons() {
    document.querySelectorAll('[data-d4-open]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var template = getTemplateFromElement(el);
        if (template) setSelectedTemplate(template);
        var autoMsg = buildTemplateAutoMessage(el.getAttribute('data-d4-automessage') || null, template);
        openChat(autoMsg);
      });
    });
  }

  // También exponer globalmente por si se usa desde otro script
  window.d4ChatOpen = openChat;
  window.d4ChatSetTemplate = setSelectedTemplate;
})();
