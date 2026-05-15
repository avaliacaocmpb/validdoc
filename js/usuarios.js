/**
 * usuarios.js — Gestão de usuários (somente admin)
 */

async function renderUsuarios(container) {
  if (!State.podeAdmin()) {
    container.innerHTML = `<div class="alerta alerta-erro">Acesso restrito a administradores.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="pagina-titulo" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--esp-4)">
      <div>
        <h1>Usuários</h1>
        <p>Gerencie os acessos ao sistema</p>
      </div>
      <button class="btn btn-primario" onclick="abrirModalNovoUsuario()">
        ${Icone.mais()} Novo usuário
      </button>
    </div>
    <div id="tabela-usuarios">${htmlCarregando()}</div>
  `;

  await _carregarTabela();
}

async function _carregarTabela() {
  const area = document.getElementById('tabela-usuarios');
  if (!area) return;

  try {
    const res = await Api.usuarios.listar();
    if (!res) return;

    const usuarios = res.usuarios || [];

    area.innerHTML = `
      <div class="card">
        <div class="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Login</th>
                <th>E-mail</th>
                <th>Papel</th>
                <th>Último acesso</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${usuarios.map(u => `
                <tr>
                  <td style="font-family:var(--fonte-mono);font-size:var(--texto-xs);color:var(--cinza-400)">${u.userID}</td>
                  <td style="font-weight:500">${u.nome}</td>
                  <td style="font-family:var(--fonte-mono);font-size:var(--texto-sm)">${u.login}</td>
                  <td style="font-size:var(--texto-sm);color:var(--cinza-500)">${u.email || '—'}</td>
                  <td>${badgePapel(u.papel)}</td>
                  <td style="font-size:var(--texto-xs);color:var(--cinza-400)">${formatarDataHora(u.ultimoLogin)}</td>
                  <td>
                    <span class="badge ${u.ativo ? 'badge-valido' : 'badge-invalido'}">
                      ${u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    ${u.primeiroAcesso ? '<span class="badge badge-pendente" style="margin-left:4px">1º acesso</span>' : ''}
                  </td>
                  <td>
                    <div style="display:flex;gap:var(--esp-2)">
                      <button class="btn-icone" title="Editar" onclick="abrirModalEditarUsuario(${JSON.stringify(u).replace(/"/g,'&quot;')})">
                        ${Icone.editar()}
                      </button>
                      <button class="btn-icone" title="Redefinir senha" onclick="redefinirSenhaUsuario('${u.userID}','${u.nome}')">
                        ${Icone.refresh()}
                      </button>
                      ${u.ativo && u.userID !== State.usuario.userID ? `
                        <button class="btn-icone" title="Desativar" onclick="desativarUsuario('${u.userID}','${u.nome}')">
                          ${Icone.lixo()}
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

  } catch (e) {
    area.innerHTML = `<div class="alerta alerta-erro">Erro: ${e.message}</div>`;
  }
}

// ─── Modal: novo usuário ──────────────────────────────────────────────────

function abrirModalNovoUsuario() {
  const { overlay } = Modal.abrir({
    titulo: 'Novo usuário',
    html: `
      <div class="form-grupo">
        <label class="form-label">Nome completo *</label>
        <input class="form-input" type="text" id="novo-nome" placeholder="Nome do usuário">
      </div>
      <div class="form-grupo">
        <label class="form-label">Login *</label>
        <input class="form-input" type="text" id="novo-login" placeholder="nome.sobrenome">
      </div>
      <div class="form-grupo">
        <label class="form-label">E-mail</label>
        <input class="form-input" type="email" id="novo-email" placeholder="email@escola.edu.br">
      </div>
      <div class="form-grupo">
        <label class="form-label">Papel *</label>
        <select class="form-select" id="novo-papel">
          <option value="validador">Validador</option>
          <option value="supervisor">Supervisor</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <p style="font-size:var(--texto-xs);color:var(--cinza-400);margin-top:var(--esp-2)">
        A senha inicial será a senha padrão do sistema. O usuário deverá alterá-la no primeiro acesso.
      </p>
      <div id="msg-novo-usuario" style="margin-top:var(--esp-4)"></div>
      <div class="modal-footer" style="margin:var(--esp-4) calc(-1 * var(--esp-6)) calc(-1 * var(--esp-6))">
        <button class="btn btn-secundario" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primario" onclick="salvarNovoUsuario(this)">Criar usuário</button>
      </div>
    `
  });
}

async function salvarNovoUsuario(btn) {
  const nome  = document.getElementById('novo-nome')?.value?.trim();
  const login = document.getElementById('novo-login')?.value?.trim();
  const email = document.getElementById('novo-email')?.value?.trim();
  const papel = document.getElementById('novo-papel')?.value;
  const msg   = document.getElementById('msg-novo-usuario');

  if (!nome || !login) {
    msg.innerHTML = '<div class="alerta alerta-erro">Nome e login são obrigatórios.</div>';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div>';

  try {
    const res = await Api.usuarios.criar({ nome, login, email, papel });
    if (!res || !res.ok) {
      msg.innerHTML = `<div class="alerta alerta-erro">${res?.erro || 'Erro ao criar usuário.'}</div>`;
      return;
    }
    document.querySelector('.modal-overlay')?.remove();
    Toast.sucesso('Usuário criado com sucesso!');
    await _carregarTabela();
  } catch (e) {
    msg.innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Criar usuário';
  }
}

// ─── Modal: editar usuário ────────────────────────────────────────────────

function abrirModalEditarUsuario(usuario) {
  const { overlay } = Modal.abrir({
    titulo: `Editar — ${usuario.nome}`,
    html: `
      <div class="form-grupo">
        <label class="form-label">Nome</label>
        <input class="form-input" type="text" id="edit-nome" value="${usuario.nome}">
      </div>
      <div class="form-grupo">
        <label class="form-label">E-mail</label>
        <input class="form-input" type="email" id="edit-email" value="${usuario.email || ''}">
      </div>
      <div class="form-grupo">
        <label class="form-label">Papel</label>
        <select class="form-select" id="edit-papel">
          <option value="validador" ${usuario.papel === 'validador' ? 'selected' : ''}>Validador</option>
          <option value="supervisor" ${usuario.papel === 'supervisor' ? 'selected' : ''}>Supervisor</option>
          <option value="admin" ${usuario.papel === 'admin' ? 'selected' : ''}>Administrador</option>
        </select>
      </div>
      <div class="form-grupo" style="margin-bottom:0">
        <label class="form-label">Situação</label>
        <select class="form-select" id="edit-ativo">
          <option value="true" ${usuario.ativo ? 'selected' : ''}>Ativo</option>
          <option value="false" ${!usuario.ativo ? 'selected' : ''}>Inativo</option>
        </select>
      </div>
      <div id="msg-edit-usuario" style="margin-top:var(--esp-4)"></div>
      <div class="modal-footer" style="margin:var(--esp-4) calc(-1 * var(--esp-6)) calc(-1 * var(--esp-6))">
        <button class="btn btn-secundario" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primario" onclick="salvarEdicaoUsuario('${usuario.userID}', this)">Salvar</button>
      </div>
    `
  });
}

async function salvarEdicaoUsuario(userID, btn) {
  const nome  = document.getElementById('edit-nome')?.value?.trim();
  const email = document.getElementById('edit-email')?.value?.trim();
  const papel = document.getElementById('edit-papel')?.value;
  const ativo = document.getElementById('edit-ativo')?.value === 'true';
  const msg   = document.getElementById('msg-edit-usuario');

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div>';

  try {
    const res = await Api.usuarios.editar(userID, { nome, email, papel, ativo });
    if (!res || !res.ok) {
      msg.innerHTML = `<div class="alerta alerta-erro">${res?.erro || 'Erro.'}</div>`;
      return;
    }
    document.querySelector('.modal-overlay')?.remove();
    Toast.sucesso('Usuário atualizado!');
    await _carregarTabela();
  } catch (e) {
    msg.innerHTML = `<div class="alerta alerta-erro">${e.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Salvar';
  }
}

async function redefinirSenhaUsuario(userID, nome) {
  const ok = await Modal.confirmar({
    titulo: 'Redefinir senha',
    mensagem: `Redefinir a senha de <strong>${nome}</strong> para a senha padrão do sistema? O usuário precisará alterá-la no próximo acesso.`,
    textoBotao: 'Redefinir',
    tipo: 'primario'
  });
  if (!ok) return;
  try {
    const res = await Api.usuarios.redefinirSenha(userID);
    if (res?.ok) Toast.sucesso('Senha redefinida com sucesso.');
    else Toast.erro(res?.erro || 'Erro ao redefinir senha.');
  } catch (e) { Toast.erro(e.message); }
}

async function desativarUsuario(userID, nome) {
  const ok = await Modal.confirmar({
    titulo: 'Desativar usuário',
    mensagem: `Tem certeza que deseja desativar <strong>${nome}</strong>? O usuário não conseguirá mais acessar o sistema.`,
    textoBotao: 'Desativar',
    tipo: 'perigo'
  });
  if (!ok) return;
  try {
    const res = await Api.usuarios.desativar(userID);
    if (res?.ok) { Toast.sucesso('Usuário desativado.'); await _carregarTabela(); }
    else Toast.erro(res?.erro || 'Erro.');
  } catch (e) { Toast.erro(e.message); }
}
