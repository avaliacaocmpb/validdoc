/**
 * auditoria.js — Consulta ao log de auditoria (admin e supervisor)
 */

async function renderAuditoria(container) {
  container.innerHTML = `
    <div class="pagina-titulo">
      <h1>Auditoria</h1>
      <p>Registro completo de todas as ações realizadas no sistema</p>
    </div>

    <!-- Filtros -->
    <div class="card" style="margin-bottom:var(--esp-5)">
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--esp-4)">
          <div class="form-grupo" style="margin-bottom:0">
            <label class="form-label">Ação</label>
            <select class="form-select" id="filtro-acao">
              <option value="">Todas</option>
              <option>LOGIN</option>
              <option>LOGOUT</option>
              <option>TROCAR_SENHA</option>
              <option>INICIAR_VALIDACAO</option>
              <option>VALIDAR_DOC</option>
              <option>CONCLUIR_VALIDACAO</option>
              <option>INICIAR_REVISAO</option>
              <option>BUSCA_CPF</option>
              <option>EDITAR_CONFIG</option>
              <option>CRIAR_USUARIO</option>
              <option>EDITAR_USUARIO</option>
              <option>DESATIVAR_USUARIO</option>
              <option>REDEFINIR_SENHA</option>
            </select>
          </div>

          <div class="form-grupo" style="margin-bottom:0">
            <label class="form-label">Entidade / Aluno</label>
            <input class="form-input" type="text" id="filtro-entidade" placeholder="Nome, doc, config...">
          </div>

          <div class="form-grupo" style="margin-bottom:0">
            <label class="form-label">Data início</label>
            <input class="form-input" type="date" id="filtro-data-inicio">
          </div>

          <div class="form-grupo" style="margin-bottom:0">
            <label class="form-label">Data fim</label>
            <input class="form-input" type="date" id="filtro-data-fim">
          </div>
        </div>

        <div style="margin-top:var(--esp-4);display:flex;justify-content:flex-end">
          <button class="btn btn-primario" onclick="buscarAuditoria(1)">
            ${Icone.buscar()} Filtrar
          </button>
        </div>
      </div>
    </div>

    <div id="resultado-auditoria">
      ${htmlCarregando('Carregando registros...')}
    </div>
  `;

  buscarAuditoria(1);
}

async function buscarAuditoria(pagina) {
  const area = document.getElementById('resultado-auditoria');
  if (!area) return;

  area.innerHTML = htmlCarregando('Buscando...');

  const filtros = {
    acao:       document.getElementById('filtro-acao')?.value || '',
    entidade:   document.getElementById('filtro-entidade')?.value || '',
    dataInicio: document.getElementById('filtro-data-inicio')?.value || '',
    dataFim:    document.getElementById('filtro-data-fim')?.value || '',
    pagina,
    porPagina: 50
  };

  try {
    const res = await Api.auditoria.get(filtros);
    if (!res) return;

    if (res.registros.length === 0) {
      area.innerHTML = htmlVazio('Sem registros', 'Nenhum registro encontrado com os filtros informados.', '📋');
      return;
    }

    area.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span style="font-size:var(--texto-sm);color:var(--cinza-500)">
            ${res.total} registro(s) encontrado(s)
          </span>
        </div>
        <div class="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Entidade</th>
                <th>Antes</th>
                <th>Depois</th>
              </tr>
            </thead>
            <tbody>
              ${res.registros.map(r => `
                <tr>
                  <td style="font-family:var(--fonte-mono);font-size:var(--texto-xs);white-space:nowrap">
                    ${formatarDataHora(r.dataHora)}
                  </td>
                  <td style="font-size:var(--texto-sm);font-weight:500">${r.userID || '—'}</td>
                  <td>
                    <span class="badge ${_badgeAcao(r.acao)}" style="font-size:10px">
                      ${r.acao}
                    </span>
                  </td>
                  <td style="font-size:var(--texto-xs);color:var(--cinza-500);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.entidade}">
                    ${r.entidade || '—'}
                  </td>
                  <td style="font-size:var(--texto-xs);color:var(--cinza-400);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.valorAnterior}">
                    ${r.valorAnterior || '—'}
                  </td>
                  <td style="font-size:var(--texto-xs);color:var(--cinza-600);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.valorNovo}">
                    ${r.valorNovo || '—'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${res.totalPaginas > 1 ? `
          <div class="paginacao">
            <button class="btn btn-fantasma btn-sm" ${res.pagina <= 1 ? 'disabled' : ''}
              onclick="buscarAuditoria(${res.pagina - 1})">
              ${Icone.anterior()}
            </button>
            <span class="paginacao__info">Página ${res.pagina} de ${res.totalPaginas}</span>
            <button class="btn btn-fantasma btn-sm" ${res.pagina >= res.totalPaginas ? 'disabled' : ''}
              onclick="buscarAuditoria(${res.pagina + 1})">
              ${Icone.proximo()}
            </button>
          </div>
        ` : ''}
      </div>
    `;

  } catch (e) {
    area.innerHTML = `<div class="alerta alerta-erro">Erro: ${e.message}</div>`;
  }
}

function _badgeAcao(acao) {
  if (!acao) return 'badge-na';
  if (acao.startsWith('LOGIN') || acao.startsWith('LOGOUT')) return 'badge-andamento';
  if (acao.includes('VALIDA') || acao.includes('REVISAO')) return 'badge-valido';
  if (acao.includes('CONFIG') || acao.includes('USUARIO')) return 'badge-supervisor';
  if (acao.includes('SENHA')) return 'badge-pendente';
  return 'badge-na';
}
