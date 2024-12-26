/*
window.onload = () => {
    if (user) {
        fetchData();
    } else {
        console.error('User not found in session storage');
        // Handle the case where user is not found, perhaps redirect to login page
    }
};
*/
let user = JSON.parse(sessionStorage.user || null);

const userlogoutbtn = document.querySelector('#log-out-user');
const sellerbtn = document.querySelector('.user-btn')
const updateBtn = document.querySelector('#update-btn');
const username = document.querySelector('#name');
const useremail = document.querySelector('#email');
const usernumber = document.querySelector('#number');
const userpassword = document.querySelector('#password');
const useraddress = document.querySelector('#address');
const userstreet = document.querySelector('#street')
const usercity = document.querySelector('#city');
const userstate = document.querySelector('#state');
const userpincode = document.querySelector('#pincode');
const userlandmark = document.querySelector('#landmark');

// Function to gather user data from form fields
const getUserData = () => ({
    name: username.value,
    email: useremail.value,
    password: userpassword.value, // Note: Passwords should ideally be hashed before sending to the server
    number: usernumber.value,
    address: useraddress.value,
    street : userstreet.value,
    city: usercity.value,
    state: userstate.value,
    pincode: userpincode.value,
    landmark: userlandmark.value
});

// Function to send data to server
/*
const sendData = async (url, data) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Optionally handle success response if needed  
        location.replace('/')      
    } catch (error) {
        console.error('Error updating data:', error);
        // Handle error, such as displaying an error message to the user
        // Example: alert('Failed to update data. Please try again later.');
    }
};
*/
// Event listener for update button



// Event listener for logout button

userlogoutbtn.addEventListener('click', () => {
    sessionStorage.clear();
    location.replace('/'); // Redirect to login page on logout
});

sellerbtn.addEventListener('click', () => {
    location.replace('/seller')
})

// Function to set user data into form fields
const setUserData = (data) => {
    username.value = data.name;
    useremail.value = data.email;
    usernumber.value = data.number;
    userpassword.value = data.password; // Note: Consider not showing passwords in form fields
    useraddress.value = data.address || '';
    userstreet.value = data.street || '';
    usercity.value = data.city || '';
    userstate.value = data.state || '';
    userpincode.value = data.pincode || '';
    userlandmark.value = data.landmark || '';
};

// Function to fetch user data from server
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

const updateUser = async (data) => {
    try {
        const response = await fetch('/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to update user data');
        }

        console.log('User data updated successfully');
        location.replace('/'); // Redirect or provide feedback as needed
    } catch (error) {
        console.error('Error updating user data:', error);
        // Handle error, such as displaying an error message to the user
        // Example: alert('Failed to update user data. Please try again later.');
    }
};

// Example usage in your update button event listener
updateBtn.addEventListener('click', () => {
    if (!username.value.length) {
        showAlert('Please enter a username');
    }else if (!useremail.value.length) {
        showAlert('Please enter a email');
    }else if (!userpassword.value.length) {
        showAlert('Please enter a password');
    }
    else if (!usernumber.value.length) {
        showAlert('Please enter a valid number');
    }else if (!Number(usernumber.value) || usernumber.value.length < 10) {
        showAlert('Please enter a valid number');
    } else {
        const data = getUserData();
        updateUser(data); // Send updated user data to server
    }
});


// Load user data when window loads
if(user){
    fetchData();
}else{
    console.log('error fetching data')
}