import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createCategory, deleteCategory, deleteImageFromCloudinary, getAllCategories, getCategoryById, getCategoryCount, getSubCategoryCount, updateCategory, uploadImages, deleteMultipleCategories } from '../controllers/categoryController.js';
import upload from '../middleware/multer.js';

const categoryRouter = Router();

categoryRouter.post('/upload-images', auth, upload.array('images'), uploadImages);
categoryRouter.post('/createcat', auth, createCategory);
categoryRouter.get('/', getAllCategories);
categoryRouter.get('/get/count', getCategoryCount);
categoryRouter.get('/get/count/subcat', getSubCategoryCount);
categoryRouter.get('/:id', getCategoryById);
categoryRouter.delete('/deleteimage', auth, deleteImageFromCloudinary);
categoryRouter.post('/bulk-delete', auth, deleteMultipleCategories);
categoryRouter.delete('/:id', auth, deleteCategory);
categoryRouter.put('/:id', auth, updateCategory);




export default categoryRouter;