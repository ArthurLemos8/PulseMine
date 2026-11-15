const formulario = document.getElementById("formRecuperar");

const email = document.getElementById("email");
const token = document.getElementById("token");
const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");

const botaoEnviarCodigo = document.getElementById("btnEnviarCodigo");
const olhos = document.querySelectorAll(".olho");

const erroEmail = document.getElementById("erroEmail");
const erroToken = document.getElementById("erroToken");
const erroSenha = document.getElementById("erroSenha");
const erroConfirmacaoSenha = document.getElementById("erroConfirmarSenha");
const mensagemSucesso = document.getElementById("mensagemSucesso");

olhos.forEach((olho, index) => {
  olho.addEventListener("click", () => {
    const campo = index === 0 ? novaSenha : confirmarSenha;

    campo.type = campo.type === "password" ? "text" : "password";

    olho.classList.toggle("bi-eye");
    olho.classList.toggle("bi-eye-slash");
  });
});

botaoEnviarCodigo.addEventListener("click", async () => {
  erroEmail.textContent = "";
  mensagemSucesso.textContent = "";

  const emailInformado = email.value.trim();

  if (!emailInformado) {
    erroEmail.textContent = "Digite seu e-mail.";
    return;
  }

  botaoEnviarCodigo.disabled = true;

  try {
    await window.PulseMineUsuarioService.recuperarSenha(emailInformado);

    mensagemSucesso.textContent =
      "Solicitação enviada. Verifique seu e-mail para obter o código.";
  } catch (erro) {
    erroEmail.textContent =
      erro.message || "Não foi possível solicitar a recuperação.";
  } finally {
    botaoEnviarCodigo.disabled = false;
  }
});

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  erroEmail.textContent = "";
  erroToken.textContent = "";
  erroSenha.textContent = "";
  erroConfirmacaoSenha.textContent = "";
  mensagemSucesso.textContent = "";

  let valido = true;

  if (!email.value.trim()) {
    erroEmail.textContent = "Digite seu e-mail.";
    valido = false;
  }

  if (!token.value.trim()) {
    erroToken.textContent = "Digite o código recebido por e-mail.";
    valido = false;
  }

  if (!novaSenha.value) {
    erroSenha.textContent = "Digite uma nova senha.";
    valido = false;
  } else if (novaSenha.value.length < 8) {
    erroSenha.textContent = "A senha deve ter pelo menos 8 caracteres.";
    valido = false;
  }

  if (!confirmarSenha.value) {
    erroConfirmacaoSenha.textContent = "Confirme sua nova senha.";
    valido = false;
  } else if (confirmarSenha.value !== novaSenha.value) {
    erroConfirmacaoSenha.textContent = "As senhas não coincidem.";
    valido = false;
  }

  if (!valido) return;

  const botaoEnviar = formulario.querySelector('button[type="submit"]');

  botaoEnviar.disabled = true;

  try {
    await window.PulseMineUsuarioService.redefinirSenha({
      email: email.value.trim(),
      token: token.value.trim(),
      novaSenha: novaSenha.value,
    });

    mensagemSucesso.textContent = "Senha alterada com sucesso!";

    setTimeout(() => {
      window.location.href = "../login/login.html";
    }, 2000);
  } catch (erro) {
    mensagemSucesso.textContent =
      erro.message || "Não foi possível alterar a senha.";
  } finally {
    botaoEnviar.disabled = false;
  }
});
