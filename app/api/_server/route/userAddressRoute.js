import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getMyAddresses, addMyAddress, updateMyAddress, deleteMyAddress } from '../controllers/addressController.js';

const userAddressRouter = Router();

userAddressRouter.get('/', auth, getMyAddresses);
userAddressRouter.post('/', auth, addMyAddress);
userAddressRouter.put('/:id', auth, updateMyAddress);
userAddressRouter.delete('/:id', auth, deleteMyAddress);

export default userAddressRouter;
