import { Router } from "express";
import auth      from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import { createReturn, getMyReturns, getAllReturns, updateReturnStatus } from "../controllers/returnController.js";

const returnRouter = Router();

returnRouter.post("/",       auth,             createReturn);       // customer: raise request
returnRouter.get("/my",      auth,             getMyReturns);       // customer: my requests
returnRouter.get("/",        auth, adminOnly,  getAllReturns);       // admin: all requests
returnRouter.put("/:id",     auth, adminOnly,  updateReturnStatus); // admin: approve/reject

export default returnRouter;
