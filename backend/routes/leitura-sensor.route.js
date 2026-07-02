import express from 'express';
import {
    receberLeituraSensor,
    buscarLeiturasSensores,
    buscarUltimaLeitura,
    acompanharLeiturasEmTempoReal
} from '../controllers/leitura-sensor.controller.js';

const rotasLeituraSensor = express.Router();

rotasLeituraSensor.post('/leituras-sensores', receberLeituraSensor);

rotasLeituraSensor.get('/leituras-sensores', buscarLeiturasSensores);

rotasLeituraSensor.get('/leituras-sensores/ultima', buscarUltimaLeitura);

rotasLeituraSensor.get('/leituras-sensores/eventos', acompanharLeiturasEmTempoReal);

export default rotasLeituraSensor;