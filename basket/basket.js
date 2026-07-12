const basketContent = document.getElementById('basket-content');

function renderBasket() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        basketContent.innerHTML = `
            <div class="empty-basket">
                <h3>Ваша корзина пуста</h3>
                <p>Добавьте товары из каталога, чтобы начать покупки</p>
            </div>
        `;
        return;
    }
    
    let totalSum = 0;
    let itemsHtml = '<div class="basket-layout"><div class="basket-items">';
    
    cart.forEach(item => {
        const qty = item.quantity || 1;
        let price = item.price;
        if (item.isBlackFriday && item.salePercentage > 0) {
            price = Math.floor(item.price * (100 - item.salePercentage) / 100);
        }
        const itemTotal = price * qty;
        totalSum += itemTotal;
        
        itemsHtml += `
            <div class="cart-item" data-id="${item.id}">
                <img class="item-image" src="${item.media && item.media[0] ? item.media[0] : ''}" alt="${item.title}">
                <div class="item-details">
                    <div>
                        <h3 class="item-title">${item.title}</h3>
                        <div class="item-info-meta">
                            Цена за 1 шт: ${price.toLocaleString()} сум<br>
                            Итого: ${itemTotal.toLocaleString()} сум
                        </div>
                    </div>
                    <div class="item-controls-row">
                        <div class="qty-picker">
                            <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
                            <span class="qty-num" data-id="${item.id}">${qty}</span>
                            <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
                        </div>
                    </div>
                </div>
                <button class="remove-btn" data-id="${item.id}">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                    Удалить
                </button>
            </div>
        `;
    });
    
    itemsHtml += `
            </div>
            <div class="basket-summary">
                <div class="summary-title">Итого к оплате: ${totalSum.toLocaleString()} сум</div>
                <button class="checkout-btn" id="checkoutBtn">Оформить заказ: ${totalSum.toLocaleString()} сум</button>
            </div>
        </div>
    `;
    basketContent.innerHTML = itemsHtml;
    
    attachBasketEvents();
}

function attachBasketEvents() {
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const delta = parseInt(btn.dataset.delta);
            updateQuantity(id, delta);
        };
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            removeItem(id);
        };
    });
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.onclick = () => checkout();
    }
}

function updateQuantity(id, delta) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(i => String(i.id) === String(id));
    if (index !== -1) {
        let currentQty = cart[index].quantity || 1;
        let newQty = currentQty + delta;
        
        if (newQty < 1) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = newQty;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderBasket();
        updateCartCount();
    }
}

function removeItem(id) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(i => String(i.id) !== String(id));
    localStorage.setItem('cart', JSON.stringify(cart));
    renderBasket();
    updateCartCount();
}

function checkout() {
    if (confirm('Вы уверены, что хотите оформить заказ?')) {
        alert('Заказ успешно оформлен! Спасибо за покупку!');
        localStorage.removeItem('cart');
        renderBasket();
        updateCartCount();
    }
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

// Инициализация
renderBasket();
updateCartCount();
updateFavCount();

// Обновляем счетчики каждые 500 мс
setInterval(() => {
    updateCartCount();
    updateFavCount();
}, 500);