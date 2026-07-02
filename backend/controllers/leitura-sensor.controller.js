
import { 
    salvarLeituraSensor, 
    buscarUltimaLeituraSensor, 
    buscarLeiturasSensoresModel,
    emissorLeituras 
} from '../models/leitura-sensor.model.js';

function validarDadosSensor(dadosSensor) {
    if (!dadosSensor.dispositivo || dadosSensor.valor_vibracao === undefined || !dadosSensor.id_sensor_fk) {
        return false;
    }
    return true;
}

export async function receberLeituraSensor(requisicao, resposta) {
    try {
        const dadosSensor = requisicao.body;

        console.log('Dados recebidos no backend:', dadosSensor);

        if (!validarDadosSensor(dadosSensor)) {
            return resposta.status(400).json({
                mensagem: 'Dados inválidos. Verifique o formato da leitura enviada.'
            });
        }

        const leituraSalva = await salvarLeituraSensor(dadosSensor);

        return resposta.status(201).json({
            mensagem: 'Leitura salva no banco de dados com sucesso',
            dados: leituraSalva
        });

    } catch (erro) {
        console.error('Erro ao salvar leitura no banco de dados:', erro.message);
        return resposta.status(500).json({
            mensagem: 'Erro interno ao salvar leitura no banco de dados'
        });
    }
}

export async function buscarUltimaLeitura(requisicao, resposta) {
    try {
        const ultimaLeitura = await buscarUltimaLeituraSensor();

        return resposta.status(200).json({
            mensagem: 'Última leitura consultada com sucesso',
            dados: ultimaLeitura
        });

    } catch (erro) {
        console.error('Erro ao buscar última leitura:', erro.message);
        return resposta.status(500).json({
            mensagem: 'Erro interno ao buscar última leitura'
        });
    }
}

export async function buscarLeiturasSensores(requisicao, resposta) {
    try {
        const leituras = await buscarLeiturasSensoresModel();

        return resposta.status(200).json({
            mensagem: 'Leituras consultadas com sucesso',
            total: leituras.length,
            dados: leituras
        });

    } catch (erro) {
        console.error('Erro ao buscar leituras dos sensores:', erro.message);
        return resposta.status(500).json({
            mensagem: 'Erro interno ao buscar leituras dos sensores'
        });
    }
}

export function acompanharLeiturasEmTempoReal(requisicao, resposta) {
    resposta.setHeader('Content-Type', 'text/event-stream');
    resposta.setHeader('Cache-Control', 'no-cache');
    resposta.setHeader('Connection', 'keep-alive');

    const enviarNovaLeitura = (leitura) => {
        resposta.write(`data: ${JSON.stringify(leitura)}\n\n`);
    };

    emissorLeituras.on('nova-leitura', enviarNovaLeitura);

    requisicao.on('close', () => {
        emissorLeituras.off('nova-leitura', enviarNovaLeitura);
        resposta.end();
    });
}