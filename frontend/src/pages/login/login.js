function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formLogin");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const lembrarMe = document.getElementById("lembrarMe");
  const olho = document.getElementById("olhoSenha");
  const erroEmail = document.getElementById("erroEmail");
  const erroSenha = document.getElementById("erroSenha");

  const botao = formulario.querySelector('button[type="submit"]');

  const mensagem = document.createElement("small");
  mensagem.className = "erro";
  mensagem.id = "mensagemLogin";
  mensagem.setAttribute("aria-live", "polite");
  formulario.appendChild(mensagem);

  const emailSalvo = sessionStorage.getItem("pulseMineEmail");

  if (emailSalvo) {
    email.value = emailSalvo;
    lembrarMe.checked = true;
  }

  lembrarMe.addEventListener("change", () => {
    if (lembrarMe.checked) {
      sessionStorage.setItem("pulseMineEmail", email.value.trim());
    } else {
      sessionStorage.removeItem("pulseMineEmail");
    }
  });

  email.addEventListener("input", () => {
    if (lembrarMe.checked) {
      sessionStorage.setItem("pulseMineEmail", email.value.trim());
    }
  });

  olho.addEventListener("click", () => {
    const mostrar = senha.type === "password";

    senha.type = mostrar ? "text" : "password";

    olho.classList.toggle("bi-eye", !mostrar);
    olho.classList.toggle("bi-eye-slash", mostrar);
  });

  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    erroEmail.textContent = "";
    erroSenha.textContent = "";
    mensagem.textContent = "";

    email.classList.remove("erro", "sucesso");
    senha.classList.remove("erro", "sucesso");

    const emailValor = email.value.trim();
    const senhaValor = senha.value;

    let valido = true;

    if (!emailValor) {
      erroEmail.textContent = "Preencha o e-mail.";
      email.classList.add("erro");
      valido = false;
    } else if (!validarEmail(emailValor)) {
      erroEmail.textContent = "Digite um e-mail válido.";
      email.classList.add("erro");
      valido = false;
    }

    if (!senhaValor) {
      erroSenha.textContent = "Preencha a senha.";
      senha.classList.add("erro");
      valido = false;
    }

    if (!valido) return;

    botao.disabled = true;
    botao.textContent = "Entrando...";

    try {
      const resposta = await window.PulseMineUsuarioService.entrar({
        email: emailValor,
        senha: senhaValor,
      });

      const token = resposta?.token || resposta?.accessToken;

      if (!token) {
        throw new Error("O servidor não retornou o token de acesso.");
      }

      sessionStorage.setItem("pulseMineToken", token);

      if (lembrarMe.checked) {
        sessionStorage.setItem("pulseMineEmail", emailValor);
      } else {
        sessionStorage.removeItem("pulseMineEmail");
      }

      email.classList.add("sucesso");
      senha.classList.add("sucesso");

      window.location.href = "../dashboard/dashboard.html";
    } catch (erro) {
      mensagem.textContent = erro.message;
    } finally {
      botao.disabled = false;
      botao.textContent = "Login";
    }
  });
});
