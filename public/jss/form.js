//redirect to home page if user logged in
window.onload = () => {
    if (sessionStorage.user) {
        user = JSON.parse(sessionStorage.user);
        if (compareToken(user.authToken, user.email)) {
            location.replace('/user');
        }
    }
}

const loader = document.querySelector('.loader');

//sesect inputs
const submitBtn = document.querySelector('.submit-btn');
const name = document.querySelector('#name') || null;
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const number = document.querySelector('#number') || null;
const tac = document.querySelector('#terms-and-conditions') || null;
const notification = document.querySelector('#notification') || null;

submitBtn.addEventListener('click', () => {
    if (name != null) {
        //signup page
        if (name.value.length < 3) {
            showAlert('name must be 3 letters long');
        } else if (!email.value.length) {
            showAlert('enter your email')
        } else if (password.value.length < 8) {
            showAlert('password must be 8 letters long')
        } else if (!number.value.length) {
            showAlert('enter your phone number')
        } else if (!Number(number.value) || number.length < 10) {
            showAlert('invalid number, please enter valid phone number')
        } else if (!tac.checked) {
            showAlert('you must agree to terms and conditions')
        } else {
            //submit form       
            loader.style.display = 'block';
            sendData('/signup', {
                name: name.value,
                email: email.value,
                password: password.value,
                number: number.value,
                tac: tac.checked,
                notification: notification.checked,
                seller: false,
            })
        }
    } else {
        //login page
        if (!email.value.length || !password.value.length) {
            showAlert('fill all the inputs');
        } else {
            loader.style.display = 'block';
            sendData('/login', {
                email: email.value,
                password: password.value,
            })
        }
    }
})
