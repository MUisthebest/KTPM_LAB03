const express = require('express');
const cors = require('cors');
const User = require('./models/User');
const app = express();
const port = process.env.PORT || 3001;
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');
const { use } = require('react');
app.use(cookieParser());

const hostURL = process.env.HOST_URL || 'http://localhost:8080';
const corsOptions = {
  origin: true, 
  credentials: true,          
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/',authMiddleware, async (req, res) => {
  res.status(200).json({user: req.user})
});

app.get('/check-auth', authMiddleware, async (req, res) => {
  res.status(200).json({ 
    isAuthenticated: true,
    user: req.user 
  });
});

// Đăng ký
app.post('/register', async (req, res) => {
  const { username, email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Mật khẩu xác nhận không khớp' });
  }

  try {
    const user = await User.create({ username, email, password });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Tên người dùng hoặc email đã tồn tại' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Lỗi hệ thống' });
    }
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findByUsername(username);

    if (!user || !(await User.isPasswordMatch(password, user.password))) {
      return res.status(401).json({ error: 'Thông tin đăng nhập không chính xác' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Gửi cookie
    res.cookie('auth_token', token, {
      httpOnly: true,        // Không cho JavaScript truy cập
      secure: false,         // Đổi thành true nếu dùng HTTPS
      sameSite: 'lax',       // Ngăn CSRF cơ bản
      maxAge: 3600000        // 1h
    });


    res.json({ message: 'Đăng nhập thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  res.json({ message: 'Đăng xuất thành công' });
});

app.listen(port, () => {
  console.log(`Auth service đang chạy tại http://localhost:${port}`);
});


