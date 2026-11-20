import { 
    salvarLeituraSensor, 
    buscarUltimaLeituraSensor, 
    buscarLeiturasSensoresModel 
} from '../models/leitura-sensor.model.js';
import { alertaService } from '../services/alerta.service.js';

export async function receberLeituraSensor(req, res) {
    try {
        const dados = req.body ?? {};

        const vibracao = Number(dados.valor_vibracao);
        const idSensor = Number(dados.id_sensor_fk);

        // Validar os dados recebidos
        if (
            dados.valor_vibracao === undefined ||
            dados.valor_vibracao === null ||
            dados.valor_vibracao === '' ||
            !Number.isFinite(vibracao) ||
            !Number.isSafeInteger(idSensor) ||
            idSensor <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'valor_vibracao ou id_sensor_fk inválidos'
            });
        }

        // Salvar leitura no MySQL
        const leitura = await salvarLeituraSensor({
            ...dados,
            valor_vibracao: vibracao,
            id_sensor_fk: idSensor
        });

        // Analisar se a vibração é crítica
        await alertaService.analisarLeitura(leitura);

        return res.status(201).json({
            success: true,
            message: 'Leitura salva e analisada',
            data: leitura
        });

    } catch (error) {
        console.error('Erro ao processar leitura:', error);

        return res.status(500).json({
            success: false,
            message: 'Erro ao processar leitura'
        });
    }
}


export async function buscarUltimaLeitura(req, res) {
    try {
        const leitura = await buscarUltimaLeituraSensor();

        if (!leitura) {
            return res.status(404).json({
                success: false,
                message: 'Nenhuma leitura encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Última leitura',
            data: leitura
        });

    } catch (error) {
        console.error('Erro:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar leitura'
        });
    }
}

export async function buscarLeiturasSensores(req, res) {
    try {
        const leituras = await buscarLeiturasSensoresModel();

        res.status(200).json({
            success: true,
            message: 'Leituras encontradas',
            total: leituras.length,
            data: leituras
        });

    } catch (error) {
        console.error('Erro:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar leituras'
        });
    }
}