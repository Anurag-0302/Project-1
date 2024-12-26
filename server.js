//importing packages
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const nodemailer = require('nodemailer');

//firebase admin setup
const serviceAccount = require("./ecommerce-b72e3-firebase-adminsdk-iskxg-a05f4fcc37.json");
const { hash } = require('crypto');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ecommerce-b72e3.firebaseio.com'
});


db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true })

//aws config
const aws = require('aws-sdk');
const dotenv = require('dotenv')

dotenv.config();

//aws parameters

const region = "ap-south-1";
const bucketName = "newecommercewebsite23";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY_ID;


aws.config.update({
    region,
    accessKeyId,
    secretAccessKey
});

//init s3
const s3 = new aws.S3();

//generate image upload link
async function generateUrl() {
    let date = new Date();
    let id = parseInt(Math.random() * 10000000000);

    const imageName = `${id}${date.getTime().jpg}`;

    const params = ({
        Bucket: bucketName,
        Key: imageName,
        Expires: 300,
        ContentType: 'image/jpeg'
    })

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    return uploadUrl;
}


//declare static path
let staticPath = path.join(__dirname, "public");

//intializing express.js
const app = express();

//middlewares
app.use(express.static(staticPath));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//routes
//home route
app.get("/", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
})

//signup route
app.get('/signup', (req, res) => {
    res.sendFile(path.join(staticPath, "signup.html"));
})

app.post('/signup', (req, res) => {
    let { name, email, password, number, tac, legitinfo } = req.body;

    //form validation
    if (name.length < 3) {
        return res.json({ 'alert': 'name must be 3 letters long' });
    } else if (!email.length) {
        return res.json({ 'alert': 'enter your email' });
    } else if (password.length < 8) {
        return res.json({ 'alert': 'password must be 8 letters long' });
    } else if (!number.length) {
        return res.json({ 'alert': 'enter your phone number' });
    } else if (!Number(number) || number.length < 10) {
        return res.json({ 'alert': 'invalid number, please enter valid phone number' });
    } else if (!tac) {
        return res.json({ 'alert': 'you must agree to terms and conditions' });
    }

    //store user in db
    db.collection('users').doc(email).get()
        .then(user => {
            if (user.exists) {
                return res.json({ 'alert': 'email already exists' })
            } else {
                //encrypt the password before storing it
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        req.body.password = hash;
                        db.collection('users').doc(email).set(req.body)
                            .then(data => {
                                res.json({
                                    name: req.body.name,
                                    email: req.body.email,
                                    seller: req.body.seller,
                                })
                            })
                    })
                })
            }
        })
})

//login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(staticPath, "login.html"));
})

app.post('/login', (req, res) => {
    let { email, password } = req.body;

    if (!email.length || !password.length) {
        return res.json({ 'alert': 'fill all the inputs' });
    }

    db.collection('users').doc(email).get()
        .then(user => {
            if (!user.exists) {
                return res.json({ 'alert': 'log in email does not exist' });
            }
            else {
                bcrypt.compare(password, user.data().password, (err, result) => {
                    if (result) {
                        let data = user.data();
                        return res.json({
                            name: data.name,
                            email: data.email,
                            seller: data.seller,
                        })
                    } else {
                        return res.json({ 'alert': 'password is incorrect' })
                    }
                })
            }
        })
})

//seller route
app.get('/seller', (req, res) => {
    res.sendFile(path.join(staticPath, "seller.html"));
})

app.post('/seller', (req, res) => {
    let { name, about, address, number, tac, legit, email } = req.body;
    if (!name.length || !address.length || !about.length || number.length < 10 || !Number(number)) {
        return res.json({ 'alert': 'some information(s) is/are invalid' });
    } else if (!tac || !legit) {
        return res.json({ 'alert': 'you must agree to our terms and conditions' });
    } else {
        //update users seller status here
        db.collection('sellers').doc(email).set(req.body)
            .then(data => {
                db.collection('users').doc(email).update({
                    seller: true
                }).then(data => {
                    res.json(true);
                })
            })
    }
})

