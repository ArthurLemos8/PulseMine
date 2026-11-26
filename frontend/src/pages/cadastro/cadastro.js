document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formCadastro");

  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirme-senha");

  const erroNome = document.getElementById("erroNome");
  const erroEmail = document.getElementById("erroEmail");
  const erroSenha = document.getElementById("erroSenha");
  const erroConfirmarSenha = document.getElementById("erroConfirmarSenha");

  const mensagemCadastro = document.getElementById("mensagemCadastro");

  const botao = formulario.querySelector('button[type="submit"]');

  function validarEmail(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }

  function limparErros() {
    [erroNome, erroEmail, erroSenha, erroConfirmarSenha].forEach((campo) => {
      campo.textContent = "";
    });

    [nome, email, senha, confirmarSenha].forEach((campo) => {
      campo.classList.remove("erro", "sucesso");
      campo.removeAttribute("aria-invalid");
    });

    mensagemCadastro.textContent = "";
    mensagemCadastro.className = "";
  }

  function mostrarErro(campo, elementoErro, texto) {
    elementoErro.textContent = texto;
    campo.classList.add("erro");
    campo.setAttribute("aria-invalid", "true");
  }

  document.querySelectorAll(".olho").forEach((olho, indice) => {
    const campo = indice === 0 ? senha : confirmarSenha;

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

    olho.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        alternarVisibilidade();
      }
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
      mostrarErro(nome, erroNome, "Preencha o nome completo.");
      valido = false;
    }

    if (!dados.email) {
      mostrarErro(email, erroEmail, "Preencha o e-mail.");
      valido = false;
    } else if (!validarEmail(dados.email)) {
      mostrarErro(email, erroEmail, "Digite um e-mail válido.");
      valido = false;
    }

    if (!dados.senha) {
      mostrarErro(senha, erroSenha, "Preencha a senha.");
      valido = false;
    } else if (dados.senha.length < 8) {
      mostrarErro(
        senha,
        erroSenha,
        "A senha deve ter pelo menos 8 caracteres.",
      );
      valido = false;
    }

    if (!confirmacao) {
      mostrarErro(confirmarSenha, erroConfirmarSenha, "Confirme sua senha.");
      valido = false;
    } else if (dados.senha !== confirmacao) {
      mostrarErro(
        confirmarSenha,
        erroConfirmarSenha,
        "As senhas não coincidem.",
      );
      valido = false;
    }

    if (!valido) return;

    botao.disabled = true;
    botao.textContent = "Cadastrando...";

    try {
      if (!window.PulseMineUsuarioService) {
        throw new Error("O serviço de usuário não foi carregado.");
      }

      const resposta = await window.PulseMineUsuarioService.cadastrar(dados);

      if (resposta?.success === false) {
        throw new Error(
          resposta.message || "Não foi possível realizar o cadastro.",
        );
      }

      mensagemCadastro.className = "sucesso";
      mensagemCadastro.textContent =
        "Cadastro enviado com sucesso. Você poderá fazer login após a confirmação do servidor.";

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
