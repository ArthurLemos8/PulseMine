
import { conexaoBancoDados } from '../config/banco-dados.js';

// Listar todos os alertas
export async function listarAlertasModel() {
    const sql = `
        SELECT * FROM alerta
        ORDER BY id_alerta DESC
    `;

    const [linhas] = await conexaoBancoDados.execute(sql);
    return linhas;
}

export async function buscarAlertaPorIdModel(id) {
    const sql = `
        SELECT * FROM alerta
        WHERE id_alerta = ?
    `;

    const [linhas] = await conexaoBancoDados.execute(sql, [id]);
    return linhas[0] || null;
}

export async function buscarAlertasPorStatusModel(status) {
    const sql = `
        SELECT * FROM alerta
        WHERE status_resolucao = ?
        ORDER BY id_alerta DESC
    `;

    const [linhas] = await conexaoBancoDados.execute(sql, [status]);
    return linhas;
}

export async function atualizarStatusAlertaModel(id, status) {
    const sql = `
        UPDATE alerta
        SET status_resolucao = ?
        WHERE id_alerta = ?
    `;

    const [resultado] = await conexaoBancoDados.execute(
        sql,
        [status, id]
    );

    return resultado.affectedRows;
}
