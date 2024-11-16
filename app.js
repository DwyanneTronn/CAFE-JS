const express = require('express')
const ejs = require('ejs')
const cookieParser = require('cookie-parser')

const app = express()
const port = 3000

const database = require('./database.js')

const crypto = require('crypto')


app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())

//app.get('/', (req, res) => {
    //res.send('<h1>CafeJS</h1>')})

app.listen(port, () => console.log('App is listening'))


app.get('/product/:productId', (req, res) => {
  let product = database.getProductById(req.params.productId)
  let data = {product: product}
  ejs.renderFile('views/product_detail.ejs', data, (err, str) => {
      res.send(str)
  })
})

app.get('/product/:productId', async (req, res) => {
  try {
    const product = await getProductById(req.params.productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/login', (req, res) => {
  ejs.renderFile('views/login.ejs', (err, str) => {
      res.send(str)
  })
})



app.post('/login', (req, res) => {
  // Check if the user's details are valid and correct
  // We will ignore error cases for now
  let user = database.getUserByUsername(req.body.username)
  if (user.password != req.body.password) {
      res.send('Invalid details!')
  }
  // Generate a random session token
  let sessionToken = crypto.randomBytes(16).toString('base64')
  // Set the `cafejs_session` cookie to the session token
  res.cookie('cafejs_session', sessionToken)
  // Save the session to the database
  database.setSession(sessionToken, user.id)
  res.redirect('/')
})


app.get('/username', (req, res) => {
  res.send(req.cookies.cafejs_username)
})

app.post('/product/:productId', async (req, res) => {
  // Collect the form data
  let sessionToken = req.cookies['cafejs_session']
  let user = await database.getUserBySessionToken(sessionToken)
  let userId = user.id
  let quantity = req.body.quantity
  let productId = req.body.product_id
  // Sanity check: just echo it back
  res.send({
      userId: userId,
      quantity: quantity,
      productId: productId,
  })
})

app.get('/product/:productId', async (req, res) => {
  try {
    const product = await getProductById(req.params.productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});