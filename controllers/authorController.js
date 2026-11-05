const Author = require('../models/Author');

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
const deleteAuthor = async (req, res) => {
  const author = await Author.findByIdAndDelete(req.params.id);
  if (!author) {
    return res.status(404).json({ message: `No author found with id ${req.params.id}` });
  }
  res.json({ message: 'Author deleted', author });
};

module.exports = {
  createAuthor,
  getAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
};
