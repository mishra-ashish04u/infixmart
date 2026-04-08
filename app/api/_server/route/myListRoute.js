import {Router} from "express";
import auth from "../middleware/auth.js";
import { addToMyListController, deleteFromMyListController, getMyListController } from "../controllers/myListController.js";

const myListRouter = Router();

myListRouter.post("/add", auth, addToMyListController);
myListRouter.get("/", auth, getMyListController);
myListRouter.delete("/remove/:id", auth, deleteFromMyListController);

export default myListRouter;