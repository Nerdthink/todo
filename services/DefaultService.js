const Todo = require('../models/Todo');

class DefaultService {
  /**
   * Get all to-do items
   */
  static async getTodos() {
    return await Todo.find();
  }

  /**
   * Add a new to-do item
   */
  static async addTodo({ id, title, completed = false }) {
    try {
      // Check if the ID already exists
      if (id) {
        const existingTodo = await Todo.findById(id);
        if (existingTodo) {
          throw new Error('A todo item with this ID already exists.');
        }
      }

      // Create a new todo item
      const newTodo = new Todo({ _id: id, title, completed });
      return await newTodo.save();
    } catch (err) {
      throw new Error(`Failed to add todo: ${err.message}`);
    }
  }

  /**
   * Get a specific to-do item by ID
   */
  static async getTodoById(id) {
    return await Todo.findById(id);
  }

  /**
   * Update a to-do item by ID
   */
  static async updateTodo(id, completed) {
    return await Todo.findByIdAndUpdate(id, { completed }, { new: true });
  }

  /**
   * Delete a to-do item by ID
   */
  static async deleteTodo(id) {
    return await Todo.findByIdAndDelete(id);
  }
}

module.exports = DefaultService;