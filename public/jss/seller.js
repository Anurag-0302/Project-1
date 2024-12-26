
let loader = document.querySelector('.loader');
let user = JSON.parse(sessionStorage.user || null);

const becomeSellerElement = document.querySelector('.become-seller');
const productListingElement = document.querySelector('.product-listing');
const applyForm = document.querySelector('.apply-form');
const showApplyFormBtn = document.querySelector('#apply-btn');

window.onload = () => {
    if (user) {
        if (compareToken(user.authToken, user.email)) {
            if (!user.seller) {
                becomeSellerElement.classList.remove('hide');
            } else {
                loader.style.display = 'block';
                setupProducts();
            }
        } else {
            location.replace('/login');
        }
    } else {
        location.replace('/login');
        
    }
}

showApplyFormBtn.addEventListener('click', () => {
    becomeSellerElement.classList.add('hide');
    applyForm.classList.remove('hide');
})

//form-submission

const applyFormButton = document.querySelector('#apply-form-btn');
const businessName = document.querySelector('#business-name');
const address = document.querySelector('#business-add');
const about = document.querySelector('#about');
const number = document.querySelector('#number');
const tac = document.querySelector('#terms-and-conditions');
const legitinfo = document.querySelector('#legitinfo');

applyFormButton.addEventListener('click', () => {
    if (!businessName.value.length || !address.value.length || !about.value.length || !number.value.length) {
        showAlert('fill all the inputs');
    }
    else if (!tac.checked || !legitinfo.checked) {
        showAlert('you must agree to terms and conditions');
    } else {
        //making server request
        loader.style.display = 'block';
        sendData('/seller', {
            name: businessName.value,
            address: address.value,
            about: about.value,
            number: number.value,
            tac: tac.checked,
            legit: legitinfo.checked,
            email: JSON.parse(sessionStorage.user).email
        })
    }
})

const setupProducts = () => {
    const url = `/get-products?email=${encodeURIComponent(user.email)}`;
    
    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Server responded with status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            loader.style.display = null;
            productListingElement.classList.remove('hide');
            
            if (data.length === 0) {
                let emptySvg = document.querySelector('.no-product-image');
                emptySvg.classList.remove('hide');
            } else {
                //console.log('Products:', data);
                const fetchPromises = [];
                
                data.forEach(product => {
                    //console.log('Product ID:', product.id);
                    
                    // Only fetch product details if product.id is defined
                    if (product.id) {
                        const productDetailsUrl = `/get-products?email=${encodeURIComponent(user.email)}&id=${encodeURIComponent(product.id)}`;
                        
                        const fetchPromise = fetch(productDetailsUrl)
                            .then(res => {
                                if (!res.ok) {
                                    throw new Error(`Server responded with status: ${res.status}`);
                                }
                                return res.json();
                            })
                            .then(productDetails => {
                               // console.log('Product Details:', productDetails);
                                createProduct(productDetails);
                            })
                            .catch(error => {
                                console.error(`Error fetching product details for product ${product.id}:`, error);
                            });
                        
                        fetchPromises.push(fetchPromise);
                    }
                });
                // Wait for all fetches to complete
                return Promise.all(fetchPromises);
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            alert("An error occurred while fetching products. Please try again later.");
        });
}