//add-product route
app.get('/add-product', (req, res) => {
    res.sendFile(path.join(staticPath, 'add-product.html'))
})

app.get('/add-product/:id', (req, res) => {
    const productId = req.params.id;
    res.sendFile(path.join(staticPath, 'add-product.html'))
})


//get the upload link
app.get('/s3url', async (req, res) => {
    const url = await generateUrl();
    res.send({ url });
})

//add-product 
app.post('/add-product', async (req, res) => {
    let { name, shortDes, des, images, sizes, actualPrice, discount, sellPrice, stock, tags, tac, email, id, draft } = req.body;

    // Validation
    if (!draft) {
        if (!name) {
            return res.json({ alert: 'Enter product name' });
        } else if (shortDes.length > 100 || shortDes.length < 10) {
            return res.json({ alert: 'Short description must be between 10 to 100 letters long' });
        } else if (!des) {
            return res.json({ alert: 'Enter detailed description about the product' });
        } else if (!images.length) { // Assuming images is an array
            return res.json({ alert: 'Upload at least one image' });
        } else if (!sizes.length) { // Assuming sizes is an array
            return res.json({ alert: 'Select at least one size' });
        } else if (!actualPrice || !discount || !sellPrice) {
            return res.json({ alert: 'You must add pricing' });
        } else if (stock < 20) {
            return res.json({ alert: 'You should have at least 20 items in stock' });
        } else if (!tags.length) {
            return res.json({ alert: 'Enter a few tags to help in ranking your product in search' });
        } else if (!tac) {
            return res.json({ alert: 'You must agree to terms and conditions' });
        }
    }

    let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() * 5000)}` : id;

    try {
        // Add product data to Firestore

        const docRef = await db.collection('products').doc(docName).set(req.body);
        const docId = docName;

        //console.log(`Product added with ID: ${docId}`);

        // Update the product document with the ID
        await db.collection('products').doc(docId).update({
            id: docId // Assuming 'id' is the field you want to update with the document ID
        });

        res.json({ product: name });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ alert: 'Some error occurred. Try again later.' });
    }
});

//get products
app.get('/get-products', (req, res) => {
    const { email, id } = req.query;

    // Validate email and id parameters
    if (!email) {
        return res.status(400).send('Email parameter is required');
    }

    let docRef;

    if (id) {
        // If id is provided, fetch the single product by id
        docRef = db.collection('products').doc(id);
    } else {
        // Otherwise, fetch all products for a specific email
        docRef = db.collection('products').where('email', '==', email);
    }

    docRef.get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                if (id) {
                    return res.status(404).send('Product not found');
                } else {
                    return res.json([]); // Send an empty array if no products found
                }
            }

            if (id) {
                // If id is provided, return the single product data
                const productData = querySnapshot.data();
                if (!productData) {
                    return res.status(404).send('Product not found');
                }
                return res.json(productData);
            }

            // Extract products from QuerySnapshot if id is not provided
            const products = [];
            querySnapshot.forEach(doc => {
                let productData = doc.data();
                productData.id = doc.id; // Assign document ID as product ID
                products.push(productData);
            });
            res.json(products); // Send JSON response with products array
        })
        .catch(error => {
            console.error('Error getting products:', error);
            res.status(500).send('Error getting products'); // Send 500 status on error
        });
});
//modified code
app.post('/get-products', (req, res) => {
    const { email, id, tag } = req.body;

    if (id) {
        docRef = db.collection('products').doc(id);
    } else if (tag) {
        docRef = db.collection('products').where('tags', 'array-contains', tag)
    } else {
        docRef = db.collection('products').where('email', '==', email);
    }

    docRef.get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                if (id) {
                    return res.status(404).send('Product not found');
                } else {
                    return res.json([]); // Send an empty array if no products found
                }
            }
            let product = [];
            if (id) {
                // If id is provided, return the single product data
                const productData = querySnapshot.data();
                if (!productData) {
                    return res.status(404).send('Product not found');
                }
                return res.json(productData);
            } else {
                querySnapshot.forEach(item => {
                    let data = item.data();
                    data.id = item.id;
                    product.push(data);
                })
                res.json(product)
            }

        })
});

app.post('/delete-product', (req, res) => {
    let { id } = req.body;
    db.collection('products').doc(id).delete()
        .then(data => {
            res.json('success');
        }).catch(err => {
            res.json('err');
        })
})

app.get('/products/:id', (req, res) => {
    res.sendFile(path.join(staticPath, "product.html"));
})

app.get('/search/:key', (req, res) => {
    res.sendFile(path.join(staticPath, "search.html"));
})

app.get('/cart', (req, res) => {
    res.sendFile(path.join(staticPath, "cart.html"));
})

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(staticPath, "checkout.html"));
})

app.post('/order', async (req, res) => {
    const { order, email, add, OrderId } = req.body;

    // Validate required fields
    if (!order || !email || !add || !OrderId) {
        return res.status(400).json({ 'alert': 'Invalid request data' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const mailOptions = {
        from: 'anmore0302@gmail.com',
        to: 'anuragmore169@gmail.com',
        subject: 'Clothing: Order Placed',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Placed</title>
                <style>
                    /* Your email styles here */
                </style>
            </head>
            <body>
                <div>
                    <h1>Dear Customer,</h1>
                    <p>Your order has been successfully placed.</p>
                    <a href="#">Check order status</a>
                </div>
            </body>
            </html>`
    };

    const docName = email + Math.floor(Math.random() * 123719287419824);

    // Filter out undefined values from req.body
    const filteredBody = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => value !== undefined));

    try {
        
        await db.collection('order').doc(docName).set(filteredBody);

        await db.collection('order').doc(docName).update({
            OrderId: docName // Assuming 'OrderId' is the field you want to update with the document ID
        });

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ 'alert': 'Oops! It seems like some error occurred. Please try again' });
            } else {
                console.log('Email sent:', info.response);
                return res.json({ 'alert': 'your order is placed' });
            }
        });
    } catch (error) {
        console.error('Error saving order to Firestore:', error);
        return res.status(500).json({ 'alert': 'Failed to save order. Please try again.' });
    }
});

