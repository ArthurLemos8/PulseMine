(() => {
  const api = window.PulseMineAPI;

  if (!api) {
    console.error("PulseMineAPI não foi carregada.");
    return;
  }

  window.PulseMineUsuarioService = {
    entrar(dados) {
      if (!dados) throw new Error("Dados de acesso não informados.");

      return api.post("/auth/login", dados);
    },

    cadastrar(dados) {
      if (!dados) throw new Error("Dados de cadastro não informados.");

      return api.post("/auth/cadastro", dados);
    },

    obterPerfil() {
      return api.get("/usuarios/me");
    },

    atualizarPerfil(dados) {
      if (!dados) throw new Error("Dados do perfil não informados.");

      return api.put("/usuarios/me", dados);
    },

    alterarSenha(dados) {
      if (!dados) throw new Error("Dados da senha não informados.");

      return api.patch("/usuarios/me/senha", dados);
    },

    recuperarSenha(email) {
      if (!email) throw new Error("E-mail não informado.");

      return api.post("/auth/recuperar-senha", { email });
    },

    redefinirSenha(dados) {
      if (!dados.email || !dados.token || !dados.novaSenha) {
        throw new Error("Preencha os dados da recuperação.");
      }

      return api.post("/auth/redefinir-senha", dados);
    },
  };
})();
