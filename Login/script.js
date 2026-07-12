const tabs = document.querySelectorAll(".auth__tab");
const forms = document.querySelectorAll(".auth__form");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("auth__tab--active"));
    forms.forEach((f) => f.classList.remove("auth__form--active"));

    tab.classList.add("auth__tab--active");
    document
      .getElementById(tab.dataset.tab + "Form")
      .classList.add("auth__form--active");
  });
});

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,4}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const emailInput = loginForm.querySelector("#email");
    const passwordInput = loginForm.querySelector("#password");
    
    const userEmail = emailInput.value.trim();
    const userPassword = passwordInput.value;

    let isEmailValid = emailRegex.test(userEmail);
    let isPassValid = passwordRegex.test(userPassword);

    loginForm.querySelectorAll(".error-msg").forEach(el => el.remove());

    if (!isEmailValid) {
        showError(emailInput, 'Неправильный формат email');
    }
    if (!isPassValid) {
        showError(passwordInput, 'Неправильный пароль (минимум 8 символов, буква и цифра)');
    }

    if (isEmailValid && isPassValid) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const foundUser = users.find(u => u.email === userEmail && u.password === userPassword);

        if (foundUser) {
            localStorage.setItem("currentUser", JSON.stringify(foundUser));
            alert(`Добро пожаловать, ${foundUser.name || foundUser.email}!`);
            window.location.href = "../home.html";
        } else {
            alert("Пользователь не найден или пароль неверен");
        }
    }
});

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById("regName");
    const emailInput = document.getElementById("regEmail");
    const passwordInput = document.getElementById("regPassword");

    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value;

    registerForm.querySelectorAll(".error-msg").forEach(el => el.remove());

    let isValid = true;
    if(!emailRegex.test(emailValue)) {
        showError(emailInput, 'Неверный формат email');
        isValid = false;
    }
    if(!passwordRegex.test(passwordValue)) {
        showError(passwordInput, 'Пароль должен быть от 8 символов и содержать буквы и цифры');
        isValid = false;
    }

    if (isValid) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        
        if (users.some(u => u.email === emailValue)) {
            alert("Пользователь с таким email уже существует!");
            return;
        }

        const newUser = { name: nameValue, email: emailValue, password: passwordValue };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        alert("Регистрация успешна!");
        window.location.href = "../glavniy.html";
    }
});

function showError(inputElement, text) {
    inputElement.style.border = "1px solid red";
    const err = document.createElement("p");
    err.className = "error-msg";
    err.textContent = text;
    err.style.color = 'red';
    err.style.fontSize = '12px';
    err.style.marginTop = '4px';
    inputElement.after(err);
}