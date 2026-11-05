const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Book genre is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Book price is required'],
    },
    publishedYear: {
      type: Number,
      required: [true, 'Published year is required'],
    },
    // The link to the Author collection: stores an Author's _id.
    // `ref` tells Mongoose which model to use when we call .populate('author').
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'Book author is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
