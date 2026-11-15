(() => {
  const API_BASE_URL = (
    window.PULSEMINE_API_URL || "http://localhost:3000/api"
  ).replace(/\/+$/, "");

  async function requisicao(endpoint, opcoes = {}) {
    const caminho = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    const configuracao = {
      method: opcoes.method || "GET",
      headers: {
        Accept: "application/json",
        ...(opcoes.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...opcoes.headers,
      },
    };

    if (opcoes.body !== undefined) {
      configuracao.body =
        typeof opcoes.body === "string"
          ? opcoes.body
          : JSON.stringify(opcoes.body);
    }

    if (opcoes.signal) {
      configuracao.signal = opcoes.signal;
    }

    try {
      const resposta = await fetch(`${API_BASE_URL}${caminho}`, configuracao);

      const texto = await resposta.text();
      let dados = null;

      if (texto) {
        try {
          dados = JSON.parse(texto);
        } catch {
          dados = texto;
        }
      }

      if (!resposta.ok) {
        const mensagem =
          typeof dados === "object" && dados !== null
            ? dados.message || dados.mensagem || dados.error
            : null;

        throw new Error(mensagem || `Erro na API: ${resposta.status}`);
      }

      return dados;
    } catch (erro) {
      if (erro.name === "AbortError") throw erro;

      if (erro instanceof TypeError) {
        throw new Error(
          "Não foi possível conectar ao backend. Verifique o servidor e a URL.",
        );
      }

      throw erro;
    }
  }

  window.PulseMineAPI = {
    get: (endpoint, opcoes = {}) =>
      requisicao(endpoint, { ...opcoes, method: "GET" }),

    post: (endpoint, dados, opcoes = {}) =>
      requisicao(endpoint, {
        ...opcoes,
        method: "POST",
        body: dados,
      }),

    put: (endpoint, dados, opcoes = {}) =>
      requisicao(endpoint, {
        ...opcoes,
        method: "PUT",
        body: dados,
      }),

    patch: (endpoint, dados, opcoes = {}) =>
      requisicao(endpoint, {
        ...opcoes,
        method: "PATCH",
        body: dados,
      }),

    delete: (endpoint, opcoes = {}) =>
      requisicao(endpoint, {
        ...opcoes,
        method: "DELETE",
      }),
  };
})();
