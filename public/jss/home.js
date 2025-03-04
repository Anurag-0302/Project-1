const setupSlidingEffect = () => {
    const productContainers = [...document.querySelectorAll('.product-container')];
    const nextbtn = [...document.querySelectorAll('.next-btn')];
    const prebtn = [...document.querySelectorAll('.pre-btn')];

    productContainers.forEach((item, i) => {
        let containerDimensions = item.getBoundingClientRect();
        let containerWidth = containerDimensions.width;

        nextbtn[i].addEventListener('click', () => {
            item.scrollLeft += containerWidth;
        })

        prebtn[i].addEventListener('click', () => {
            item.scrollLeft -= containerWidth;
        })
    })
}


//fetch product cards
const getProducts = (tag) => {
    return fetch('/get-products', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ tag : tag })
    })
        .then(res => res.json())
        .then(data => {
            return data;
        })
}

//create product slider
const createProductSlider = (data, parent, title) => {
    let slideContainer = document.querySelector(`${parent}`);

    slideContainer.innerHTML += `
     <section class="product">
        <h2 class="product-category">${title}</h2>
        <button class="pre-btn"><img src="../img/arrow.png" alt=""></button>
        <button class="next-btn"><img src="../img/arrow.png" alt=""></button>
        ${createProductCards(data)}
    <section>
    `

    setupSlidingEffect();
}

const createProductCards = (data, parent) => {
    //here parent is for search product
    let start = '<div class="product-container">';
    let middle = ''; // this will contain card html
    let end = '</div>'

    if(data.length === 0){
        middle = `
            <div class="image">
                <img src="../img/no-products.png" class="emp">
            </div>
        `
    }
    else{
    for (let i = 0; i < data.length; i++) {
            if(data[i].id != decodeURI(location.pathname.split('/').pop())){
                middle += `
                <div class="product-card">
                        <div class="product-image">
                            <span class="discount-tag">${data[i].discount}% off</span>
                            <img src="${data[i].images[0]}" alt="" class="product-thumb">
                        </div>
                        <div class="product-info" onclick="location.href = '/products/${data[i].id}'">
                            <h2 class="product-brand">${data[i].name}</h2>
                            <p class="product-short-des">${data[i].shortDes}</p>
                            <span class="price">${data[i].sellPrice}</span><span class="actual-price">${data[i].actualPrice}</span>
                        </div>
                    </div>
                `
        }
     }
    }
    if(parent){
        let cardContainer = document.querySelector(parent);
        cardContainer.innerHTML = start + middle + end;
    }else{
        return start + middle + end;
    }
}

const add_product_to_cart_or_wishlist = (type, product) => {
    let data = JSON.parse(localStorage.getItem(type));
    if(data == null){
        data = [];
    }

    product = {
        item  : 1,
        name : product.name,
        sellPrice : product.sellPrice,
        size : size || null,
        shortDes : product.shortDes,
        image : product.images[0]
    }

    data.push(product);
    localStorage.setItem(type, JSON.stringify(data))
    return 'added';
}