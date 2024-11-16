const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db')


// Somewhere below the users array and the products array

// We will call this the "seed block"
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS cjs_user (username TEXT, password TEXT)")
  db.run("CREATE TABLE IF NOT EXISTS cjs_product (name TEXT, price INTEGER, description TEXT)")
  db.run("CREATE TABLE IF NOT EXISTS cjs_session (token TEXT, user_id INTEGER)")
  db.run("CREATE TABLE IF NOT EXISTS cjs_cart_item (product_id, quantity, user_id)")
  // Insert seed data into cjs_user
  db.get('SELECT COUNT(*) AS count FROM cjs_user', [], (err, row) => {
      let count = row.count
      if (count == 0) {
          let stmt = db.prepare("INSERT INTO cjs_user (username, password) VALUES (?, ?)")
          users.forEach(v => {
              stmt.run(v.username, v.password)
          })
      }
  })
  // Insert seed data into cjs_product
  db.get('SELECT COUNT(*) AS count FROM cjs_product', [], (err, row) => {
      let count = row.count
      if (count == 0) {
          let stmt = db.prepare("INSERT INTO cjs_product (name, price, description) VALUES (?, ?, ?)")
          products.forEach(v => {
              stmt.run(v.name, v.price, v.description)
          })
      }
  })
})


let products = [
  {
      id: 1,
      name: 'Americano',
      price: 100,
      description: 'Espresso, diluted with hot water for a lighter experience',
  },
  {
      id: 2,
      name: 'Cappuccino',
      price: 110,
      description: 'Espresso with steamed milk',
  },
  {
      id: 3,
      name: 'Espresso',
      price: 90,
      description: 'A strong shot of coffee',
  },
  {
      id: 4,
      name: 'Macchiato',
      price: 120,
      description: 'Espresso with a small amount of milk',
  },
]

let users = [
  {
      id: 1,
      username: 'zagreus',
      password: 'cerberus',
  },
  {
      id: 2,
      username: 'melinoe',
      password: 'b4d3ec1',
  }
]

let sessions = {}

function getProducts() {
  return new Promise((resolve, reject) => {
      // Note: we need to explicitly select the `rowid` column here
      // `rowid` is a free column that SQLite adds to every table,
      //  but it is not included in queries automatically
      db.all('SELECT rowid, * FROM cjs_product', (err, rows) => {
          let result = rows.map(x => {
              return {id: x.rowid, name: x.name, price: x.price, description: x.description}
          })
          console.log(result)
          resolve(result)
      })
  })
}

function getProductById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT rowid, * FROM cjs_product WHERE rowid = ?', [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (!row) {
        resolve(null);
        return;
      }
      resolve({
        id: row.rowid,
        name: row.name,
        price: row.price,
        description: row.description
      });
    });
  });
}

function getUsers() {
  return users
}

function getUserById(id) {
  return users.filter(v => v.id == id)[0]
}

function getUserByUsername(username) {
  return users.filter(v => v.username == username)[0]
}

function getSessions() {
  return sessions
}

function getUserBySessionToken(sessionToken) {
  let userId = sessions[sessionToken]
  return getUserById(userId)
}

function setSession(sessionToken, userId) {
  sessions[sessionToken] = userId
}

// Remember to include the new functions in your exports, too.

module.exports = {
  getProducts,
  getProductById,
  getUsers,
  getUserById,
  getUserByUsername,
  getSessions,
  getUserBySessionToken,
  setSession,
}