/**
 * PulseMine - Apresentação Oficial
 * Script de Interatividade e Roteamento
 */

document.addEventListener('DOMContentLoaded', () => {
  const btnEntrar = document.getElementById('btn-entrar');
  const btnCadastro = document.getElementById('btn-cadastro');

  // Detecta se a página está rodando dentro da pasta "pag de apresentaçao" ou na raiz do projeto
  const isInsideSubfolder = window.location.pathname.toLowerCase().includes('apresenta');
  const prefix = isInsideSubfolder ? '../' : './';

  // Rotas oficiais existentes no PulseMine
  const routes = {
    login: `${prefix}login/login.html`,
    cadastro: `${prefix}cadastro/cadastro.html`
  };

  // Garante que os atributos href dos links apontem para as páginas corretas
  if (btnEntrar) {
    btnEntrar.setAttribute('href', routes.login);
  }

  if (btnCadastro) {
    btnCadastro.setAttribute('href', routes.cadastro);
  }

  // Micro-interação: Efeito sutil de iluminação interativa ao mover o cursor
  const leftPanel = document.querySelector('.left-panel');
  if (leftPanel) {
    leftPanel.addEventListener('mousemove', (e) => {
      const rect = leftPanel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      leftPanel.style.setProperty('--mouse-x', `${x}px`);
      leftPanel.style.setProperty('--mouse-y', `${y}px`);
    });
  }

  console.log('PulseMine: Página de apresentação inicializada com sucesso.');
});
