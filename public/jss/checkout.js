let user = JSON.parse(sessionStorage.user || null);
var OrderId = "yourActualDocIdValue";

window.onload = () => {
    if (!sessionStorage.user) {
        location.replace('/login')
    }else{
        fetchData();
    }
}
/*
const placeOrderBtn = document.querySelector('.place-order-btn');
placeOrderBtn.addEventListener('click', () => {
    let address = getAddress();

    if (address) {
        fetch('/order', {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                order: JSON.parse(localStorage.cart),
                email: JSON.parse(sessionStorage.user).email,
                add: address,
            })
        }).then(res => {
            make = res.json();
            console.log(make);
           // console.log('checkout response', res.json())
    })
        .then(data => {
            //console.log('checkout',data)
            if(data.alert == 'your order is placed'){
                delete localStorage.cart;
                showAlert(data.alert, 'success')
            }else{
                showAlert(data.alert);
            }
        })
    }
})
*/
    const placeOrderBtn = document.querySelector('.place-order-btn');
    placeOrderBtn.addEventListener('click', () => {
        let address = getAddress();
        if (address) {
            // Retrieve user email from sessionStorage if available
            let userEmail = '';
            if (sessionStorage.user) {
                try {
                    const userData = JSON.parse(sessionStorage.user);
                    if (userData && userData.email) {
                        userEmail = userData.email;
                    } else {
                        console.error('Invalid user data or missing email field in sessionStorage.user');
                    }
                } catch (error) {
                    console.error('Error parsing sessionStorage.user:', error);
                }
            } else {
                console.error('sessionStorage.user is not set or is undefined');
            }

            // Make the fetch request with the retrieved user email
            fetch('/order', {
                method: 'POST',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    order: JSON.parse(localStorage.cart),
                    email: userEmail,
                    add: address,
                    OrderId: OrderId
                })
            }).then(res => {
                return res.json(); // Parse JSON response
            }).then(data => {
                // Handle the response data
                if (data.alert && data.alert === 'your order is placed') {
                    delete localStorage.cart;
                    showAlert(data.alert, 'success')
                    setTimeout(() => {
                        location.replace('/');
                    }, 3000);
                } else {
                    showAlert(data.alert || 'An error occurred during order placement.');
                }
            }).catch(error => {
                console.error('Error during fetch request:', error);
                showAlert('Failed to place order. Please try again later.');
            });
        }
    });


const getAddress = () => {
    //validation
    let address = document.querySelector('#address').value;
    let street = document.querySelector('#street').value;
    let city = document.querySelector('#city').value;
    let state = document.querySelector('#state').value;
    let pincode = document.querySelector('#pincode').value;
    let landmark = document.querySelector('#landmark').value;

    if (!address.length || !street.length || !city.length || !state.length || !pincode.length || !landmark.length) {
        return showAlert('fill all the inputs first')
    } else {
        return { address, street, city, state, pincode, landmark};
    }
}

const fetchData = async () => {
    try {
        if (!user || !user.email) {
            throw new Error('User email is missing or invalid');
        }

        const response = await fetch('/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setUserData(data); // Update form fields with retrieved data
    } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error, such as redirecting to login page or displaying an error message
        // Example: alert('Failed to fetch user data. Please try again later.');
    }
};

const setUserData = (data) => {
    address.value = data.address || '';
    street.value = data.street || '';
    city.value = data.city || '';
    state.value = data.state || '';
    pincode.value = data.pincode || '';
    landmark.value = data.landmark || '';
};
