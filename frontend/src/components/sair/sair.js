document.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".sair");

  if (!botao || botao.dataset.logoutHandled === "true") return;

  evento.preventDefault();

  botao.dataset.logoutHandled = "true";

  sessionStorage.removeItem("pulseMineToken");
  sessionStorage.removeItem("pulseMineEmail");

  window.location.href = botao.href;
});