//user route
app.get('/user', (req,res) => {
    res.sendFile(path.join(staticPath, "user.html"))
})

app.post('/user', async (req, res) => {
    let { email , password } = req.body;
    try {
        const usersRef = db.collection('users').doc(email);
        const snapshot = await usersRef.get();

        if (!snapshot.exists) {
            console.log('No matching document.');
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = snapshot.data();

        res.status(200).json(userData);
    } catch (err) {
        console.error('Error getting user document', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user data endpoint
app.post('/user/update', async (req, res) => {
    const { email, name, number, street,address, city, state, pincode, landmark } = req.body;

    try {
        const usersRef = db.collection('users').doc(email);

        // Update only the fields that are provided
        const updateData = {
            name: name,
            number: number,
            address: address,
            city: city,
            state: state,
            pincode: pincode,
            street : street,
            landmark: landmark
        };

        await usersRef.update(updateData);

        res.status(200).json({ message: 'User data updated successfully' });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Failed to update user data' });
    }
});

//order route
app.get('/orderhistory', async (req,res) => {
    res.sendFile(path.join(staticPath, "order.html"));
})

app.post('/orderhistory', async (req, res) => {
    const { email } = req.body;

    try {
        const orderSnapshot = await db.collection('order').where('email', '==', email).get();
        if (orderSnapshot.empty) {
            return res.status(404).json({ order: [] });
        }

        const orders = [];
        orderSnapshot.forEach(doc => {
            orders.push(doc.data());
        });

        res.json({ order: orders });
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/delete-order', (req, res) => {
    let { OrderId } = req.body;
    db.collection('order').doc(OrderId).delete()
        .then(data => {
            res.json('success');
        }).catch(err => {
            res.json('err');
        })
})


//404 route
app.get('/404', (req, res) => {
    res.sendFile(path.join(staticPath, "404.html"));
})

app.use((req, res) => {
    res.redirect('/404');
})

app.listen(3000, () => {
    console.log('listning on port 3000.....');
})
