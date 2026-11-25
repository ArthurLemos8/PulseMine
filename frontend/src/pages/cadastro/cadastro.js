document.addEventListener("DOMContentLoaded", () => {
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

  const botao = formulario.querySelector('button[type="submit"]');

  let mensagemCadastro = document.getElementById("mensagemCadastro");

  if (!mensagemCadastro) {
    mensagemCadastro = document.createElement("small");
    mensagemCadastro.id = "mensagemCadastro";
    formulario.appendChild(mensagemCadastro);
  }

  function validarEmail(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }

  function limparErros() {
    [erroNome, erroEmail, erroSenha, erroConfirmarSenha].forEach((campo) => {
      campo.textContent = "";
    });

    [nome, email, senha, confirmarSenha].forEach((campo) => {
      campo.classList.remove("erro", "sucesso");
    });

    mensagemCadastro.textContent = "";
  }

  olhos.forEach((olho, index) => {
    olho.addEventListener("click", () => {
      const campo = index === 0 ? senha : confirmarSenha;
      const mostrar = campo.type === "password";

      campo.type = mostrar ? "text" : "password";

      olho.classList.toggle("bi-eye", !mostrar);
      olho.classList.toggle("bi-eye-slash", mostrar);
    });
  });

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limparErros();

    const dados = {
      nome: nome.value.trim(),
      email: email.value.trim(),
      senha: senha.value,
    };

    const confirmacao = confirmarSenha.value;
    let valido = true;

    if (!dados.nome) {
      erroNome.textContent = "Preencha o nome completo.";
      nome.classList.add("erro");
      valido = false;
    }

    if (!dados.email) {
      erroEmail.textContent = "Preencha o e-mail.";
      email.classList.add("erro");
      valido = false;
    } else if (!validarEmail(dados.email)) {
      erroEmail.textContent = "Digite um e-mail válido.";
      email.classList.add("erro");
      valido = false;
    }

    if (!dados.senha) {
      erroSenha.textContent = "Preencha a senha.";
      senha.classList.add("erro");
      valido = false;
    } else if (dados.senha.length < 8) {
      erroSenha.textContent = "A senha deve ter pelo menos 8 caracteres.";
      senha.classList.add("erro");
      valido = false;
    }

    if (!confirmacao) {
      erroConfirmarSenha.textContent = "Confirme sua senha.";
      confirmarSenha.classList.add("erro");
      valido = false;
    } else if (dados.senha !== confirmacao) {
      erroConfirmarSenha.textContent = "As senhas não coincidem.";
      confirmarSenha.classList.add("erro");
      valido = false;
    }

    if (!valido) return;

    botao.disabled = true;
    botao.textContent = "Cadastrando...";

    try {
      const resposta = await window.PulseMineUsuarioService.cadastrar(dados);

      if (resposta?.success === false) {
        throw new Error(
          resposta.message || "Não foi possível realizar o cadastro.",
        );
      }

      mensagemCadastro.className = "sucesso";
      mensagemCadastro.textContent =
        "Solicitação enviada. Faça login após a confirmação do cadastro.";

      formulario.reset();
    } catch (erro) {
      mensagemCadastro.className = "erro";
      mensagemCadastro.textContent = erro.message;
    } finally {
      botao.disabled = false;
      botao.textContent = "CADASTRAR";
    }
  });
});
