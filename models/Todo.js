const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    _id: { type: String, required: false }, // Allow custom IDs
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  });
  

module.exports = mongoose.model('Todo', TodoSchema);