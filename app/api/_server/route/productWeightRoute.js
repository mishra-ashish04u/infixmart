import express from 'express';
import { addProductWeight, getProductWeights, deleteProductWeight } from '../controllers/productWeightController.js';

const router = express.Router();

router.post('/create', addProductWeight);
router.get('/', getProductWeights);
router.delete('/:id', deleteProductWeight);

export default router;
