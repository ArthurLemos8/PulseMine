const formulario = document.getElementById("formRecuperar");

const email = document.getElementById("email");
const token = document.getElementById("token");
const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");

const botaoEnviarCodigo = document.getElementById("btnEnviarCodigo");
const botaoAlterarSenha = formulario.querySelector('button[type="submit"]');

const olhos = document.querySelectorAll(".olho");

const erroEmail = document.getElementById("erroEmail");
const erroToken = document.getElementById("erroToken");
const erroSenha = document.getElementById("erroSenha");
const erroConfirmacaoSenha = document.getElementById("erroConfirmarSenha");

const mensagemSucesso = document.getElementById("mensagemSucesso");

function validarEmail(valor) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(valor);
}

function limparMensagens() {
  erroEmail.textContent = "";
  erroToken.textContent = "";
  erroSenha.textContent = "";
  erroConfirmacaoSenha.textContent = "";
  mensagemSucesso.textContent = "";

  [email, token, novaSenha, confirmarSenha].forEach((campo) => {
    campo.classList.remove("erro", "sucesso");
    campo.removeAttribute("aria-invalid");
  });
}

function mostrarErro(campo, mensagem, elementoErro) {
  elementoErro.textContent = mensagem;
  campo.classList.add("erro");
  campo.setAttribute("aria-invalid", "true");
}

olhos.forEach((olho, index) => {
  const campo = index === 0 ? novaSenha : confirmarSenha;

  function alternarVisibilidade() {
    const mostrar = campo.type === "password";

    campo.type = mostrar ? "text" : "password";

    olho.classList.toggle("bi-eye", !mostrar);
    olho.classList.toggle("bi-eye-slash", mostrar);

    olho.setAttribute(
      "aria-label",
      mostrar ? "Ocultar senha" : "Mostrar senha",
    );
  }

  olho.addEventListener("click", alternarVisibilidade);

  olho.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      alternarVisibilidade();
    }
  });
});

botaoEnviarCodigo.addEventListener("click", async () => {
  erroEmail.textContent = "";
  mensagemSucesso.textContent = "";

  email.classList.remove("erro");
  email.removeAttribute("aria-invalid");

  const emailInformado = email.value.trim();

  if (!emailInformado) {
    mostrarErro(email, "Digite seu e-mail.", erroEmail);
    email.focus();
    return;
  }

  if (!validarEmail(emailInformado)) {
    mostrarErro(email, "Digite um e-mail válido.", erroEmail);
    email.focus();
    return;
  }

  botaoEnviarCodigo.disabled = true;

  try {
    await window.PulseMineUsuarioService.recuperarSenha(emailInformado);

    mensagemSucesso.textContent =
      "Solicitação enviada. Verifique seu e-mail para obter o código.";
  } catch (erro) {
    mostrarErro(
      email,
      erro.message || "Não foi possível solicitar a recuperação.",
      erroEmail,
    );
  } finally {
    botaoEnviarCodigo.disabled = false;
  }
});

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  limparMensagens();

  let valido = true;

  const emailInformado = email.value.trim();
  const tokenInformado = token.value.trim();

  if (!emailInformado) {
    mostrarErro(email, "Digite seu e-mail.", erroEmail);
    valido = false;
  } else if (!validarEmail(emailInformado)) {
    mostrarErro(email, "Digite um e-mail válido.", erroEmail);
    valido = false;
  }

  if (!tokenInformado) {
    mostrarErro(token, "Digite o código recebido por e-mail.", erroToken);
    valido = false;
  }

  if (!novaSenha.value) {
    mostrarErro(novaSenha, "Digite uma nova senha.", erroSenha);
    valido = false;
  } else if (novaSenha.value.length < 8) {
    mostrarErro(
      novaSenha,
      "A senha deve ter pelo menos 8 caracteres.",
      erroSenha,
    );
    valido = false;
  }

  if (!confirmarSenha.value) {
    mostrarErro(
      confirmarSenha,
      "Confirme sua nova senha.",
      erroConfirmacaoSenha,
    );
    valido = false;
  } else if (confirmarSenha.value !== novaSenha.value) {
    mostrarErro(
      confirmarSenha,
      "As senhas não coincidem.",
      erroConfirmacaoSenha,
    );
    valido = false;
  }

  if (!valido) {
    return;
  }

  botaoAlterarSenha.disabled = true;

  try {
    await window.PulseMineUsuarioService.redefinirSenha({
      email: emailInformado,
      token: tokenInformado,
      novaSenha: novaSenha.value,
    });

    mensagemSucesso.textContent = "Senha alterada com sucesso!";

    [email, token, novaSenha, confirmarSenha].forEach((campo) => {
      campo.classList.add("sucesso");
    });

    setTimeout(() => {
      window.location.href = "../login/login.html";
    }, 2000);
  } catch (erro) {
    mensagemSucesso.textContent =
      erro.message || "Não foi possível alterar a senha.";
  } finally {
    botaoAlterarSenha.disabled = false;
  }
});
