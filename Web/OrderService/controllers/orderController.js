const Order = require('../models/Order');
const axios = require('axios');
exports.getCart = async (req, res) => {
  try {
    const items = await Order.getCartByUser(req.params.userId); // [{ product_ids: [...] }]

    if (!items || items.length === 0) {
      return res.json([]);
    }

    const nestedItems = items[0]?.product_ids || [];
    const ids = nestedItems.map(item => item.productId);

    const response = await axios.post(`http://localhost:3002/products/batch`, { ids });

    products = response.data;


    const cart = products.map(product => {
      const item = nestedItems.find(i => i.productId == product.id);
      return {
        ...product,
        quantity: item ? item.quantity : 0
      };
    });

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Get cart failed' });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const updated = await Order.createOrUpdateCart(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update cart failed' });
  }
};


exports.addProductToCart = async (req, res) => {
      try {
    const { user_id, productId, quantity } = req.body;

    if (!user_id || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Lấy giỏ hàng hiện tại
    const cart = await Order.getCartByUser(user_id);
    let product_ids = cart?.product_ids || [];

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const index = product_ids.findIndex(item => Number(item.productId) === Number(productId));

    if (index !== -1) {
      // Nếu có thì cộng thêm quantity
      product_ids[index].quantity += quantity;
    } else {
      // Nếu chưa có thì thêm mới
      product_ids.push({ productId, quantity });
    }

    // Cập nhật lại giỏ hàng
    const updatedCart = await Order.createOrUpdateCart({
      user_id,
      product_ids
    });

    res.json(updatedCart);
  } catch (err) {
    console.error('Add to cart error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.decreaseQuantityInCart = async (req, res) => {
  try {
    const { user_id, productId } = req.body;

    if (!user_id || !productId) {
      return res.status(400).json({ error: 'Missing user_id or productId' });
    }

    const updatedCart = await Order.decreaseProductQuantity(user_id, productId);
    res.json(updatedCart);
  } catch (err) {
    console.error('Decrease quantity failed:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.checkout = async (req, res) => {
  try {
    const { user_id, address, phone } = req.body;
    await Order.checkoutCart(user_id, address, phone);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Checkout failed', details: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.getByUser(req.params.userId);
    res.json(orders);
  } catch (error) {
    console.error('Get orders failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId || !userId) {
      return res.status(400).json({ error: 'Missing orderId or userId in request body' });
    }

    const parsedOrderId = parseInt(orderId);
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedOrderId) || isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'orderId and userId must be valid numbers' });
    }

    const order = await Order.getById(parsedOrderId, parsedUserId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found or you do not have access' });
    }

    const productItems = order.product_ids || [];

    const ids = productItems.map(item => item.productId);


    // Gọi Product Service để lấy chi tiết sản phẩm
    const { data: products } = await axios.post('http://localhost:3002/products/batch', {
      ids
    });


    // Gộp thông tin product với quantity
    const detailedProducts = productItems.map(item => {
      const product = products.find(p => p.id === Number(item.productId));
      return {
        ...product,
        quantity: item.quantity
      };
    });

    // Trả về đơn hàng với chi tiết sản phẩm
    res.json({
      ...order,
      product_ids: detailedProducts
    });

  } catch (error) {
    console.error('Get order failed:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
exports.updateOrder = async (req, res) => {
  try {
    const updated = await Order.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update order failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete order failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
