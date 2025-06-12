const pool = require('../db/db');

class Product {
  static async getAll() {
    const result = await pool.query('SELECT * FROM products');
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create({ name, image, price, type }) {
    const result = await pool.query(
      'INSERT INTO products (name, image, price, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, image, price, type]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
  }
}

module.exports = Product;
