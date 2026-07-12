const productPage = document.getElementById('product-page');
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

let allGoods = [];

fetch('db.json')
    .then(res => res.json())
    .then(data => {
        allGoods = data.goods;
        const product = allGoods.find(item => String(item.id) === String(productId));
        if (product) {
            showProduct(product);
            showRecommendations(product.id);
        } else {
            productPage.innerHTML = '<h2 style="text-align:center; padding:50px;">Товар не найден</h2>';
        }
    })
    .catch(error => {
        console.error('Ошибка загрузки данных:', error);
        productPage.innerHTML = '<h2 style="text-align:center; padding:50px;">Ошибка загрузки товара</h2>';
    });

function showProduct(item) {
    let price = item.price;
    if (item.isBlackFriday && item.salePercentage > 0) {
        price = Math.floor(item.price * (100 - item.salePercentage) / 100);
    }
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let cartItem = cart.find(c => String(c.id) === String(item.id));
    let quantity = cartItem ? cartItem.quantity : 1;
    
    productPage.innerHTML = `
        <div class="container" style="max-width:1340px; margin:0 auto; padding:0 15px;">
            <div class="single-product">
                <div class="product-left">
                    <img src="${item.media[0]}" alt="${item.title}">
                </div>
                <div class="product-right">
                    <h1>${item.title}</h1>
                    <div class="rating">
                        <span class="rating-star">★</span>
                        <span class="rating-value">${item.rating}</span>
                    </div>
                    <div class="price-zone">
                        <span class="current-price">${price.toLocaleString()} сум</span>
                        ${item.isBlackFriday && item.salePercentage > 0 ? `<span class="discount-badge">-${item.salePercentage}%</span>` : ''}
                    </div>
                    
                    <div class="counter">
                        <button class="counter-btn" id="minusBtn">−</button>
                        <span class="count-display" id="qtySpan">${quantity}</span>
                        <button class="counter-btn" id="plusBtn">+</button>
                    </div>
                    
                    <div class="button-actions">
                        <button class="btn-cart" id="cartBtn">Добавить в корзину</button>
                        <button class="btn-favorite" id="favBtn"> В избранное</button>
                    </div>
                    
                    <div class="description">
                        <h3>Описание</h3>
                        <p>${item.description || 'Нет описания'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    let currentQty = quantity;
    
    document.getElementById('minusBtn').onclick = () => {
        if (currentQty > 1) {
            currentQty--;
            document.getElementById('qtySpan').textContent = currentQty;
        }
    };
    
    document.getElementById('plusBtn').onclick = () => {
        currentQty++;
        document.getElementById('qtySpan').textContent = currentQty;
    };
    
    document.getElementById('cartBtn').onclick = () => {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        let existing = cart.find(c => String(c.id) === String(item.id));
        if (existing) {
            existing.quantity = currentQty;
        } else {
            cart.push({...item, quantity: currentQty});
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        showNotification('Товар добавлен в корзину!');
        updateCartCount();
    };
    
    document.getElementById('favBtn').onclick = () => {
        let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        const existing = favs.find(f => String(f.id) === String(item.id));
        if (!existing) {
            favs.push(item);
            localStorage.setItem('favorites', JSON.stringify(favs));
            showNotification('Добавлено в избранное!');
            document.getElementById('favBtn').classList.add('active');
        } else {
            showNotification('Уже в избранном!');
        }
    };
    
    let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favs.find(f => String(f.id) === String(item.id))) {
        document.getElementById('favBtn').classList.add('active');
    }
}

function showRecommendations(currentId) {
    let others = allGoods.filter(g => String(g.id) !== String(currentId)).slice(0, 4);
    let html = `
        <div class="recommendations-section">
            <div class="container">
                <h2 class="recommendations-title">Рекомендации</h2>
                <div class="products-grid">
    `;
    
    others.forEach(item => {
        let price = item.isBlackFriday && item.salePercentage > 0 
            ? Math.floor(item.price * (100 - item.salePercentage) / 100)
            : item.price;
        html += `
            <div class="product-card" onclick="location.href='item.html?id=${item.id}'">
                <img src="${item.media[0]}" alt="${item.title}">
                <div class="price">${price.toLocaleString()} сум</div>
                <h3>${item.title}</h3>
                <div class="rating">
                    <span class="rating-star">★</span>
                    <span>${item.rating}</span>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    productPage.insertAdjacentHTML('afterend', html);
}

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1f2026;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    let cartSpan = document.getElementById('cart-count');
    if (cartSpan) cartSpan.textContent = total;
}

function updateFavCount() {
    let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let favSpan = document.getElementById('fav-count');
    if (favSpan) favSpan.textContent = favs.length;
}

// Обновляем счетчики при загрузке
updateCartCount();
updateFavCount();

// Обновляем счетчики каждые 500 мс
setInterval(() => {
    updateCartCount();
    updateFavCount();
}, 500);