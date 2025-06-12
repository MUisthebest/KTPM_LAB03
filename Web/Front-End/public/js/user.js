if (typeof cachedUser === 'undefined') {
  var cachedUser = null;
}
if (typeof loginMenuItem === 'undefined') {
  var loginMenuItem = document.getElementById('login-menu-item');
}

// Hàm fetch user
async function fetchCurrentUser() {
  if (cachedUser) {
    // Nếu đã có dữ liệu user, trả về ngay
    return cachedUser;
  }

  try {
    const response = await fetch(`${apiBaseUrl}:3001/`, {
      method: 'GET',
      credentials: 'include' // gửi cookie
    });
    if (!response.ok) throw new Error('Không lấy được thông tin người dùng');
    const data = await response.json();
    cachedUser = data.user; // Lưu user vào biến toàn cục
    return cachedUser;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return null;
  }
}

  document.addEventListener('DOMContentLoaded', async () => {
    const user = await fetchCurrentUser();
    check = localStorage.getItem("domUpdated");
    if (user) {
      if (loginMenuItem) {
        loginMenuItem.innerHTML = `
          <a href="/profile"><i class='bx bx-user-hexagon'></i><p>Hồ sơ</p></a>
        `;
      }
      const usernameElement = document.getElementById('username');
      const emailElement = document.getElementById('email');
      if (usernameElement) {
        usernameElement.textContent = user.username || 'Người dùng';
      }
      if (emailElement) {
        emailElement.textContent = user.email || 'Chưa có email';
      }
      const checkCartResponse = await fetch(`${apiBaseUrl}:3003/orders/cart/${user.id}`, {
        method: 'GET',
        credentials: 'include'
      });

      const cartData = await checkCartResponse.json();
      
      if (checkCartResponse.status === 404 && cartData.shouldCreate) {
        await fetch(`${apiBaseUrl}:3003/orders/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_id: user.id,
            product_ids: [],
            address: '',
            phone: '',
            state: 'cart',
            total_price: 0
          })
        });
      }
    }

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        const response = await fetch(`${apiBaseUrl}:3001/logout`, {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          window.location.href = '/'; 
        } else {
          alert("Đăng xuất thất bại. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("Lỗi khi đăng xuất:", err);
        alert("Đã xảy ra lỗi khi đăng xuất.");
      }
    });
  }

  });
