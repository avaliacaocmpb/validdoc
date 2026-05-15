/**
 * ui.js — Componentes de interface reutilizáveis
 *
 * Toast, modal de confirmação, spinner, e funções de renderização
 * de badges e outros elementos recorrentes.
 */

// ─── Toast ────────────────────────────────────────────────────────────────

const Toast = {
  _container: null,

  _init() {
    if (this._container) return;
    this._container = document.createElement('div');
    this._container.className = 'toast-container';
    document.body.appendChild(this._container);
  },

  mostrar(mensagem, tipo = 'info', duracaoMs = 4000) {
    this._init();
    const el = document.createElement('div');
    const icones = {
      sucesso: '✓',
      erro:    '✕',
      aviso:   '⚠',
      info:    'ℹ'
    };
    el.className = `toast toast-${tipo}`;
    el.innerHTML = `<span>${icones[tipo] || 'ℹ'}</span> ${mensagem}`;
    this._container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, duracaoMs);
  },

  sucesso: (msg) => Toast.mostrar(msg, 'sucesso'),
  erro:    (msg) => Toast.mostrar(msg, 'erro', 5000),
  aviso:   (msg) => Toast.mostrar(msg, 'aviso'),
  info:    (msg) => Toast.mostrar(msg, 'info')
};

// ─── Modal de confirmação ─────────────────────────────────────────────────

const Modal = {
  /**
   * Abre um modal de confirmação simples.
   * @param {{ titulo, mensagem, textoBotao, tipo }} opcoes
   * @returns {Promise<boolean>}
   */
  confirmar({ titulo, mensagem, textoBotao = 'Confirmar', tipo = 'primario' }) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal" style="max-width:420px">
          <div class="modal-header">
            <h3>${titulo}</h3>
          </div>
          <div class="modal-body">
            <p style="color:var(--cinza-600);font-size:var(--texto-sm)">${mensagem}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secundario" id="modal-cancelar">Cancelar</button>
            <button class="btn btn-${tipo}" id="modal-confirmar">${textoBotao}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('#modal-cancelar').addEventListener('click', () => {
        overlay.remove();
        resolve(false);
      });
      overlay.querySelector('#modal-confirmar').addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });
      overlay.addEventListener('click', e => {
        if (e.target === overlay) { overlay.remove(); resolve(false); }
      });
    });
  },

  /**
   * Abre um modal customizado com HTML interno.
   * @param {{ titulo, html, largura }} opcoes
   * @returns {{ overlay, fechar }}
   */
  abrir({ titulo, html, largura = '480px' }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:${largura}">
        <div class="modal-header">
          <h3>${titulo}</h3>
          <button class="btn-icone" id="modal-fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">${html}</div>
      </div>
    `;
    document.body.appendChild(overlay);

    const fechar = () => overlay.remove();
    overlay.querySelector('#modal-fechar').addEventListener('click', fechar);
    overlay.addEventListener('click', e => { if (e.target === overlay) fechar(); });

    return { overlay, fechar };
  }
};

// ─── Spinner de carregamento ──────────────────────────────────────────────

function htmlCarregando(texto = 'Carregando...') {
  return `
    <div class="carregando">
      <div class="spinner spinner-lg"></div>
      <span>${texto}</span>
    </div>
  `;
}

function htmlVazio(titulo, texto, icone = '📭') {
  return `
    <div class="vazio">
      <div class="vazio__icone">${icone}</div>
      <div class="vazio__titulo">${titulo}</div>
      <p class="vazio__texto">${texto}</p>
    </div>
  `;
}

// ─── Badges ───────────────────────────────────────────────────────────────

function badgeStatus(status) {
  const mapa = {
    pendente:    { classe: 'badge-pendente',  label: 'Pendente' },
    em_andamento:{ classe: 'badge-andamento', label: 'Em andamento' },
    concluida:   { classe: 'badge-concluida', label: 'Concluída' }
  };
  const s = (status || '').toLowerCase();
  const cfg = mapa[s] || { classe: 'badge-na', label: status || '—' };
  return `<span class="badge ${cfg.classe}">${cfg.label}</span>`;
}

function badgeValidacao(valor) {
  const mapa = {
    valido:   { classe: 'badge-valido',   label: 'Válido' },
    invalido: { classe: 'badge-invalido', label: 'Inválido' },
    na:       { classe: 'badge-na',       label: 'N/A' }
  };
  const v = (valor || '').toLowerCase();
  const cfg = mapa[v] || { classe: 'badge-na', label: '—' };
  return `<span class="badge ${cfg.classe}">${cfg.label}</span>`;
}

function badgePapel(papel) {
  const mapa = {
    admin:      'badge-admin',
    supervisor: 'badge-supervisor',
    validador:  'badge-validador'
  };
  const cls = mapa[papel] || 'badge-na';
  return `<span class="badge ${cls}">${papel || '—'}</span>`;
}

// ─── Iniciais do nome para avatar ─────────────────────────────────────────

function iniciaisNome(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// ─── Ícones SVG inline ────────────────────────────────────────────────────

const Icone = {
  _svg: (path, extra = '') =>
    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${path}</svg>`,

  dashboard:  () => Icone._svg('<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>'),
  validar:    () => Icone._svg('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
  usuarios:   () => Icone._svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  config:     () => Icone._svg('<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>'),
  auditoria:  () => Icone._svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'),
  sair:       () => Icone._svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
  buscar:     () => Icone._svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
  mais:       () => Icone._svg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  editar:     () => Icone._svg('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
  lixo:       () => Icone._svg('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>'),
  proximo:    () => Icone._svg('<polyline points="9 18 15 12 9 6"/>'),
  anterior:   () => Icone._svg('<polyline points="15 18 9 12 15 6"/>'),
  cores:      () => Icone._svg('<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="10.5" r=".5"/><circle cx="6.5" cy="14.5" r=".5"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.19 0 .37-.01.56-.02C8.93 20.11 8 18.15 8 16c0-3.31 2.69-6 6-6 1.38 0 2.65.47 3.65 1.25L21 8.64C19.36 4.69 15.98 2 12 2z"/>'),
  campos:     () => Icone._svg('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'),
  docs:       () => Icone._svg('<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>'),
  refresh:    () => Icone._svg('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'),
  olho:       () => Icone._svg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  revisao:    () => Icone._svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>'),
};

// ─── Formatação de data ───────────────────────────────────────────────────

function formatarDataHora(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return isoStr; }
}

function formatarData(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('pt-BR');
  } catch { return isoStr; }
}
