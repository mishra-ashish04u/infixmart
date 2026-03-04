import { Router } from "express";
import auth from "../middleware/auth.js";
import { addToCartItemController, deleteCartItemController, getCartItemsController, updateCartItemQtyController } from "../controllers/cartController.js";

const cartRouter = Router();

cartRouter.post('/add', auth, addToCartItemController);
cartRouter.get('/', auth, getCartItemsController);
cartRouter.put('/update-qty', auth, updateCartItemQtyController);
cartRouter.delete('/delete', auth, deleteCartItemController);


export default cartRouter;