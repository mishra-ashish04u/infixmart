import express from 'express';
import { addAddress, getAddresses, updateAddress, deleteAddress } from '../controllers/addressController.js';

const router = express.Router();

router.post('/add', addAddress);
router.get('/:userId', getAddresses);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
