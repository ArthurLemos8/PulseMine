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
        resposta.message ||
          resposta.mensagem ||
          "Não foi possível buscar os alertas.",
      );
    }

    const listas = [
      resposta,
      resposta?.data,
      resposta?.alertas,
      resposta?.leituras,
      resposta?.data?.data,
      resposta?.data?.alertas,
      resposta?.data?.leituras,
    ];

    const lista = listas.find(Array.isArray);

    if (!lista) {
      throw new Error("Formato de alertas inválido retornado pela API.");
    }

    return lista;
  }

  function converterNumero(valor) {
    if (valor === null || valor === undefined || String(valor).trim() === "") {
      return NaN;
    }

    return Number(String(valor).replace(",", "."));
  }

  function obterNivel(leitura, valor) {
    const tipoInformado = String(
      leitura.tipo_alerta ??
        leitura.nivel_alerta ??
        leitura.nivel ??
        leitura.severidade ??
        "",
    )
      .trim()
      .toLowerCase();

    if (/crit|alto|high/.test(tipoInformado)) {
      return "critico";
    }

    if (
      /normal|aviso|aten|warning|moder|medium|baixo|low/.test(tipoInformado)
    ) {
      return "aviso";
    }

    if (!Number.isFinite(valor)) {
      return null;
    }

    if (valor >= LIMITE_CRITICO) {
      return "critico";
    }

    if (valor >= LIMITE_ATENCAO) {
      return "aviso";
    }

    return null;
  }

  function obterData(leitura) {
    return (
      leitura.data_criacao ||
      leitura.data_hora ||
      leitura.data_leitura ||
      leitura.created_at ||
      leitura.createdAt ||
      null
    );
  }

  window.PulseMineAlertasService = {
    async listar() {
      const resposta = await api.get("/leituras-sensores", {
        cache: "no-store",
      });

      const leituras = obterLista(resposta);

      return leituras
        .map((leitura, indice) => {
          const valor = converterNumero(leitura.valor_vibracao);
          const nivel = obterNivel(leitura, valor);

          if (!nivel) {
            return null;
          }

          const identificadorSensor =
            leitura.id_sensor_fk ??
            leitura.id_sensor ??
            leitura.sensor_id ??
            leitura.sensor?.id ??
            null;

          const dispositivo =
            leitura.dispositivo ||
            leitura.nome_sensor ||
            leitura.sensor?.nome ||
            (identificadorSensor
              ? `Sensor ${identificadorSensor}`
              : "Sensor não identificado");

          const data = obterData(leitura);
          const mensagemInformada =
            leitura.mensagem || leitura.descricao || leitura.alerta || "";

          const valorFormatado = Number.isFinite(valor)
            ? `${valor.toFixed(2).replace(".", ",")} mm/s`
            : "valor não informado";

          return {
            id:
              leitura.id_alerta ??
              leitura.id ??
              leitura.uuid ??
              leitura.numero_leitura ??
              `${identificadorSensor ?? "sensor"}-${data ?? indice}`,
            tipo_alerta: nivel,
            mensagem:
              mensagemInformada ||
              `${dispositivo} apresentou vibração de ${valorFormatado}.`,
            valor_vibracao: Number.isFinite(valor) ? valor : null,
            id_sensor_fk: identificadorSensor,
            dispositivo,
            numero_leitura: leitura.numero_leitura,
            data_criacao: data,
          };
        })
        .filter(Boolean);
    },
  };
})();
