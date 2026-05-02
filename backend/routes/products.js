const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts,
} = require('../controllers/productController');
const { protect, requireApprovedSeller } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getProducts);
router.get('/seller/my', protect, requireApprovedSeller, getMyProducts);
router.get('/:id', getProduct);
router.post('/', protect, requireApprovedSeller, upload.array('images', 5), createProduct);
router.put('/:id', protect, requireApprovedSeller, updateProduct);
router.delete('/:id', protect, requireApprovedSeller, deleteProduct);

module.exports = router;
