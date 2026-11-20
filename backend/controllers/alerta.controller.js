
import {
    listarAlertasModel,
    buscarAlertaPorIdModel,
    buscarAlertasPorStatusModel,
    atualizarStatusAlertaModel
} from '../models/alerta.model.js';

export async function listarAlertas(req, res) {
    try {
        const { status } = req.query;

        const alertas = status
            ? await buscarAlertasPorStatusModel(status)
            : await listarAlertasModel();

        return res.status(200).json(alertas);

    } catch (erro) {
        console.error('Erro ao listar alertas:', erro);
        return res.status(500).json({
            mensagem: 'Erro interno ao consultar alertas.'
        });
    }
}

export async function buscarAlertaPorId(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const alerta = await buscarAlertaPorIdModel(id);

        if (!alerta) {
            return res.status(404).json({
                mensagem: 'Alerta não encontrado.'
            });
        }

        return res.status(200).json(alerta);

    } catch (erro) {
        console.error('Erro ao buscar alerta:', erro);
        return res.status(500).json({
            mensagem: 'Erro interno ao buscar alerta.'
        });
    }
}

export async function atualizarStatusAlerta(req, res) {
    try {
        const id = Number(req.params.id);
        const { status_resolucao } = req.body ?? {};

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const statusPermitidos = ['Pendente', 'Resolvido'];

        if (!statusPermitidos.includes(status_resolucao)) {
            return res.status(400).json({
                mensagem: 'Status deve ser Pendente ou Resolvido.'
            });
        }

        const linhasAfetadas = await atualizarStatusAlertaModel(
            id,
            status_resolucao
        );

        if (linhasAfetadas === 0) {
            return res.status(404).json({
                mensagem: 'Alerta não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Status atualizado com sucesso.',
            id_alerta: id,
            status_resolucao
        });

    } catch (erro) {
        console.error('Erro ao atualizar alerta:', erro);
        return res.status(500).json({
            mensagem: 'Erro interno ao atualizar alerta.'
        });
    }
}