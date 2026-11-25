(() => {
  const api = window.PulseMineAPI;

  if (!api) {
    console.error("PulseMineAPI não foi carregada.");
    return;
  }

  const LIMITE_ATENCAO = 4;
  const LIMITE_CRITICO = 7;

  function obterLista(resposta) {
    if (resposta?.success === false) {
      throw new Error(
        resposta.message || "Não foi possível buscar as leituras.",
      );
    }

    if (Array.isArray(resposta)) {
      return resposta;
    }

    if (Array.isArray(resposta?.data)) {
      return resposta.data;
    }

    throw new Error("Formato de leituras inválido.");
  }

  window.PulseMineAlertasService = {
    async listar() {
      const resposta = await api.get("/leituras-sensores");
      const leituras = obterLista(resposta);

      return leituras
        .map((leitura, indice) => {
          const valor = Number(
            String(leitura.valor_vibracao ?? "").replace(",", "."),
          );

          if (!Number.isFinite(valor) || valor < LIMITE_ATENCAO) {
            return null;
          }

          const dispositivo =
            leitura.dispositivo ||
            `Sensor ${leitura.id_sensor_fk ?? "não identificado"}`;

          const nivel = valor >= LIMITE_CRITICO ? "critico" : "aviso";

          const data =
            leitura.data_hora ||
            leitura.data_leitura ||
            leitura.created_at ||
            leitura.data_criacao ||
            null;

          return {
            id:
              leitura.id ??
              leitura.numero_leitura ??
              `${leitura.id_sensor_fk}-${indice}`,
            tipo_alerta: nivel,
            mensagem: `${dispositivo} apresentou vibração de ${valor.toFixed(2).replace(".", ",")} mm/s.`,
            valor_vibracao: valor,
            id_sensor_fk: leitura.id_sensor_fk,
            dispositivo,
            numero_leitura: leitura.numero_leitura,
            data_criacao: data,
          };
        })
        .filter(Boolean);
    },
  };
})();
