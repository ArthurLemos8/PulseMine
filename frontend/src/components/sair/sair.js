document.addEventListener("click", function (event) {
  const btnSair = event.target.closest(".sair");

  if (!btnSair) return;

  event.preventDefault();

  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("tipo");

  window.location.href = btnSair.href;
});
