const mongoose = require('mongoose');
const Book = require('../models/Book');
const Author = require('../models/Author');

/**
 * Business rules that MongoDB/Mongoose will not enforce on their own.
 * Receives the book's final values (for an update: existing values merged
 * with the changes) and returns { status, message } for the first rule
 * broken, or null when everything is fine.
 */
const checkBookRules = async ({ author }) => {
  // Rule 1 — No orphan books.
  // `required` only checks that *some* value is present, and the ObjectId
  // type only checks its format. Neither checks that the author exists,
  // so we look it up ourselves.
  if (!author) {
    return { status: 400, message: 'An author id is required' };
  }
  if (!mongoose.isValidObjectId(author)) {
    return { status: 400, message: `"${author}" is not a valid author id` };
  }
  const authorExists = await Author.exists({ _id: author });
  if (!authorExists) {
    return { status: 400, message: `No author exists with id ${author}; book not saved` };
  }

  return null;
};

// POST /books
const createBook = async (req, res) => {
  const { title, genre, price, publishedYear, author } = req.body;

  const violation = await checkBookRules({ title, price, publishedYear, author });
  if (violation) {
    return res.status(violation.status).json({ message: violation.message });
  }

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
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: `No book found with id ${req.params.id}` });
  }

  // Only take the fields the client actually sent, then check the rules
  // against what the book WILL look like after the update.
  const allowed = ['title', 'genre', 'price', 'publishedYear', 'author'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const finalValues = { ...book.toObject(), ...updates };

  const violation = await checkBookRules({ ...finalValues, excludeId: book._id });
  if (violation) {
    return res.status(violation.status).json({ message: violation.message });
  }

  book.set(updates);
  await book.save();
  await book.populate('author');
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
