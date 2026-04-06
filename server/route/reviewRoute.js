import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  checkMyReview,
} from "../controllers/reviewController.js";

const reviewRouter = Router();

reviewRouter.get("/product/:productId",  getProductReviews);          // public
reviewRouter.get("/my",                  auth, getMyReviews);          // own reviews
reviewRouter.get("/check/:productId",    auth, checkMyReview);         // did I review this product?
reviewRouter.post("/",                   auth, createReview);
reviewRouter.put("/:id",                 auth, updateReview);
reviewRouter.delete("/:id",             auth, deleteReview);

export default reviewRouter;
