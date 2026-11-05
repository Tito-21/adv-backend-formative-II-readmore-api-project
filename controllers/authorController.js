const Author = require('../models/Author');
const Book = require('../models/Book');

// POST /authors
const createAuthor = async (req, res) => {
  const { name, country, bio } = req.body;
  const author = await Author.create({ name, country, bio });
  res.status(201).json(author);
};

// GET /authors
const getAuthors = async (req, res) => {
  const authors = await Author.find().sort({ name: 1 });
  res.json(authors);
};

// GET /authors/:id
const getAuthorById = async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (!author) {
    return res.status(404).json({ message: `No author found with id ${req.params.id}` });
  }
  res.json(author);
};

// PUT /authors/:id
const updateAuthor = async (req, res) => {
  const { name, country, bio } = req.body;
  const author = await Author.findByIdAndUpdate(
    req.params.id,
    { name, country, bio },
    { new: true, runValidators: true }
  );
  if (!author) {
    return res.status(404).json({ message: `No author found with id ${req.params.id}` });
  }
  res.json(author);
};

// DELETE /authors/:id
// Rule 4 — delete policy: BLOCK (option A).
// An author who still has books cannot be deleted; the client gets 409 and
// must first delete or reassign those books. We never silently destroy book
// records (they may already be sold / referenced by orders), and we never
// leave orphan books pointing at an author that no longer exists.
const deleteAuthor = async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (!author) {
    return res.status(404).json({ message: `No author found with id ${req.params.id}` });
  }

  const bookCount = await Book.countDocuments({ author: author._id });
  if (bookCount > 0) {
    return res.status(409).json({
      message: `Cannot delete "${author.name}": they still have ${bookCount} book(s). Delete or reassign those books first.`,
      bookCount,
    });
  }

  await author.deleteOne();
  res.json({ message: 'Author deleted', author });
};

// GET /authors/:id/books
const getAuthorBooks = async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (!author) {
    return res.status(404).json({ message: `No author found with id ${req.params.id}` });
  }
  const books = await Book.find({ author: author._id }).sort({ publishedYear: 1 });
  res.json({ author, count: books.length, books });
};

module.exports = {
  createAuthor,
  getAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  getAuthorBooks,
};
