const categoryRepository = require('../repositories/category.repository');

class CategoryService {
  async findAll() {
    return categoryRepository.findAll();
  }
}

module.exports = new CategoryService();
