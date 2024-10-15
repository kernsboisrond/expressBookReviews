const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
// Task 7 functionality 
const jwtSecret = "your-secret-key"; // Replace with your actual secret key

let users = [];

// Function to check if the username already exists
const isValid = (username) => {
    let userMatches = users.filter(user => user.username === username);
    return userMatches.length > 0 ? false : true;
};

// Function to authenticate a user (to be implemented in future tasks)
const authenticatedUser = (username, password) => {
    // This function will be implemented later
    const user = users.find(u => u.username === username && u.password === password);
    return user ? true : false;
};

// Register a new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Validate request body
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username is already taken
    if (!isValid(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Add the new user to the users array
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});


// Login route for registered users
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Authenticate the user
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, jwtSecret, { expiresIn: "1h" });
    
    // Return the token
    return res.status(200).json({ message: "Login successful", token });
});


// Adding or modifying a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const username = req.userId; // This should be populated from the JWT

    // Check if the book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // If reviews object doesn't exist, create it
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or modify the review
    book.reviews[username] = review;
    
    return res.status(200).json({ message: "Review added/modified successfully", reviews: book.reviews });
});

// Deleting a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.userId; // This should be populated from the JWT

    // Check if the book exists
    const book = books[isbn];
    if (!book || !book.reviews) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }

    // Check if the user has a review for the book
    if (!book.reviews[username]) {
        return res.status(403).json({ message: "You do not have a review for this book" });
    }

    // Delete the user's review
    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
});


// Placeholder for adding a book review
//regd_users.put("/auth/review/:isbn", (req, res) => {
    // To be implemented later
    //return res.status(300).json({ message: "Yet to be implemented" });
//});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
