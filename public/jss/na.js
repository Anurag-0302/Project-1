const createNav = () => {
    let nav = document.querySelector('.navbar');

    nav.innerHTML = `
        <div class="nav">
        <a href="/">
            <img src="../img/dark-logo.png" class="brand-logo">
        </a>
            <div class="nav-items">
                <div class="search">
                    <input type="text" class="search-box" placeholder="search brand,product">
                    <button class="search-btn">search</button>
                </div>
                <a>
                    <img src="../img/user.png" id="user-img" alt="">
                    <div class="login-logout-popup hide">
                        <p class="account-info">Log in as, name</p>
                        <button class="btn" id="user-btn">Log out</button>
                        <button class="btn" id="user-profile">User Profile</button>
                    </div>
                </a>
                <a href="/cart"><img src="../img/cart.png" alt=""></a>
            </div>
        </div>
        <ul class="links-container">
            <li  class="link-item"><a href="/" class="link">home</a></li>
            <li  class="link-item"><a href="#" class="link">women</a></li>
            <li  class="link-item"><a href="#" class="link">men</a></li>
            <li  class="link-item"><a href="#" class="link">kids</a></li>
            <li  class="link-item"><a href="#" class="link">accessories</a></li>
        </ul>
    `;
}

createNav();

//nav popoup

const userImageButton = document.querySelector('#user-img');
const userPop = document.querySelector('.login-logout-popup');
const popouptext = document.querySelector('.account-info');
const actionBtn = document.querySelector('#user-btn');
const UseractionBtn = document.querySelector('#user-profile');

userImageButton.addEventListener('click', () => {
    userPop.classList.toggle('hide')
})

window.onload = () => {
    // Parse user and seller from sessionStorage
    let user = JSON.parse(sessionStorage.getItem('user')) || null;

    if (user !== null) {
        // User is logged in
        popouptext.textContent = `Logged in as: ${user.name}`;
        actionBtn.textContent = `Log out`;
        actionBtn.addEventListener('click', () => {
            sessionStorage.clear();
            location.reload();
            location.replace('/')
        });
        UseractionBtn.addEventListener('click', () => {
            location.replace('/user');
        });
    } else {
        // User is logged out
        popouptext.textContent = `Log in to place an order`;
        actionBtn.textContent = `Log in`;
        actionBtn.addEventListener('click', () => {
            location.href = '/login';
        });
        UseractionBtn.style.display = 'none'; // Hide selleractionBtn
    }
}


//search-box
const searchBtn = document.querySelector('.search-btn');
const searchBox = document.querySelector('.search-box');

searchBtn.addEventListener('click', () => {
    if(searchBox.value.length){
        location.href = `/search/${searchBox.value}`
    }
})