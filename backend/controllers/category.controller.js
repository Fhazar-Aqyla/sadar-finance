const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const categoryService = require('../services/category.service');

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await categoryService.findAll();
  return success(res, {
    data: categories,
    message: 'Categories retrieved successfully',
  });
});

module.exports = {
  getCategories,
};
