import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const caminhoPortaSerial =
  process.env.PORTA_SERIAL || '/dev/ttyACM0';

const velocidadeSerial =
  Number(process.env.VELOCIDADE_SERIAL || 9600);

const urlBackend =
  process.env.URL_BACKEND ||
  'http://localhost:3000/api/leituras-sensores';

// Instância da porta serial
const portaSerial = new SerialPort({
  path: caminhoPortaSerial,
  baudRate: velocidadeSerial
});

// Parser de linha
const leitorLinha = portaSerial.pipe(
  new ReadlineParser({
    delimiter: '\n'
  })
);

// Função para validar os dados recebidos
function validarDadosSensor(dados) {

  if (typeof dados !== 'object' || dados == null) {
    return false;
  }

  if (typeof dados.dispositivo !== 'string') {
    return false;
  }

  if (typeof dados.tempoMillis !== 'number') {
    return false;
  }

  if (typeof dados.aceleracaoX !== 'number') {
    return false;
  }

  if (typeof dados.aceleracaoY !== 'number') {
    return false;
  }

  if (typeof dados.aceleracaoZ !== 'number') {
    return false;
  }

  if (typeof dados.aceleracaoTotal !== 'number') {
    return false;
  }

  return true;
}

// Função para enviar ao backend
async function enviarParaBackend(dadosSensor) {

  const resposta = await fetch(urlBackend, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosSensor)
  });

  if (!resposta.ok) {
    throw new Error(
      `Erro HTTP ao enviar para backend: ${resposta.status}`
    );
  }

  return await resposta.json();
}

// Porta aberta
portaSerial.on('open', () => {
  console.log(
    `Porta serial aberta em ${caminhoPortaSerial} com velocidade ${velocidadeSerial}`
  );
});

// Erro da porta
portaSerial.on('error', (erro) => {
  console.error(
    'Erro na porta serial:',
    erro.message
  );
});

// Recebimento de dados
leitorLinha.on('data', async (linhaRecebida) => {

  const linha = linhaRecebida.trim();

  if (!linha) {
    return;
  }

  console.log(
    'Linha recebida do Arduino:',
    linha
  );

  try {

    const dadosSensor = JSON.parse(linha);

    if (!validarDadosSensor(dadosSensor)) {

      console.warn(
        'JSON recebido, mas inválido:',
        dadosSensor
      );

      return;
    }

    console.log(
      'JSON validado com sucesso:',
      dadosSensor
    );
    const dt = 0.1;

    const vibracaoMmS =
      Math.abs(dadosSensor.aceleracaoTotal - 1.0)
      * 9810.0
      * dt;

    console.log(
      `Vibração estimada: ${vibracaoMmS.toFixed(2)} mm/s`
    );

    const respostaBackend =
      await enviarParaBackend(dadosSensor);

    console.log(
      'Dados enviados com sucesso:',
      respostaBackend
    );

  } catch (erro) {

    console.error(
      'Falha ao processar linha recebida:',
      erro.message
    );
  }
});
