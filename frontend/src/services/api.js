(() => {
  const API_BASE_URL = String(window.PULSEMINE_API_URL || "")
    .trim()
    .replace(/\/+$/, "");

  function obterToken() {
    try {
      return sessionStorage.getItem("pulseMineToken") || "";
    } catch {
      return "";
    }
  }

  async function requisicao(endpoint, opcoes = {}) {
    if (!API_BASE_URL) {
      throw new Error(
        "O endereço da API ainda não foi configurado em services/config.js.",
      );
    }

    const caminho = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    const token = obterToken();

    const configuracao = {
      method: opcoes.method || "GET",
      headers: {
        Accept: "application/json",
        ...(opcoes.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opcoes.headers || {}),
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
            ? dados.message || dados.mensagem || dados.error || dados.erro
            : null;

        throw new Error(
          mensagem || `Erro HTTP ${resposta.status} na rota ${caminho}.`,
        );
      }

      return dados;
    } catch (erro) {
      if (erro.name === "AbortError") {
        throw erro;
      }

      if (erro instanceof TypeError) {
        throw new Error(
          "Não foi possível acessar a API. Verifique o endereço, o servidor e a configuração de CORS.",
        );
      }

      throw erro;
    }
  }

  window.PulseMineAPI = {
    get(endpoint, opcoes = {}) {
      return requisicao(endpoint, {
        ...opcoes,
        method: "GET",
      });
    },

    post(endpoint, dados, opcoes = {}) {
      return requisicao(endpoint, {
        ...opcoes,
        method: "POST",
        body: dados,
      });
    },

    put(endpoint, dados, opcoes = {}) {
      return requisicao(endpoint, {
        ...opcoes,
        method: "PUT",
        body: dados,
      });
    },

    patch(endpoint, dados, opcoes = {}) {
      return requisicao(endpoint, {
        ...opcoes,
        method: "PATCH",
        body: dados,
      });
    },

    delete(endpoint, opcoes = {}) {
      return requisicao(endpoint, {
        ...opcoes,
        method: "DELETE",
      });
    },
  };
})();
