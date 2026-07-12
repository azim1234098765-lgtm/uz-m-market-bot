function updateCounts() {
    let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    let cartTotal = 0;
    for (let i = 0; i < cart.length; i++) {
        cartTotal += cart[i].quantity || 1;
    }
    
    let favSpan = document.getElementById('favCount');
    let cartSpan = document.getElementById('cartCount');
    
    if (favSpan) favSpan.textContent = favs.length;
    if (cartSpan) cartSpan.textContent = cartTotal;
}

function setupCategory() {
    let select = document.getElementById('categorySelect');
    if (!select) return;
    
    select.onchange = function() {
        let category = this.value;
        if (category === 'all') {
            window.location.href = 'glavniy.html';
        } else {
            window.location.href = 'glavniy.html?category=' + category;
        }
    };
}

function setupSearch() {
    let input = document.getElementById('searchInput');
    if (!input) return;
    
    input.onkeypress = function(e) {
        if (e.key === 'Enter') {
            let query = this.value.trim();
            if (query) {
                window.location.href = 'glavniy.html?search=' + encodeURIComponent(query);
            }
        }
    };
}

function checkLogin() {
    let user = localStorage.getItem('currentUser');
    let loginLink = document.querySelector('.header a[href="Login/index.html"]');
    
    if (user && loginLink) {
        let userName = JSON.parse(user).name || JSON.parse(user).email;
        loginLink.innerHTML = userName + ' (выйти)';
        loginLink.href = '#';
        loginLink.onclick = function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('favorites');
            location.reload();
        };
    }
}

updateCounts();
setupCategory();
setupSearch();
checkLogin();