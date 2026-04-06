import { Router } from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  getAttributeTypes,
  createAttributeType,
  updateAttributeType,
  deleteAttributeType,
  getAttributeValues,
  addAttributeValue,
  deleteAttributeValue,
} from "../controllers/attributeController.js";

const attributeRouter = Router();

// All routes are admin-only
attributeRouter.get("/",                           auth, adminOnly, getAttributeTypes);
attributeRouter.post("/",                          auth, adminOnly, createAttributeType);
attributeRouter.put("/:id",                        auth, adminOnly, updateAttributeType);
attributeRouter.delete("/:id",                     auth, adminOnly, deleteAttributeType);
attributeRouter.get("/:id/values",                 auth, adminOnly, getAttributeValues);
attributeRouter.post("/:id/values",                auth, adminOnly, addAttributeValue);
attributeRouter.delete("/:id/values/:valueId",     auth, adminOnly, deleteAttributeValue);

export default attributeRouter;
