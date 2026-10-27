const formulario = document.getElementById("formRecuperar");

const email = document.getElementById("email");
const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");

const olhos = document.querySelectorAll(".olho");

const erroEmail = document.getElementById("erroEmail");
const erroSenha = document.getElementById("erroSenha");
const erroConfirmacaoSenha = document.getElementById("erroConfirmarSenha");
const mensagemSucesso = document.getElementById("mensagemSucesso");

olhos.forEach((olho, index) => {
  olho.addEventListener("click", () => {
    const campo = index === 0 ? novaSenha : confirmarSenha;

    if (campo.type === "password") {
      campo.type = "text";

      olho.classList.remove("bi-eye");
      olho.classList.add("bi-eye-slash");
    } else {
      campo.type = "password";

      olho.classList.remove("bi-eye-slash");
      olho.classList.add("bi-eye");
    }
  });
});

formulario.addEventListener("submit", (event) => {
  event.preventDefault();

  erroEmail.textContent = "";
  erroSenha.textContent = "";
  erroConfirmacaoSenha.textContent = "";

  let valido = true;

  if (email.value.trim() === "") {
    erroEmail.textContent = "Digite uma nova senha.";
    valido = false;
  }

  if (novaSenha.value.trim() === "") {
    erroSenha.textContent = "Digite uma nova Senha.";
    valido = false;
  } else if (novaSenha.value.length < 8) {
    erroSenha.textContent = "A senha deve ter pelo menos 8 caracteres.";
    valido = false;
  }

  if (confirmarSenha.value.trim() === "") {
    erroConfirmacaoSenha.textContent = "Confirme sua nova senha.";
    valido = false;
  } else if (confirmarSenha.value !== novaSenha.value) {
    erroConfirmacaoSenha.textContent = "As senhas não coincidem.";
    valido = false;
  }

  if (!valido) {
    return;
  }

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    erroEmail.textContent = "E-mail não cadastrado.";
    return;
  }

  if (usuario.email !== email.value.trim()) {
    erroEmail.textContent = "E-mail não cadastrado";
    return;
  }

  olhos.forEach((olho) => {
    olho.classList.remove("bi-eye-slash");
    olho.classList.add("bi-eye");
  });
  novaSenha.type = "password";
  confirmarSenha.type = "password";

  usuario.senha = novaSenha.value;
  localStorage.setItem("usuario", JSON.stringify(usuario));

  mensagemSucesso.textContent = "Senha alterada com sucesso!";

  setTimeout(() => {
    window.location.href = "../login/login.html";
  }, 2000);
});
