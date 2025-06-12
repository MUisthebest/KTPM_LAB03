const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/cart', orderController.updateCart);
router.post('/checkout', orderController.checkout);
router.post('/cart/add', orderController.addProductToCart);
router.post('/cart/decrease', orderController.decreaseQuantityInCart);
// Tạo đơn hàng (giỏ hoặc đã đặt)
router.post('/', orderController.createOrder);

// Lấy đơn hàng theo user
router.get('/user/:userId', orderController.getOrdersByUser);

// Lấy chi tiết đơn hàng
router.post('/:id', orderController.getOrderById);

// Cập nhật đơn hàng (giỏ → đơn)
router.put('/:id', orderController.updateOrder);

// Xóa đơn hàng
router.delete('/:id', orderController.deleteOrder);

router.get('/cart/:userId', orderController.getCart);

module.exports = router;
