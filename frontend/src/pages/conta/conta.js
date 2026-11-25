document.addEventListener("DOMContentLoaded", () => {
  const formConta = document.getElementById("formConta");
  const formSenha = document.getElementById("formSenha");

  const mensagemConta = document.getElementById("mensagemConta");
  const mensagemSenha = document.getElementById("mensagemSenha");

  const nome = document.getElementById("nome");
  const telefone = document.getElementById("telefone");
  const email = document.getElementById("email");
  const cargo = document.getElementById("cargo");

  const senhaAtual = document.getElementById("senhaAtual");
  const novaSenha = document.getElementById("novaSenha");
  const confirmarSenha = document.getElementById("confirmarSenha");

  function mostrarMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `mensagem ${tipo}`;
  }

  function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (!numeros) return "";

    if (numeros.length <= 2) return `(${numeros}`;

    const ddd = numeros.slice(0, 2);
    const restante = numeros.slice(2);

    if (numeros.length <= 10) {
      return restante.length <= 4
        ? `(${ddd}) ${restante}`
        : `(${ddd}) ${restante.slice(0, 4)}-${restante.slice(4)}`;
    }

    return restante.length <= 5
      ? `(${ddd}) ${restante}`
      : `(${ddd}) ${restante.slice(0, 5)}-${restante.slice(5)}`;
  }

  telefone.addEventListener("input", () => {
    telefone.value = formatarTelefone(telefone.value);
  });

  document.querySelectorAll(".olho").forEach((botao) => {
    botao.addEventListener("click", () => {
      const campo = document.getElementById(botao.getAttribute("data-target"));

      const icone = botao.querySelector("i");

      if (!campo || !icone) return;

      const mostrar = campo.type === "password";

      campo.type = mostrar ? "text" : "password";
      icone.classList.toggle("bi-eye", !mostrar);
      icone.classList.toggle("bi-eye-slash", mostrar);
    });
  });

  async function carregarDados() {
    try {
      const resposta = await window.PulseMineUsuarioService.obterPerfil();
      const perfil =
        resposta?.data?.usuario ||
        resposta?.data ||
        resposta?.usuario ||
        resposta;

      nome.value = perfil.nome || "";
      email.value = perfil.email || "";
      telefone.value = perfil.telefone || "";
      cargo.value = perfil.cargo || "";
    } catch (erro) {
      mostrarMensagem(
        mensagemConta,
        `Não foi possível carregar o perfil: ${erro.message}`,
        "erro",
      );
    }
  }

  formConta.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const dados = {
      nome: nome.value.trim(),
      email: email.value.trim(),
    };

    if (!dados.nome || !dados.email) {
      mostrarMensagem(
        mensagemConta,
        "Preencha o nome completo e o e-mail.",
        "erro",
      );
      return;
    }

    if (!email.checkValidity()) {
      mostrarMensagem(
        mensagemConta,
        "Digite um endereço de e-mail válido.",
        "erro",
      );
      email.focus();
      return;
    }

    try {
      await window.PulseMineUsuarioService.atualizarPerfil(dados);

      mostrarMensagem(
        mensagemConta,
        "Dados enviados para atualização.",
        "sucesso",
      );
    } catch (erro) {
      mostrarMensagem(
        mensagemConta,
        `Não foi possível atualizar o perfil: ${erro.message}`,
        "erro",
      );
    }
  });

  formSenha.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const atual = senhaAtual.value;
    const nova = novaSenha.value;
    const confirmacao = confirmarSenha.value;

    if (!atual || !nova || !confirmacao) {
      mostrarMensagem(
        mensagemSenha,
        "Preencha todos os campos de senha.",
        "erro",
      );
      return;
    }

    if (nova.length < 8) {
      mostrarMensagem(
        mensagemSenha,
        "A nova senha deve ter pelo menos 8 caracteres.",
        "erro",
      );
      return;
    }

    if (nova === atual) {
      mostrarMensagem(
        mensagemSenha,
        "A nova senha deve ser diferente da senha atual.",
        "erro",
      );
      return;
    }

    if (nova !== confirmacao) {
      mostrarMensagem(
        mensagemSenha,
        "A confirmação não corresponde à nova senha.",
        "erro",
      );
      return;
    }

    try {
      await window.PulseMineUsuarioService.alterarSenha({
        senhaAtual: atual,
        novaSenha: nova,
      });

      formSenha.reset();

      mostrarMensagem(
        mensagemSenha,
        "Solicitação de alteração enviada.",
        "sucesso",
      );
    } catch (erro) {
      mostrarMensagem(
        mensagemSenha,
        `Não foi possível alterar a senha: ${erro.message}`,
        "erro",
      );
    }
  });

  carregarDados();
});
