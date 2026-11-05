const Book = require('../models/Book');

// POST /books
const createBook = async (req, res) => {
  const { title, genre, price, publishedYear, author } = req.body;
  const book = await Book.create({ title, genre, price, publishedYear, author });
  await book.populate('author');
  res.status(201).json(book);
};

// GET /books
const getBooks = async (req, res) => {
  const books = await Book.find().populate('author');
  res.json(books);
};

// GET /books/:id
const getBookById = async (req, res) => {
  const book = await Book.findById(req.params.id).populate('author');
  if (!book) {
    return res.status(404).json({ message: `No book found with id ${req.params.id}` });
  }
  res.json(book);
};

// PUT /books/:id
const updateBook = async (req, res) => {
  const { title, genre, price, publishedYear, author } = req.body;
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { title, genre, price, publishedYear, author },
    { new: true, runValidators: true }
  ).populate('author');
  if (!book) {
    return res.status(404).json({ message: `No book found with id ${req.params.id}` });
  }
  res.json(book);
};

// DELETE /books/:id
const deleteBook = async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    return res.status(404).json({ message: `No book found with id ${req.params.id}` });
  }
  res.json({ message: 'Book deleted', book });
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
};
