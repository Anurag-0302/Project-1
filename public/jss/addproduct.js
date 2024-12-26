let user = JSON.parse(sessionStorage.user || null);
let loader = document.querySelector('.loader');

//checking user is logged in or not
window.onload = () => {
    if (user) {
        if (!compareToken(user.authToken, user.email)) {
            location.replace('/login');
        }
    } else {
        location.replace('/login');
    }
}

//price-inputs

const actualPrice = document.querySelector('#actual-price');
const discountPercentage = document.querySelector('#discount');
const sellingPrice = document.querySelector('#sell-price');

discountPercentage.addEventListener('input', () => {
    if (discountPercentage.value > 100) {
        discountPercentage.value = 90;
    } else {
        let discount = actualPrice.value * discountPercentage.value / 100;
        sellingPrice.value = actualPrice.value - discount;
    }
})

sellingPrice.addEventListener('input', () => {
    let discount = (sellingPrice.value / actualPrice.value) * 100;
    discountPercentage.value = discount;
})

//upload image handle
let uploadImages = document.querySelectorAll('.fileupload');
let imagePaths = [];

uploadImages.forEach((fileupload, index) => {
    fileupload.addEventListener('change', () => {
        const file = fileupload.files[0];
        let imageUrl;

        if (file.type.includes('image')) {
            fetch('/s3url')
                .then(res => {
                    // Ensure you're getting a valid JSON response
                    if (!res.ok) {
                        throw new Error('Failed to fetch S3 URL');
                    }
                    return res.json();
                })
                .then(data => {
                    // Assuming the server response is an object with a 'url' property
                    const uploadUrl = data.url;
                    fetch(uploadUrl, {
                        method: 'PUT',
                        body: file
                    })
                        .then(res => {
                            if (!res.ok) {
                                throw new Error('Failed to upload image');
                            }
                            imageUrl = uploadUrl.split("?")[0];
                            imagePaths[index] = imageUrl;
                            let label = document.querySelector(`label[for=${fileupload.id}]`);
                            label.style.backgroundImage = `url(${imageUrl})`;
                            let productImage = document.querySelector('.product-image');
                            productImage.style.backgroundImage = `url(${imageUrl})`;
                        })
                        .catch(error => {
                            console.error("Error uploading image:", error);
                            // Handle the upload error appropriately (e.g., display an error message to the user)
                        });
                })
                .catch(error => {
                    console.error("Error fetching S3 URL:", error);
                    // Handle the error fetching the S3 URL (e.g., display an error message)
                });
        } else {
            showAlert('upload image only');
        }
    });
});

//form submission

const productName = document.querySelector('#product-name');
const shortLine = document.querySelector('#short-des');
const des = document.querySelector('#des');

let sizes = [];

const stock = document.querySelector('#stock');
const tags = document.querySelector('#tags');
const tac = document.querySelector('#tac');

//buttons

const addProductBtn = document.querySelector('#add-btn');
const saveDraft = document.querySelector('#save-btn');

//store size function
const storeSizes = () => {
    sizes = [];
    let sizeCheckBox = document.querySelectorAll('.size-checkbox');
    sizeCheckBox.forEach(item => {
        if (item.checked) {
            sizes.push(item.value);
        }
    })
}

const validateForm = () => {
    if (!productName.value.length) {
        return showAlert('enter product name');
    } else if (shortLine.value.length > 100 || shortLine.value.length < 10) {
        return showAlert('short description must be between 10 to 100 letters long');
    } else if (!des.value.length) {
        return showAlert('enter detail description about the product');
    } else if (!imagePaths.length) {//image link array 
        return showAlert('upload atleast one image');
    } else if (!sizes.length) {
        return showAlert('select atleast one size');
    } else if (!actualPrice.value.length || !discount.value.length || !sellingPrice.value.length) {
        return showAlert('you must add pricing');
    } else if (stock.value < 20) {
        return showAlert('you should have atleast 20 items in stocks');
    } else if (!tags.value.length) {
        return showAlert('enter few tags to help  ranking your product in search')
    } else if (!tac.checked) {
        return showAlert('you must agree to terms and conditons');
    }
    return true;
}

//Initialising id
let id = 'id';

const productData = () => {
    let tagArr = tags.value.split(','); 
    tagArr.forEach((item, i) => tagArr[i] = tagArr[i].trim());
    return data = {
        name: productName.value,
        shortDes: shortLine.value,
        des: des.value,
        images: imagePaths,
        sizes: sizes,
        actualPrice: actualPrice.value,
        discount: discountPercentage.value,
        sellPrice: sellingPrice.value,
        stock: stock.value,
        tags: tagArr,
        tac: tac.checked,
        email: user.email,
        id: id.value
    }
}

addProductBtn.addEventListener('click', () => {
    storeSizes();
    if (validateForm()) { //Validate form return true or false while doing validation 
        loader.style.display = 'block';
        let data = productData();
        if(productId){
            data.id = productId;
        }
        sendData('/add-product', data);
    }
})

//save draft btn
saveDraft.addEventListener('click', () => {
    //Store Sizes
    storeSizes();
    //check for product name
    if (!productName.value.length) {
        showAlert('enter product name');
    } else { //don't validate the data
        let data = productData();
        data.draft = true;
        if(productId){
            data.id = productId;
        }
        sendData('/add-product', data);
    }
})

//exisiting product detail handle

const setFormsData = (data) => {
    productName.value = data.name;
    shortLine.value = data.shortDes;
    des.value = data.des;
    actualPrice.value = data.actualPrice;
    discountPercentage.value = data.discount;
    sellingPrice.value = data.sellPrice;
    stock.value = data.stock;
    tags.value = data.tags;

    //set up images
    imagePaths = data.images || [];
    imagePaths.forEach((url, i) => {
        let label = document.querySelector(`label[for=${uploadImages[i].id}]`);
        label.style.backgroundImage = `url(${url})`;
        let productImage = document.querySelector('.product-image');
        productImage.style.backgroundImage = `url(${url})`;
    });

    //setup sizes
    sizes=data.sizes

    let sizeCheckBox = document.querySelectorAll('.size-checkbox');
    sizeCheckBox.forEach(item => {
        if(sizes.includes(item.value)){
            item.setAttribute('checked', '');
        }
    })
}

const fetchProductData = async () => {
    try {
        const response = await fetch('/get-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, id: productId })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setFormsData(data); // Update form fields with retrieved data
    } catch (error) {
        console.error('Error fetching product data:', error);
        // Handle error, such as redirecting or displaying an error message
         // Redirect to seller page on error
         location.replace('/seller')
    }
};



let productId = null;
if (location.pathname != '/add-product') {
    productId = decodeURI(location.pathname.split('/').pop());

    let productDetail = JSON.parse(sessionStorage.tempProduct || null);
    fetchProductData();
}
