import { Router } from 'express';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';
import upload from '../middleware/multer.js';
import { createProduct, deleteImage, deleteProduct, deleteMultipleProducts, getAllProducts, getFeaturedProduct, getProductByCatId, getProductByCatName, getProductByPrice, getProductByRating, getProductBySubCatId, getProductBySubCatName, getProductByThirdSubCatId, getProductByThirdSubCatName, getProductCount, getSingleProduct, getProductBySlug, updateProduct, uploadImages } from '../controllers/productController.js';

const productRouter = Router();

// Public GET routes
productRouter.get('/', getAllProducts);
productRouter.get('/getproductby-catid/:id', getProductByCatId);
productRouter.get('/getproductby-catname', getProductByCatName);
productRouter.get('/getproductby-subcatid/:id', getProductBySubCatId);
productRouter.get('/getproductby-subcatname', getProductBySubCatName);
productRouter.get('/getproductby-thirdsubcatid/:id', getProductByThirdSubCatId);
productRouter.get('/getproductby-thirdsubcatname', getProductByThirdSubCatName);
productRouter.get('/getproductby-price', getProductByPrice);
productRouter.get('/getproductby-rating', getProductByRating);
productRouter.get('/getproductcount', getProductCount);
productRouter.get('/getfeaturedproduct', getFeaturedProduct);
productRouter.get('/slug/:slug', getProductBySlug);
productRouter.get('/getproduct/:id', getSingleProduct);

// Admin-only mutating routes
productRouter.post('/upload-images', auth, adminOnly, upload.array('images'), uploadImages);
productRouter.post('/create', auth, adminOnly, createProduct);
productRouter.put('/updateproduct/:id', auth, adminOnly, updateProduct);
productRouter.delete('/deleteimage', auth, adminOnly, deleteImage);
productRouter.delete('/deleteproduct/:id', auth, adminOnly, deleteProduct);
productRouter.post('/delete-multiple', auth, adminOnly, deleteMultipleProducts);

export default productRouter;
