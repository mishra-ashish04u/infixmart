import { Router } from 'express';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';
import { createCategory, deleteCategory, deleteImage, getAllCategories, getCategoryById, getCategoryCount, getSubCategoryCount, updateCategory, uploadImages, deleteMultipleCategories } from '../controllers/categoryController.js';
import upload from '../middleware/multer.js';

const categoryRouter = Router();

// Public GET routes
categoryRouter.get('/', getAllCategories);
categoryRouter.get('/get/count', getCategoryCount);
categoryRouter.get('/get/count/subcat', getSubCategoryCount);
categoryRouter.get('/:id', getCategoryById);

// Admin-only mutating routes
categoryRouter.post('/upload-images', auth, adminOnly, upload.array('images'), uploadImages);
categoryRouter.post('/createcat', auth, adminOnly, createCategory);
categoryRouter.delete('/deleteimage', auth, adminOnly, deleteImage);
categoryRouter.post('/bulk-delete', auth, adminOnly, deleteMultipleCategories);
categoryRouter.delete('/:id', auth, adminOnly, deleteCategory);
categoryRouter.put('/:id', auth, adminOnly, updateCategory);

export default categoryRouter;
