const pool = require('../db/db');

class Order {
  static async create({ user_id, product_ids, address, phone, state }) {
    const total_price = await this.calculateTotal(product_ids);

    const result = await pool.query(
      `INSERT INTO orders (user_id, product_ids, address, phone, state, total_price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, JSON.stringify(product_ids), address, phone, state, total_price]
    );

    return result.rows[0];
  }

  static async getByUser(user_id) {
    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 and state = 'ordered' ORDER BY created_at DESC`,
      [user_id]
    );
    return result.rows || [];
  }

  static async getById(id, userId) {
    const query = `
      SELECT 
        o.id,
        o.user_id,
        o.address,
        o.phone,
        o.state,
        o.created_at,
        o.total_price,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'image', p.image,
            'price', p.price,
            'quantity', item.quantity
          )
        ) AS product_ids
      FROM orders o
      CROSS JOIN jsonb_to_recordset(o.product_ids::jsonb) AS item("productId" INT, quantity INT)
      JOIN products p ON item."productId" = p.id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id, o.user_id, o.address, o.phone, o.state, o.created_at, o.total_price
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  static async update(id, { product_ids, address, phone, state }) {
    const total_price = await this.calculateTotal(product_ids);
    const result = await pool.query(
      `UPDATE orders SET
         product_ids = $1,
         address = $2,
         phone = $3,
         state = $4,
         total_price = $5
       WHERE id = $6 RETURNING *`,
      [JSON.stringify(product_ids), address, phone, state, total_price, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
  }

  static async calculateTotal(product_ids) {
    if (!product_ids || product_ids.length === 0) return 0;

    const ids = product_ids.map(p => p.productId);
    const result = await pool.query(
      `SELECT id, price FROM products WHERE id = ANY($1)`,
      [ids]
    );

    let total = 0;
    for (let item of product_ids) {
      const product = result.rows.find(p => p.id === Number(item.productId));
      if (product) {
        total += product.price * item.quantity;
      }
    }

    return total;
  }

    static async getCartByUser(userId) {
    const query = `
        SELECT 
        p.id AS product_id,
        p.name,
        p.image, 
        p.price, 
        item.quantity
        FROM orders o,
        jsonb_to_recordset(o.product_ids::jsonb) AS item("productId" INT, quantity INT)
        JOIN products p ON item."productId" = p.id
        WHERE o.user_id = $1
        AND o.state = 'cart'
    `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return []; 
    }
    return result.rows;
    }

    static async getOrderedProducts(orderId, userId) {
    const query = `
        SELECT 
        p.id AS product_id,
        p.name,
        p.image, 
        p.price, 
        item.quantity
        FROM orders o,
        jsonb_to_recordset(o.product_ids::jsonb) AS item("productId" INT, quantity INT)
        JOIN products p ON item."productId" = p.id
        WHERE o.id = $1
        AND o.user_id = $2
        AND o.state = 'ordered'
    `;
    const result = await pool.query(query, [orderId, userId]);
    if (result.rows.length === 0) {
      return []; 
    }
    return result.rows;
}

static async getUserCartOrder(user_id) {
  const result = await pool.query(
    `SELECT * FROM orders WHERE user_id = $1 AND state = 'cart' LIMIT 1`,
    [user_id]
  );
  return result.rows[0]; // Trả về order chứa cart
}

static async createOrUpdateCart({ user_id, product_ids }) {
  const cartOrder = await this.getUserCartOrder(user_id);

  let mergedProductIds = [];

  if (cartOrder) {
    // Parse product_ids từ giỏ hàng cũ
    const existingProducts = cartOrder.product_ids || [];
    const productMap = new Map();

    // Gộp sản phẩm cũ vào map
    for (let item of existingProducts) {
      productMap.set(item.productId, item.quantity);
    }

    // Cập nhật hoặc thêm mới sản phẩm
    for (let item of product_ids) {
      if (productMap.has(item.productId)) {
        productMap.set(item.productId, productMap.get(item.productId) + item.quantity);
      } else {
        productMap.set(item.productId, item.quantity);
      }
    }

    // Chuyển map thành array
    mergedProductIds = Array.from(productMap.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    const total_price = await this.calculateTotal(mergedProductIds);

    // Cập nhật cart
    const result = await pool.query(
      `UPDATE orders SET product_ids = $1, total_price = $2 WHERE id = $3 RETURNING *`,
      [JSON.stringify(mergedProductIds), total_price, cartOrder.id]
    );
    return result.rows[0];
  } else {
    // Tạo mới cart nếu chưa có
    const total_price = await this.calculateTotal(product_ids);
    const result = await pool.query(
      `INSERT INTO orders (user_id, product_ids, state, total_price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, JSON.stringify(product_ids), 'cart', total_price]
    );
    return result.rows[0];
  }
}

static async decreaseProductQuantity(user_id, productId) {
  const cart = await this.getUserCartOrder(user_id);
  if (!cart) throw new Error('Cart not found');

  let product_ids = cart.product_ids || [];

  const index = product_ids.findIndex(p => Number(p.productId) === Number(productId));
  if (index === -1) throw new Error('Product not in cart');

  // Giảm quantity hoặc xóa nếu = 1
  if (product_ids[index].quantity > 1) {
    product_ids[index].quantity -= 1;
  } else {
    product_ids.splice(index, 1);
  }

  const total_price = await this.calculateTotal(product_ids);

  const result = await pool.query(
    `UPDATE orders SET product_ids = $1, total_price = $2 WHERE id = $3 RETURNING *`,
    [JSON.stringify(product_ids), total_price, cart.id]
  );

  return result.rows[0];
}


static async checkoutCart(user_id, address, phone) {
  const cart = await this.getUserCartOrder(user_id);
  if (!cart) throw new Error('Cart not found');
  const product_ids = cart.product_ids || [];
  if (!product_ids.length) {
    throw new Error('Cart is empty. Cannot proceed to checkout.');
  }

  // Đổi cart thành order
  await pool.query(
    `UPDATE orders SET address = $1, phone = $2, state = 'ordered', created_at = NOW()
     WHERE id = $3`,
    [address, phone, cart.id]
  );

  // Tạo cart mới cho user
  await pool.query(
    `INSERT INTO orders (user_id, product_ids, state, total_price)
     VALUES ($1, '[]', 'cart', 0)`,
    [user_id]
  );
}
}

module.exports = Order;
