import { Router } from 'express';
import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import { createProduct, deleteImageFromCloudinary, deleteProduct, deleteMultipleProducts, getAllProducts, getFeaturedProduct, getProductByCatId, getProductByCatName, getProductByPrice, getProductByRating, getProductBySubCatId, getProductBySubCatName, getProductByThirdSubCatId, getProductByThirdSubCatName, getProductCount, getSingleProduct, updateProduct, uploadImages } from '../controllers/productController.js';

const productRouter = Router();

productRouter.post('/upload-images', auth, upload.array('images'), uploadImages);
productRouter.post('/create', auth, createProduct);
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
productRouter.delete('/deleteproduct/:id', deleteProduct);
productRouter.get('/getproduct/:id', getSingleProduct);
productRouter.delete('/deleteimage', auth, deleteImageFromCloudinary);
productRouter.put('/updateproduct/:id', auth, updateProduct);
productRouter.post('/delete-multiple', deleteMultipleProducts);

export default productRouter;