import express from 'express';
import { addProductSize, getProductSizes, deleteProductSize } from '../controllers/productSizeController.js';

const router = express.Router();

router.post('/create', addProductSize);
router.get('/', getProductSizes);
router.delete('/:id', deleteProductSize);

export default router;
