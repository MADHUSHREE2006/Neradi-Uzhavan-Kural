import Category from '../models/Category.js';

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).populate('parent', 'name slug');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, parent, image } = req.body;
    const category = await Category.create({ name, slug, parent: parent || null, image });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getCategories, createCategory, updateCategory, deleteCategory };
