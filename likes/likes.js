const favoritesGrid = document.getElementById('favorites-grid');

function renderFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = '<div class="empty-message"><h3>Список избранного пуст</h3></div>';
        return;
    }
    
    favoritesGrid.innerHTML = '';
    favorites.forEach(item => {
        let price = item.price;
        if (item.isBlackFriday && item.salePercentage > 0) {
            price = Math.floor(item.price * (100 - item.salePercentage) / 100);
        }
        
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <img src="${item.media[0]}" onclick="location.href='../Items/item.html?id=${item.id}'" style="cursor:pointer;">
            <div class="card-details">
                <div class="price">${price.toLocaleString()} сум</div>
                <h3 onclick="location.href='../Items/item.html?id=${item.id}'" style="cursor:pointer;">${item.title}</h3>
                <button class="remove-btn" onclick="removeFromFavorites(${item.id})">Удалить</button>
            </div>
        `;
        favoritesGrid.appendChild(card);
    });
}

function removeFromFavorites(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favorites = favorites.filter(item => item.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
    updateFavCount();
}

function updateFavCount() {
    let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let favSpan = document.getElementById('fav-count');
    if (favSpan) favSpan.textContent = favs.length;
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    let cartSpan = document.getElementById('cart-count');
    if (cartSpan) cartSpan.textContent = total;
}

renderFavorites();
updateFavCount();
updateCartCount();

setInterval(() => {
    updateFavCount();
    updateCartCount();
}, 500);