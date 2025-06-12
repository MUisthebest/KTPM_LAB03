document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Lấy thông tin user từ endpoint của bạn
    const userRes = await fetch(`${apiBaseUrl}:3001/`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!userRes.ok) throw new Error('Không thể lấy thông tin người dùng');
    const userData = await userRes.json();
    const user = userData.user;

    if (!user || !user.id) {
      alert('Vui lòng đăng nhập trước khi xem đơn hàng');
      window.location.href = '/login';
      return;
    }


    // Fetch danh sách đơn hàng từ API
    const ordersRes = await fetch(`${apiBaseUrl}:3003/orders/user/${user.id}`, {
      method: 'GET',
      credentials: 'include' // Sử dụng credentials nếu bạn dùng session/cookie
    });

    if (!ordersRes.ok) {
      throw new Error('Lỗi khi lấy danh sách đơn hàng');
    }
    const orders = await ordersRes.json();    
    const orderList = document.getElementById('order-list');

    if (orders.length === 0) {
      orderList.innerHTML = '<li>Bạn chưa có đơn hàng nào</li>';
      return;
    }

      const li = document.createElement('li');
      li.className = 'order-item';
      li.dataset.orderId = 'root';
      
      li.innerHTML = `
        <span>#STT</span>
        <span>Ngày đặt</span>
        <span>Tổng tiền</span>
        <span class="status">Trạng thái</span>
      `;

    orderList.appendChild(li);

    // Hiển thị danh sách đơn hàng
    orders.forEach(order => {
      const li = document.createElement('li');
      li.className = 'order-item';
      li.dataset.orderId = order.id;
      
      const date = new Date(order.created_at).toLocaleDateString('vi-VN');
      li.innerHTML = `
        <span>Đơn hàng #${order.id}</span>
        <span>${date}</span>
        <span>$${order.total_price ? order.total_price.toLocaleString('vi-VN') : 0}</span>
        <span class="status ${order.state}">${order.state}</span>
      `;
      
      li.addEventListener('click', () => loadOrderDetail(order.id));
      orderList.appendChild(li);
    });

  } catch (error) {
    console.error('Lỗi:', error);
    document.getElementById('order-list').innerHTML = 
      '<li class="error">Có lỗi xảy ra khi tải đơn hàng: ' + error.message + '</li>';
  }
});

async function loadOrderDetail(orderId) {
  try {
    const userRes = await fetch(`${apiBaseUrl}:3001/`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!userRes.ok) throw new Error('Không thể lấy thông tin người dùng');
    const userData = await userRes.json();
    const user = userData.user;

    if (!user || !user.id) {
      throw new Error('User not authenticated');
    } // Get userId from the authenticated user

    const orderDetailRes = await fetch(`${apiBaseUrl}:3003/orders/${orderId}`, {
      method: 'POST', // Changed to POST to send body
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, userId: user.id })
    });

    if (!orderDetailRes.ok) {
      throw new Error('Lỗi khi lấy chi tiết đơn hàng');
    }

    const order = await orderDetailRes.json();
    const orderDetail = document.getElementById('order-detail');

    // Format date
    const date = new Date(order.created_at).toLocaleDateString('vi-VN');

    // Generate product list HTML
    const productListHtml = order.product_ids && order.product_ids.length > 0
      ? order.product_ids.map(product => `
          <li class="product-item">
            <img src="${product.image || 'default-image.jpg'}" alt="${product.name || 'Unknown Product'}">
            <span>${product.name || 'Unknown Product'}</span>
            <span>Giá: ${product.price ? parseFloat(product.price).toLocaleString('vi-VN') : 0} VNĐ</span>
            <span>Số lượng: ${product.quantity || 1}</span>
            <span>Tổng: ${(product.price && product.quantity) ? (parseFloat(product.price) * product.quantity).toLocaleString('vi-VN') : 0} VNĐ</span>
          </li>
        `).join('')
      : '<li>Không có sản phẩm trong đơn hàng</li>';

    // Update order detail section
    orderDetail.innerHTML = `
      <h2>Chi tiết đơn hàng #${order.id}</h2>
      <p><strong>Ngày đặt:</strong> ${date}</p>
      <p><strong>Địa chỉ:</strong> ${order.address || 'Không có'}</p>
      <p><strong>Số điện thoại:</strong> ${order.phone || 'Không có'}</p>
      <p><strong>Trạng thái:</strong> ${order.state}</p>
      <p><strong>Tổng tiền:</strong> ${order.total_price ? parseFloat(order.total_price).toLocaleString('vi-VN') : 0} VNĐ</p>
      <h3>Danh sách sản phẩm</h3>
      <ul class="product-list">${productListHtml}</ul>
    `;
  } catch (error) {
    console.error('Lỗi khi tải chi tiết đơn hàng:', error);
    document.getElementById('order-detail').innerHTML =
      `<h2>Chi tiết đơn hàng</h2><p class="error">Có lỗi xảy ra: ${error.message}</p>`;
  }
}
