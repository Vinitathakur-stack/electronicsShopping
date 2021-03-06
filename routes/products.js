const express = require('express');
const router = express.Router();
const multer = require('multer');
//const upload = multer();
var VerifyToken = require('../utils/VerifyToken');
const upload_controller = require('../utils/uploadFiles');
// include product controller
const product_controller = require('../controllers/product');

//const Cart = require('../model/Cart');
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads');
//       },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     }
// });
// const upload = multer({ storage: storage });

// routes
router.post('/', product_controller.all_products);
//router.post('/create',product_controller.isLoggedIn,product_controller.uploadImg, product_controller.product_create);
router.post('/create' , upload_controller.upload.array('productPictures'), product_controller.product_create);
router.get('/:id', product_controller.product_details);
router.post('/update/:id', upload_controller.upload.array('productPictures'),  product_controller.product_update);
router.delete('/delete/:id', product_controller.product_delete);

router.post("/cart", product_controller.product_addTocart);
router.get("/view_cart/:id", product_controller.product_cart);

module.exports = router;