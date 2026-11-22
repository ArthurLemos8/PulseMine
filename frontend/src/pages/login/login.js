function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+[^\s@]+$/;
  return emailRegex.test(email);
}

const formulario = document.querySelector("form");

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const lembrarMe = document.getElementById("lembrarMe");

const olho = document.querySelector(".olho");

const erroEmail = document.getElementById("erroEmail");
const erroSenha = document.getElementById("erroSenha");

document.addEventListener("DOMContentLoaded", () => {
  const emailSalvo = localStorage.getItem("pulseMineEmail");

  if (emailSalvo) {
    email.value = emailSalvo;
    lembrarMe.checked = true;
  }
});

lembrarMe.addEventListener("change", () => {
  if (lembrarMe.checked) {
    localStorage.setItem("pulseMineEmail", email.value.trim());
  } else {
    localStorage.removeItem("pulseMineEmail");
  }
});

email.addEventListener("input", () => {
  if (lembrarMe.checked) {
    localStorage.setItem("pulseMineEmail", email.value.trim());
  }
});

olho.addEventListener("click", () => {
  if (senha.type === "password") {
    senha.type = "text";

    olho.classList.remove("bi-eye");
    olho.classList.add("bi-eye-slash");
  } else {
    senha.type = "password";

    olho.classList.remove("bi-eye-slash");
    olho.classList.add("bi-eye");
  }
});

formulario.addEventListener("submit", (event) => {
  event.preventDefault();

  const emailValor = email.value.trim();
  const senhaValor = senha.value.trim();

  erroEmail.textContent = "";
  erroSenha.textContent = "";

  email.classList.remove("erro", "sucesso");
  senha.classList.remove("erro", "sucesso");

  let formularioValido = true;

  if (emailValor === "") {
    erroEmail.textContent = "Preencha o e-mail.";
    email.classList.add("erro");

    formularioValido = false;
  } else if (!validarEmail(emailValor)) {
    erroEmail.textContent = "Digite um e-mail válido.";
    email.classList.add("erro");

    formularioValido = false;
  }

  if (senhaValor === "") {
    erroSenha.textContent = "Preencha a senha.";
    senha.classList.add("erro");

    formularioValido = false;
  } else if (senhaValor.length < 8) {
    erroSenha.textContent = "A senha deve ter pelo menos 8 caracteres.";
    senha.classList.add("erro");

    formularioValido = false;
  }

  if (!formularioValido) {
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (usuarios.length === 0) {
    erroEmail.textContent = "Nenhum usuário foi cadastrado.";

    email.classList.add("erro");
    senha.classList.add("erro");

    return;
  }

  const usuarioEncontrado = usuarios.find((user) => user.email === emailValor);

  if (!usuarioEncontrado) {
    erroEmail.textContent = "E-mail incorreto.";
    email.classList.add("erro");

    return;
  }

  if (usuarioEncontrado.senha !== senhaValor) {
    erroSenha.textContent = "Senha incorreta.";
    senha.classList.add("erro");

    return;
  }

  if (lembrarMe.checked) {
    localStorage.setItem("pulseMineEmail", emailValor);
  } else {
    localStorage.removeItem("pulseMineEmail");
  }

  email.classList.add("sucesso");
  senha.classList.add("sucesso");

  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));

  window.location.href = "../dashboard/dashboard.html";
});
