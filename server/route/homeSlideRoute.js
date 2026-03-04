import express from 'express';
import { addHomeSlide, getHomeSlides, deleteHomeSlide, uploadImages } from '../controllers/homeSlideController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-images', upload.array('images'), uploadImages);
router.post('/create', addHomeSlide);
router.get('/', getHomeSlides);
router.delete('/:id', deleteHomeSlide);

export default router;
