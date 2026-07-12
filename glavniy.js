const goodsContainer = document.getElementById('goods-container');
const btnLoadMore = document.getElementById('pokazat');
const categoryFilter = document.getElementById('tipi');
const searchInput = document.getElementById('search-input');

let allProducts = [];
let filteredProducts = [];
let displayedCount = 8;
const STEP_COUNT = 8;

const urlParams = new URLSearchParams(window.location.search);
const urlCategory = urlParams.get('category');
const urlSearch = urlParams.get('search');

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateGlobalCounters();

    if (categoryFilter && urlCategory && urlCategory !== 'all') {
        categoryFilter.value = urlCategory;
    }
    
    if (searchInput && urlSearch) {
        searchInput.value = decodeURIComponent(urlSearch);
    }

    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            allProducts = data.goods;
            applyFilters();
        })
        .catch(error => {
            console.error('Ошибка загрузки данных:', error);
            if (goodsContainer) {
                goodsContainer.innerHTML = '<div class="not-found-msg"><p>Не удалось загрузить товары.</p></div>';
            }
        });
});

function applyFilters() {
    let products = [...allProducts];
    
    if (urlCategory && urlCategory !== 'all') {
        products = products.filter(product => product.type === urlCategory);
    }
    
    if (urlSearch) {
        const searchLower = decodeURIComponent(urlSearch).toLowerCase();
        products = products.filter(product => 
            product.title.toLowerCase().includes(searchLower) ||
            (product.description && product.description.toLowerCase().includes(searchLower))
        );
    }
    
    filteredProducts = products;
    displayedCount = 8;
    renderProducts(filteredProducts.slice(0, displayedCount));
    updateLoadMoreButtonState();
    
    if (filteredProducts.length === 0) {
        goodsContainer.innerHTML = '<div class="not-found-msg"><p>Товары не найдены</p></div>';
    }
}

function renderProducts(productsList) {
    if (!goodsContainer) return;
    goodsContainer.innerHTML = '';

    if (!productsList || productsList.length === 0) {
        return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    productsList.forEach(item => {
        const hasDiscount = item.isBlackFriday && item.salePercentage > 0;
        const currentPrice = hasDiscount 
            ? Math.floor(item.price * (100 - item.salePercentage) / 100)
            : item.price;

        const isFavorite = favorites.some(f => String(f.id) === String(item.id));
        const isInCart = cart.some(c => String(c.id) === String(item.id));

        const card = document.createElement('div');
        card.className = 'product-card';
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.product-card__btn')) {
                window.location.href = `item.html?id=${item.id}`;
            }
        });

        card.innerHTML = `
            <div class="product-card__image-wrapper">
                <img class="product-card__image" src="${item.media[0]}" alt="${item.title}">
            </div>
            <div class="product-card__info">
                <h3 class="product-card__title">${item.title}</h3>
                <div class="product-card__price-row">
                    <span class="product-card__price">${currentPrice.toLocaleString()} сум</span>
                </div>
                <div class="product-card__footer">
                    <div class="product-card__rating">
                        <span class="product-card__star-icon">★</span>
                        <span>${item.rating || 0}</span>
                    </div>
                    <div class="product-card__actions">
                        <button class="product-card__btn product-card__btn--fav ${isFavorite ? 'product-card__btn--active' : ''}" data-id="${item.id}">
                            ${isFavorite ? '❤️' : '🖤'}
                        </button>
                        <button class="product-card__btn product-card__btn--cart" data-id="${item.id}" style="${isInCart ? 'background: #7000ff; color: white;' : ''}">
                            🛒
                        </button>
                    </div>
                </div>
            </div>
        `;
        goodsContainer.appendChild(card);
    });

    initCardButtons();
}

function initCardButtons() {
    document.querySelectorAll('.product-card__btn--fav').forEach(btn => {
        btn.onclick = function(e) {
            e.stopPropagation();
            const id = this.dataset.id; // Оставляем как строку
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const product = allProducts.find(p => String(p.id) === String(id));

            const index = favorites.findIndex(f => String(f.id) === String(id));
            if (index !== -1) {
                favorites.splice(index, 1);
                this.innerHTML = '🖤';
                this.classList.remove('product-card__btn--active');
            } else {
                if (product) {
                    favorites.push(product);
                    this.innerHTML = '❤️';
                    this.classList.add('product-card__btn--active');
                }
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateGlobalCounters();
        };
    });

    document.querySelectorAll('.product-card__btn--cart').forEach(btn => {
        btn.onclick = function(e) {
            e.stopPropagation();
            const id = this.dataset.id; // Оставляем как строку
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const product = allProducts.find(p => String(p.id) === String(id));

            const cartItem = cart.find(c => String(c.id) === String(id));
            if (cartItem) {
                cartItem.quantity = (cartItem.quantity || 1) + 1;
            } else {
                if (product) {
                    cart.push({ ...product, quantity: 1 });
                }
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            this.style.background = '#7000ff';
            this.style.color = 'white';
            updateGlobalCounters();
            showNotification('Товар добавлен в корзину!');
        };
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1f2026;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Добавляем стили для уведомления
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
        displayedCount += STEP_COUNT;
        renderProducts(filteredProducts.slice(0, displayedCount));
        updateLoadMoreButtonState();
    });
}

function updateLoadMoreButtonState() {
    if (!btnLoadMore) return;
    if (displayedCount >= filteredProducts.length) {
        btnLoadMore.textContent = 'Все товары загружены';
        btnLoadMore.disabled = true;
    } else {
        btnLoadMore.textContent = 'Показать еще';
        btnLoadMore.disabled = false;
    }
}

function updateGlobalCounters() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const favBadge = document.getElementById('fav-count');
    const cartBadge = document.getElementById('cart-count');

    if (favBadge) {
        favBadge.textContent = favorites.length;
    }
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartBadge.textContent = totalItems;
    }
}

function checkAuth() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const authBlock = document.querySelector(".user-auth-block");

    if (user && authBlock) {
        authBlock.innerHTML = `
            <img src="./img/Group 237729.svg" alt="" style="width:20px; height:20px;">
            <span style="font-weight:600; color:#1f2026; margin-right:10px;">${user.name || user.email}</span>
            <a href="#" id="logout-btn" style="color:red; text-decoration:none; font-size:13px;">Выйти</a>
        `;
        
        document.getElementById("logout-btn").addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("currentUser");
            window.location.reload();
        });
    }
}

if (categoryFilter) {
    categoryFilter.addEventListener('change', function(e) {
        const category = e.target.value;
        let url = 'glavniy.html';
        if (category !== 'all') {
            url += '?category=' + category;
        }
        window.location.href = url;
    });
}

if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = encodeURIComponent(this.value.trim());
            let url = 'glavniy.html';
            if (query) {
                url += '?search=' + query;
            }
            window.location.href = url;
        }
    });
}