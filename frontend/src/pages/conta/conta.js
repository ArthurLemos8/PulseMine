document.addEventListener("DOMContentLoaded", () => {
  const formConta = document.getElementById("formConta");
  const formSenha = document.getElementById("formSenha");

  const mensagemConta = document.getElementById("mensagemConta");
  const mensagemSenha = document.getElementById("mensagemSenha");

  const nome = document.getElementById("nome");
  const email = document.getElementById("email");

  const senhaAtual = document.getElementById("senhaAtual");
  const novaSenha = document.getElementById("novaSenha");
  const confirmarSenha = document.getElementById("confirmarSenha");

  function mostrarMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `mensagem ${tipo}`;
  }

  function obterPerfil(resposta) {
    return (
      resposta?.data?.usuario || resposta?.data || resposta?.usuario || resposta
    );
  }

  function alternarSenha(botao) {
    const campo = document.getElementById(botao.getAttribute("data-target"));

    const icone = botao.querySelector("i");

    if (!campo || !icone) return;

    const mostrar = campo.type === "password";

    campo.type = mostrar ? "text" : "password";

    icone.classList.toggle("bi-eye", !mostrar);
    icone.classList.toggle("bi-eye-slash", mostrar);

    botao.setAttribute(
      "aria-label",
      mostrar ? "Ocultar senha" : "Mostrar senha",
    );
  }

  document.querySelectorAll(".olho").forEach((botao) => {
    botao.addEventListener("click", () => {
      alternarSenha(botao);
    });
  });

  function definirCarregamento(botao, carregando, textoOriginal) {
    botao.disabled = carregando;
    botao.textContent = carregando ? "Enviando..." : textoOriginal;
  }

  async function carregarDados() {
    try {
      if (!window.PulseMineUsuarioService) {
        throw new Error("O serviço de usuário não foi carregado.");
      }

      const resposta = await window.PulseMineUsuarioService.obterPerfil();

      const perfil = obterPerfil(resposta);

      nome.value = perfil.nome || "";
      email.value = perfil.email || "";
    } catch (erro) {
      console.error("Erro ao carregar perfil:", erro);

      mostrarMensagem(
        mensagemConta,
        `Não foi possível carregar o perfil: ${erro.message}`,
        "erro",
      );
    }
  }

  formConta.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    mensagemConta.textContent = "";

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

    const botao = formConta.querySelector('button[type="submit"]');
    const textoOriginal = botao.textContent;

    definirCarregamento(botao, true, textoOriginal);

    try {
      await window.PulseMineUsuarioService.atualizarPerfil(dados);

      mostrarMensagem(
        mensagemConta,
        "Dados enviados para atualização.",
        "sucesso",
      );
    } catch (erro) {
      console.error("Erro ao atualizar perfil:", erro);

      mostrarMensagem(
        mensagemConta,
        `Não foi possível atualizar o perfil: ${erro.message}`,
        "erro",
      );
    } finally {
      definirCarregamento(botao, false, textoOriginal);
    }
  });

  formSenha.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    mensagemSenha.textContent = "";

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

    const botao = formSenha.querySelector('button[type="submit"]');
    const textoOriginal = botao.textContent;

    definirCarregamento(botao, true, textoOriginal);

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
      console.error("Erro ao alterar senha:", erro);

      mostrarMensagem(
        mensagemSenha,
        `Não foi possível alterar a senha: ${erro.message}`,
        "erro",
      );
    } finally {
      definirCarregamento(botao, false, textoOriginal);
    }
  });

  carregarDados();
});
