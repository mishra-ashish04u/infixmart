import express from 'express';
import { addProductRam, getProductRams, deleteProductRam } from '../controllers/productRamController.js';

const router = express.Router();

router.post('/create', addProductRam);
router.get('/', getProductRams);
router.delete('/:id', deleteProductRam);

export default router;
