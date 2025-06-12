// routes/index.js
const express = require('express');
const router = express.Router();
const productController = require('../app/controllers/productController');
const userController = require('../app/controllers/userController');
const orderController = require('../app/controllers/orderController');

router.get('/', productController.index);

router.get('/products', productController.getAllProducts);

router.get('/cart', orderController.index);

router.get('/login', userController.index);

router.get('/register', userController.register);

router.get('/profile', userController.profile);


module.exports = router;
