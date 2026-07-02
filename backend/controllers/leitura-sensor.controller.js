import { 
    salvarLeituraSensor, 
    buscarUltimaLeituraSensor, 
    buscarLeiturasSensoresModel 
} from '../models/leitura-sensor.model.js';

export async function receberLeituraSensor(req, res) {
    try {
        const dados = req.body;

        if (!dados.valor_vibracao || !dados.id_sensor_fk) {
            return res.status(400).json({
                success: false,
                message: 'valor_vibracao e id_sensor_fk são obrigatórios'
            });
        }

        const leitura = await salvarLeituraSensor(dados);

        res.status(201).json({
            success: true,
            message: 'Leitura salva',
            data: leitura
        });

    } catch (error) {
        console.error('Erro:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar leitura'
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