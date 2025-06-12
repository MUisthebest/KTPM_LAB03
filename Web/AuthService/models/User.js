const pool = require('../db/db'); // Đảm bảo bạn có file db.js chứa kết nối PostgreSQL
const bcrypt = require('bcrypt');

class User {
  static async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0]; // hoặc null nếu không tìm thấy
  }

  static async isPasswordMatch(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }
}

module.exports = User;
