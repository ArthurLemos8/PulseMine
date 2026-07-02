import { conexaoBancoDados } from '../config/banco-dados.js';

export async function salvarLeituraSensor(dados) {
    const sql = `
        INSERT INTO leituras_sensores 
        (dispositivo, numero_leitura, valor_vibracao, id_sensor_fk) 
        VALUES (?, ?, ?, ?)
    `;

    const valores = [
        dados.dispositivo,
        dados.numero_leitura,
        dados.valor_vibracao,
        dados.id_sensor_fk
    ];

    const [resultado] = await conexaoBancoDados.execute(sql, valores);
    
    const [linhas] = await conexaoBancoDados.execute(
        'SELECT * FROM leituras_sensores WHERE id = ?',
        [resultado.insertId]
    );
    
    return linhas[0];
}

export async function buscarUltimaLeituraSensor() {
    const [linhas] = await conexaoBancoDados.execute(
        'SELECT * FROM leituras_sensores ORDER BY id DESC LIMIT 1'
    );
    return linhas[0] || null;
}

export async function buscarLeiturasSensoresModel() {
    const [linhas] = await conexaoBancoDados.execute(
        'SELECT * FROM leituras_sensores ORDER BY id DESC LIMIT 100'
    );
    return linhas;
}