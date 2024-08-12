const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "user1", password: "pass123" },
  { username: "user2", password: "password456" },
  { username: "user3", password: "secure789" }
];

// Middleware para sesiones
regd_users.use(session({
  secret: 'your_secret_key',  // Cambia esto por una clave secreta
  resave: false,
  saveUninitialized: true
}));

const isValid = (username, password) => { 
  return users.find(user => user.username === username && user.password === password);
}

const authenticatedUser = (username, password) => {
  let user = users.find(u => u.username === username);
  return user && user.password === password;
}

// Sólo los usuarios registrados pueden iniciar sesión
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide a valid username and password' });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const accessToken = jwt.sign({ username, userPassword: password }, "secretKey", { expiresIn: '1h' });

    // Store the access token and username in the session
    req.session.accessToken = accessToken;
    req.session.username = username;

    return res.status(200).json({ message: 'Login successful', accessToken });
  } else {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Ruta protegida de ejemplo
regd_users.get("/auth/review", (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(req.session.accessToken, "secretKey");
    const { username } = decodedToken;
    return res.status(200).json({ message: `Hello ${username}, you are authenticated to access this route.` });
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// Agregar o modificar una reseña
regd_users.put('/auth/review/:isbn', function(req, res) {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.username;

  let booksList = books;
  const book = booksList[isbn];

  if (!book) {
    return res.status(404).send('The book with ISBN ' + isbn + ' does not exist.');
  }

  book.reviews[username] = review;
  res.json(`Your review has been posted/updated for the book ${book.title} by ${book.author} with ISBN ${isbn}: ${JSON.stringify(book)}`);
});

// Eliminar una reseña
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.username;
  const isbn = req.params.isbn;
  
  let book = books[isbn];
  
  if (!book) {
    return res.status(404).send(`The book with ISBN ${isbn} does not exist.`);
  }
  
  if (!book.reviews[username]) {
    return res.status(404).send(`You have not posted any review for the book with ISBN ${isbn}: ${JSON.stringify(book)}`);
  }
  
  delete book.reviews[username];
  res.send(`Your review has been deleted for the book with ISBN ${isbn}: ${JSON.stringify(book)}`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
