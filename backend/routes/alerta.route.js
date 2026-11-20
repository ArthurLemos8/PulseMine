import { Router } from 'express';

import {
    listarAlertas,
    buscarAlertaPorId,
    atualizarStatusAlerta
} from '../controllers/alerta.controller.js';

const router = Router();

router.get('/alertas', listarAlertas);

router.get('/alertas/:id', buscarAlertaPorId);

router.patch('/alertas/:id/status', atualizarStatusAlerta);

export default router;