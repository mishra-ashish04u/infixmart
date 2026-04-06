import { Router } from "express";
import auth from "../middleware/auth.js";
import { addToCartItemController, clearCartController, deleteCartItemController, getCartItemsController, updateCartItemQtyController } from "../controllers/cartController.js";

const cartRouter = Router();

cartRouter.post('/add', auth, addToCartItemController);
cartRouter.get('/', auth, getCartItemsController);
cartRouter.put('/update-qty', auth, updateCartItemQtyController);
cartRouter.delete('/delete', auth, deleteCartItemController);
cartRouter.delete('/clear', auth, clearCartController);


export default cartRouter;