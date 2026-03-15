const express = require('express');
const router = express.Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingleImage, processSingleUpload } = require('../middleware/upload');

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', protect, authorize('admin'), uploadSingleImage, processSingleUpload, createCategory);
router.put('/:id', protect, authorize('admin'), uploadSingleImage, processSingleUpload, updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
