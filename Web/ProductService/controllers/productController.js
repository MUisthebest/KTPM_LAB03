const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

exports.getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.body; // nhận mảng id từ body
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: 'Invalid ids array' });
    }

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const query = `SELECT id, name, image, price FROM products WHERE id IN (${placeholders})`;
    const result = await Product.query(query, ids);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
