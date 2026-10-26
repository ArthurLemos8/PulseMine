/**
 * PulseMine - Apresentação Oficial
 * Script de Interatividade e Roteamento
 */

document.addEventListener("DOMContentLoaded", () => {
  const btnEntrar = document.getElementById("btn-entrar");
  const btnCadastro = document.getElementById("btn-cadastro");

  const routes = {
    login: "../login/login.html",
    cadastro: "../cadastro/cadastro.html",
  };

  if (btnEntrar) {
    btnEntrar.setAttribute("href", routes.login);
  }

  if (btnCadastro) {
    btnCadastro.setAttribute("href", routes.cadastro);
  }

  const leftPanel = document.querySelector(".left-panel");
  if (leftPanel) {
    leftPanel.addEventListener("mousemove", (e) => {
      const rect = leftPanel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      leftPanel.style.setProperty("--mouse-x", `${x}px`);
      leftPanel.style.setProperty("--mouse-y", `${y}px`);
    });
  }
});
