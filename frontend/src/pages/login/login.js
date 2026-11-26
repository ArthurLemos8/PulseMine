document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formLogin");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const lembrarMe = document.getElementById("lembrarMe");
  const olho = document.getElementById("olhoSenha");

  const erroEmail = document.getElementById("erroEmail");
  const erroSenha = document.getElementById("erroSenha");
  const mensagem = document.getElementById("mensagemLogin");

  const botao = formulario.querySelector('button[type="submit"]');

  function obterEmailSalvo() {
    try {
      return sessionStorage.getItem("pulseMineEmail") || "";
    } catch {
      return "";
    }
  }

  function salvarEmail(valor) {
    try {
      if (lembrarMe.checked && valor) {
        sessionStorage.setItem("pulseMineEmail", valor);
      } else {
        sessionStorage.removeItem("pulseMineEmail");
      }
    } catch (erro) {
      console.warn("Não foi possível guardar o e-mail nesta sessão.", erro);
    }
  }

  function validarEmail(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }

  function limparMensagens() {
    erroEmail.textContent = "";
    erroSenha.textContent = "";
    mensagem.textContent = "";

    email.classList.remove("erro", "sucesso");
    senha.classList.remove("erro", "sucesso");

    email.removeAttribute("aria-invalid");
    senha.removeAttribute("aria-invalid");
  }

  function alternarVisibilidadeSenha() {
    const mostrar = senha.type === "password";

    senha.type = mostrar ? "text" : "password";

    olho.classList.toggle("bi-eye", !mostrar);
    olho.classList.toggle("bi-eye-slash", mostrar);

    olho.setAttribute(
      "aria-label",
      mostrar ? "Ocultar senha" : "Mostrar senha",
    );
  }

  const emailSalvo = obterEmailSalvo();

  if (emailSalvo) {
    email.value = emailSalvo;
    lembrarMe.checked = true;
  }

  lembrarMe.addEventListener("change", () => {
    salvarEmail(email.value.trim());
  });

  email.addEventListener("input", () => {
    if (lembrarMe.checked) {
      salvarEmail(email.value.trim());
    }
  });

  olho.addEventListener("click", alternarVisibilidadeSenha);

  olho.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      alternarVisibilidadeSenha();
    }
  });

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limparMensagens();

    const emailValor = email.value.trim();
    const senhaValor = senha.value;

    let valido = true;

    if (!emailValor) {
      erroEmail.textContent = "Preencha o e-mail.";
      email.classList.add("erro");
      email.setAttribute("aria-invalid", "true");
      valido = false;
    } else if (!validarEmail(emailValor)) {
      erroEmail.textContent = "Digite um e-mail válido.";
      email.classList.add("erro");
      email.setAttribute("aria-invalid", "true");
      valido = false;
    }

    if (!senhaValor) {
      erroSenha.textContent = "Preencha a senha.";
      senha.classList.add("erro");
      senha.setAttribute("aria-invalid", "true");
      valido = false;
    }

    if (!valido) return;

    botao.disabled = true;
    botao.textContent = "Entrando...";

    try {
      if (!window.PulseMineUsuarioService) {
        throw new Error("O serviço de usuário não foi carregado.");
      }

      const resposta = await window.PulseMineUsuarioService.entrar({
        email: emailValor,
        senha: senhaValor,
      });

      if (resposta?.success === false) {
        throw new Error(
          resposta.message || "Não foi possível realizar o login.",
        );
      }

      const token =
        resposta?.token ||
        resposta?.accessToken ||
        resposta?.data?.token ||
        resposta?.data?.accessToken;

      if (!token) {
        throw new Error("O servidor não retornou o token de acesso.");
      }

      try {
        sessionStorage.setItem("pulseMineToken", token);
      } catch {
        throw new Error("Não foi possível iniciar a sessão neste navegador.");
      }

      salvarEmail(emailValor);

      window.location.href = "../dashboard/dashboard.html";
    } catch (erro) {
      mensagem.textContent = erro.message;
    } finally {
      botao.disabled = false;
      botao.textContent = "Login";
    }
  });
});
