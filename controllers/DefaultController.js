const Service = require('../services/DefaultService');

class DefaultController {
  /**
   * Get all to-do items
   */
  static async getTodos(req, res) {
    try {
      const todos = await Service.getTodos();
      res.json(todos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Add a new to-do item
   */
  static async addTodo(req, res) {
    try {
      const { id, title, completed } = req.body; // Extract fields from request body
      const newTodo = await Service.addTodo({ id, title, completed }); // Pass fields to service
      res.status(201).json(newTodo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  /**
   * Get a specific to-do item by ID
   */
  static async getTodoById(req, res) {
    try {
      const { id } = req.params;
      const todo = await Service.getTodoById(id);
      res.json(todo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Update a to-do item by ID
   */
  static async updateTodo(req, res) {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      const updatedTodo = await Service.updateTodo(id, completed);
      res.json(updatedTodo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Delete a to-do item by ID
   */
  static async deleteTodo(req, res) {
    try {
      const { id } = req.params;
      await Service.deleteTodo(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = DefaultController;