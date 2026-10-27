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

  const chavePerfil = "pulsemine_dados_conta";

  function mostrarMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `mensagem ${tipo}`;
  }

  function carregarDados() {
    try {
      const dadosSalvos = localStorage.getItem(chavePerfil);

      if (!dadosSalvos) {
        return;
      }

      const dados = JSON.parse(dadosSalvos);

      nome.value = dados.nome || "";
      telefone.value = dados.telefone || "";
      email.value = dados.email || "";
      cargo.value = dados.cargo || "";
    } catch (erro) {
      mostrarMensagem(
        mensagemConta,
        "Não foi possível carregar os dados salvos.",
        "erro",
      );
    }
  }

  function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length === 0) {
      return "";
    }

    if (numeros.length <= 2) {
      return `(${numeros}`;
    }

    const ddd = numeros.slice(0, 2);
    const restante = numeros.slice(2);

    if (numeros.length <= 10) {
      if (restante.length <= 4) {
        return `(${ddd}) ${restante}`;
      }

      return `(${ddd}) ${restante.slice(0, 4)}-${restante.slice(4)}`;
    }

    if (restante.length <= 5) {
      return `(${ddd}) ${restante}`;
    }

    return `(${ddd}) ${restante.slice(0, 5)}-${restante.slice(5)}`;
  }

  telefone.addEventListener("input", () => {
    telefone.value = formatarTelefone(telefone.value);
  });

  document.querySelectorAll(".olho").forEach((botao) => {
    botao.addEventListener("click", () => {
      const idCampo = botao.getAttribute("data-target");
      const campo = document.getElementById(idCampo);
      const icone = botao.querySelector("i");

      if (!campo || !icone) {
        return;
      }

      const mostrar = campo.type === "password";

      campo.type = mostrar ? "text" : "password";

      icone.classList.toggle("bi-eye", !mostrar);
      icone.classList.toggle("bi-eye-slash", mostrar);

      botao.setAttribute("aria-pressed", String(mostrar));
      botao.setAttribute(
        "aria-label",
        mostrar ? "Ocultar senha" : "Mostrar senha",
      );
    });
  });

  formConta.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const dados = {
      nome: nome.value.trim(),
      telefone: telefone.value.trim(),
      email: email.value.trim(),
      cargo: cargo.value.trim(),
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

    if (dados.telefone && dados.telefone.replace(/\D/g, "").length < 10) {
      mostrarMensagem(mensagemConta, "Digite um telefone válido.", "erro");
      telefone.focus();
      return;
    }

    try {
      localStorage.setItem(chavePerfil, JSON.stringify(dados));

      mostrarMensagem(
        mensagemConta,
        "Informações pessoais salvas com sucesso!",
        "sucesso",
      );
    } catch (erro) {
      mostrarMensagem(
        mensagemConta,
        "Não foi possível salvar os dados neste navegador.",
        "erro",
      );
    }
  });

  formSenha.addEventListener("submit", (evento) => {
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
      novaSenha.focus();
      return;
    }

    if (nova === atual) {
      mostrarMensagem(
        mensagemSenha,
        "A nova senha deve ser diferente da senha atual.",
        "erro",
      );
      novaSenha.focus();
      return;
    }

    if (nova !== confirmacao) {
      mostrarMensagem(
        mensagemSenha,
        "A confirmação não corresponde à nova senha.",
        "erro",
      );
      confirmarSenha.focus();
      return;
    }

    mostrarMensagem(
      mensagemSenha,
      "Os campos foram validados. Para alterar a senha efetivamente, é necessário conectar o formulário à API de autenticação.",
      "erro",
    );
  });

  carregarDados();
});
