// Parse user data from sessionStorage
let user = JSON.parse(sessionStorage.getItem('user'));

// Select the order container element
let orderContainer = document.querySelector('.order-container');

// Function to render a product card
const renderProductCard = (productData) => {
    // Create a container div for the entire product order
    let productContainer = document.createElement('div');
    productContainer.classList.add('product-container');

    // Render address information
    let addressDiv = document.createElement('div');
    addressDiv.classList.add('order-address');
    addressDiv.innerHTML = `
        <h2 class="address-heading">OrderId</h2>
        <p class="address-heading">${productData.OrderId}</p>
        <h2 class="address-heading">Address</h2>
        <p class="address">${productData.add.address || 'Address'}</p>
        <p class="street">${productData.add.street || 'Street'}</p>
        <p class="city">${productData.add.city || 'City'}</p>
        <p class="state">${productData.add.state || 'State'}</p>
        <p class="pincode">${productData.add.pincode || 'Pincode'}</p>
        <p class="land-mark">${productData.add.landmark || 'Landmark'}</p>
    `;

    // Render each product in the order
    productData.order.forEach(orderItem => {
        let productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${orderItem.image || 'img/no image.png'}" alt="" class="product-thumb-order">
                <button class="card-action-btn delete-popup-btn"><img src="img/delete.png" alt=""></button>
            </div>
            <div class="order-info">
                <h2 class="product-brand">${orderItem.brand || 'Brand'}</h2>
                <p class="product-short-des">${orderItem.shortDescription || 'Short Description'}</p>
                <p class="product-price">Price: ${orderItem.sellPrice || 0}</p>
                <p class="product-item">Item: ${orderItem.item || 0}</p>
                <p class="product-size">Size: ${orderItem.size || 'N/A'}</p>
            </div>
        `;
        
        productContainer.appendChild(productCard);
        productContainer.appendChild(addressDiv);

        // Add event listener for delete button
        let deleteBtn = productCard.querySelector('.delete-popup-btn');
        deleteBtn.addEventListener('click', () => {
            deleteItem(productData.OrderId); // Ensure `OrderId` is passed correctly here
        });
    });

    return productContainer;
};

// Check if user is logged in
if (user && user.email) {
    // Fetch data from the server
    const fetchData = async () => {
        try {
            const response = await fetch('/orderhistory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Update the DOM with the retrieved data
            if (data.order) {
                orderContainer.innerHTML = ''; // Clear existing content
                data.order.forEach(orderItem => {
                    const productCard = renderProductCard(orderItem);
                    orderContainer.appendChild(productCard); // Append the new product card to the container
                });
            } else {
                orderContainer.innerHTML = '<p>No orders found.</p>';
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
            // Handle error, such as redirecting to login page or displaying an error message
            alert('Failed to fetch user data. Please try again later.');
        }
    };

    fetchData();
} else {
    console.error('User email is missing or invalid');
    // Handle missing user, such as redirecting to login page
    // Example: window.location.href = '/login';
}

const deleteItem = (OrderId) => {
    fetch('/delete-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ OrderId: OrderId })
    })
    .then(res => res.json())
    .then(data => {
        if (data == 'success') {
            location.reload();
        } else {
            showAlert('Some error occurred while deleting the product. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error deleting product:', error);
        showAlert('Failed to delete product. Please try again later.');
    });
}
