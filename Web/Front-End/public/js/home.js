const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => {
tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    });
 });

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Lấy sản phẩm
    const res = await fetch(`${apiBaseUrl}:3002/products`);
    const products = await res.json();

    const categories = ['coffee', 'tea', 'milktea', 'icecream'];

    categories.forEach(type => {
      const container = document.getElementById(`${type}-list`);
      const filtered = products.filter(p => p.type === type);

      filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p>Giá: $${product.price}</p>
          <button class="buy-btn" data-id="${product.id}">Mua</button>
        `;
        container.appendChild(card);
      });
    });

    // Sau khi render xong, gán sự kiện cho tất cả nút "Mua"
    setTimeout(() => {
      document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const productId = btn.dataset.id;
          const quantity = 1;

          try {
            // Lấy user
            const userRes = await fetch(`${apiBaseUrl}:3001/`, {
              credentials: 'include'
            });
            const userData = await userRes.json();
            const user_id = userData.user?.id;

            if (!user_id) {
              alert('Vui lòng đăng nhập trước khi mua hàng');
              return;
            }

            const addRes = await fetch(`${apiBaseUrl}:3003/orders/cart/add`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ user_id, productId, quantity })
            });

            const result = await addRes.json();

            if (addRes.ok) {
              alert('Đã thêm vào giỏ hàng!');
            } else {
              alert('Lỗi: ' + result.error);
            }
          } catch (err) {
            console.error('Lỗi khi thêm vào giỏ hàng:', err);
            alert('Không thể thêm sản phẩm vào giỏ hàng');
          }
        });
      });
    }, 100); // Đảm bảo tất cả card đã render xong

  } catch (err) {
    console.error('Lỗi khi tải sản phẩm:', err);
  }
});
