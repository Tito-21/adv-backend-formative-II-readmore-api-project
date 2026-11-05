const mongoose = require('mongoose');
const Book = require('../models/Book');
const Author = require('../models/Author');

/**
 * Business rules that MongoDB/Mongoose will not enforce on their own.
 * Receives the book's final values (for an update: existing values merged
 * with the changes) and returns { status, message } for the first rule
 * broken, or null when everything is fine.
 */
const MIN_YEAR = 1450; // the printing press — nothing older counts as a published book

const checkBookRules = async ({ title, price, publishedYear, author, excludeId }) => {
  // Rule 3 — values the schema can't sensibly express.
  // Checked first: there's no point looking up the author for a book
  // that could never be valid anyway.
  if (price !== undefined && !(Number(price) > 0)) {
    return { status: 422, message: 'Price must be a number greater than 0' };
  }
  if (publishedYear !== undefined) {
    const year = Number(publishedYear);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < MIN_YEAR || year > currentYear) {
      return {
        status: 422,
        message: `Published year must be a whole number between ${MIN_YEAR} and ${currentYear}`,
      };
    }
  }

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

  // Rule 2 — no duplicate titles for the SAME author (case-insensitive).
  // The filter includes the author, so two different authors may still
  // each have a book called "Home". The collation with strength 2 makes
  // MongoDB compare strings ignoring upper/lower case.
  // excludeId stops a book from clashing with itself when it is updated.
  if (title) {
    const filter = { author, title: String(title).trim() };
    if (excludeId) filter._id = { $ne: excludeId };

    const duplicate = await Book.findOne(filter).collation({ locale: 'en', strength: 2 });
    if (duplicate) {
      return {
        status: 409,
        message: `This author already has a book titled "${duplicate.title}"`,
      };
    }
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
