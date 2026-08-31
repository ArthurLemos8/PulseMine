const formulario = document.querySelector("form");

const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirme-senha");

const olhos = document.querySelectorAll(".olho");

const erroNome = document.getElementById("erroNome");
const erroEmail = document.getElementById("erroEmail");
const erroSenha = document.getElementById("erroSenha");
const erroConfirmarSenha = document.getElementById("erroConfirmarSenha");

const mensagemSucesso = document.getElementById("mensagemSucesso");

olhos.forEach((olho, index) => {
  olho.addEventListener("click", () => {
    const campo = index === 0 ? senha : confirmarSenha;

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

  const nomeValor = nome.value.trim();
  const emailValor = email.value.trim();
  const senhaValor = senha.value.trim();
  const confirmarSenhaValor = confirmarSenha.value.trim();

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  erroNome.textContent = "";
  erroEmail.textContent = "";
  erroSenha.textContent = "";
  erroConfirmarSenha.textContent = "";
  mensagemSucesso.textContent = "";

  nome.classList.remove("erro", "sucesso");
  email.classList.remove("erro", "sucesso");
  senha.classList.remove("erro", "sucesso");
  confirmarSenha.classList.remove("erro", "sucesso");

  let formularioValido = true;
  if (nomeValor === "") {
    erroNome.textContent = "Preencha o nome completo.";
    nome.classList.add("erro");
    formularioValido = false;
  } else {
    nome.classList.add("sucesso");
  }

  if (emailValor === "") {
    erroEmail.textContent = "Preencha o e-mail.";
    email.classList.add("erro");
    formularioValido = false;
  } else if (!emailValido.test(emailValor)) {
    erroEmail.textContent = "Digite um e-mail válido.";
    email.classList.add("erro");
    formularioValido = false;
  } else {
    email.classList.add("sucesso");
  }

  if (senhaValor === "") {
    erroSenha.textContent = "Preencha a senha.";
    senha.classList.add("erro");
    formularioValido = false;
  } else if (senhaValor.length < 8) {
    erroSenha.textContent = "A senha deve ter pelo menos 8 caracteres.";
    senha.classList.add("erro");
    formularioValido = false;
  } else {
    senha.classList.add("sucesso");
  }

  if (confirmarSenhaValor === "") {
    erroConfirmarSenha.textContent = "Confirme sua senha.";
    confirmarSenha.classList.add("erro");
    formularioValido = false;
  } else if (senhaValor !== confirmarSenhaValor) {
    erroConfirmarSenha.textContent = "As senhas não coincidem.";
    confirmarSenha.classList.add("erro");
    formularioValido = false;
  } else {
    confirmarSenha.classList.add("sucesso");
  }

  if (!formularioValido) {
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const existe = usuarios.some((user) => user.email === emailValor);

  if (existe) {
    erroEmail.textContent = "Este e-mail já está cadastrado.";
    email.classList.remove("sucesso");
    email.classList.add("erro");
    return;
  }

  const usuario = {
    nome: nomeValor,
    email: emailValor,
    senha: senhaValor,
  };

  usuarios.push(usuario);

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  mensagemSucesso.textContent = "Cadastro realizado com sucesso!";

  formulario.reset();

  nome.classList.remove("erro");
  email.classList.remove("erro");
  senha.classList.remove("erro");
  confirmarSenha.classList.remove("erro");

  nome.classList.add("sucesso");
  email.classList.add("sucesso");
  senha.classList.add("sucesso");
  confirmarSenha.classList.add("sucesso");

  olhos.forEach((olho) => {
    olho.classList.remove("bi-eye-slash");
    olho.classList.add("bi-eye");
  });

  senha.type = "password";
  confirmarSenha.type = "password";
});
