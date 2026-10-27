const btnSair = document.getElementById("btnSair");

if (btnSair) {
  btnSair.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("tipo");

    window.location.href = "../login/login.html";
  });
}
