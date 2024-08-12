const express = require('express');
const books = require('./booksdb.js');
const { restart } = require('nodemon');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password } = req.body;

  if(!username || !password){
    return res.status(400).json({message: "Please provide valid credentials username and password"});
  }else{
    user = users.find(user => user.username === username);
    if(user){
        return res.status(409).json({username: " username already exists"});
    }

    users.push({username,password});

    return res.status(200).json({message: "User registered succesfully"});

  }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    const bookList = response.data;
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
      const { isbn } = req.params;
      const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
      const book = response.data;
  
      if (book) {
        const bookDetails = JSON.stringify(book, null, 2); // Formatear JSON
        res.status(200).send(`Book details for ISBN = ${isbn}: \n${bookDetails}`);
      } else {
        res.status(404).send(`No books found for ISBN ${isbn}`);
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching book details', error: error.message });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
      const { author } = req.params;
      const response = await axios.get(`${BASE_URL}/author/${author}`);
      const booksByAuthor = response.data;
  
      if (booksByAuthor.length > 0) {
        const bookList = JSON.stringify(booksByAuthor, null, 2); // Formatear JSON
        res.status(200).send(`Books for Author ${author}: \n${bookList}`);
      } else {
        res.status(404).send(`No books found for author ${author}`);
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching books by author', error: error.message });
    }
  });

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
      const { title } = req.params;
      const response = await axios.get(`${BASE_URL}/title/${title}`);
      const booksByTitle = response.data;
  
      if (booksByTitle.length > 0) {
        const bookList = JSON.stringify(booksByTitle, null, 2); // Formatear JSON
        res.status(200).send(`Books for title ${title}: \n${bookList}`);
      } else {
        res.status(404).send(`No books found for title ${title}`);
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching books by title', error: error.message });
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
        let isbn = req.params.isbn;
        const book = books[isbn];
        if(book){
            const reviews = JSON.stringify(book.reviews);
            res.send(`Review for ISBN = ${isbn}: ${reviews} `);
        }else{
            res.send(`No reviews yet for ISBN ${isbn}`);
        }
    
});

module.exports.general = public_users;
