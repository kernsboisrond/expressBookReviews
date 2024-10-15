const express = require('express');
const axios = require('axios');
const books = require("./booksdb.js"); // Import the books database
const isValid = require("./auth_users.js").isValid;
const users = require("./auth_users.js").users;
const public_users = express.Router();

//For registering a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});


// Get the book list available in the shop (using async/await)
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:4000/books');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN (using async/await)
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`http://localhost:4000/books/${isbn}`);
        res.json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Book not found", error: error.message });
    }
});


/// Get book details based on author (using async/await)
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const response = await axios.get(`http://localhost:4000/books/author/${author}`);
        res.json(response.data);
    } catch (error) {
        res.status(404).json({ message: "No books found by this author", error: error.message });
    }
});


// Get book details based on title (using async/await)
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const response = await axios.get(`http://localhost:4000/books/title/${title}`);
        res.json(response.data);
    } catch (error) {
        res.status(404).json({ message: "No books found with this title", error: error.message });
    }
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.reviews) {
        res.send(JSON.stringify(book.reviews, null, 4));
    } else {
        res.status(404).send("No reviews found for this book");
    }
});

module.exports.general = public_users;
