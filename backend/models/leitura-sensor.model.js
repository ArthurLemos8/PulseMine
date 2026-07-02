
import { EventEmitter } from 'node:events';
import { conexaoBancoDados } from '../config/banco-dados.js';

export const emissorLeituras = new EventEmitter();

export async function salvarLeituraSensor(dadosSensor) {
    const comandoSql = `
    INSERT INTO leituras_sensores (
        dispositivo,
        numero_leitura,
        valor_vibracao,
        id_sensor_fk
    ) VALUES (?, ?, ?, ?)
    `;

    const valores = [
        dadosSensor.dispositivo,
        dadosSensor.numero_leitura,
        dadosSensor.valor_vibracao,
        dadosSensor.id_sensor_fk
    ];

    const [resultado] = await conexaoBancoDados.execute(comandoSql, valores);
    const leituraSalva = await buscarLeituraSensorPorId(resultado.insertId);

    emissorLeituras.emit('nova-leitura', leituraSalva);

    return leituraSalva;
}

export async function buscarLeituraSensorPorId(id) {
    const comandoSql = 'SELECT * FROM leituras_sensores WHERE id = ?';
    const [linhas] = await conexaoBancoDados.execute(comandoSql, [id]);
    return linhas[0];
}

export async function buscarUltimaLeituraSensor() {
    const comandoSql = 'SELECT * FROM leituras_sensores ORDER BY id DESC LIMIT 1';
    const [linhas] = await conexaoBancoDados.execute(comandoSql);
    return linhas[0] || null;
}

export async function buscarLeiturasSensoresModel() {
    const comandoSql = 'SELECT * FROM leituras_sensores ORDER BY id DESC';
    const [linhas] = await conexaoBancoDados.execute(comandoSql);
    return linhas;
}