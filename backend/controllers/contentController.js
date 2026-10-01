const { Content } = require('../models');

const createContent = async (req, res) => {
  try {
    const content = await Content.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: content });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const getContent = async (req, res) => {
  try {
    const { startDate, endDate, stage, platform } = req.query;
    let query = { userId: req.user.id };

    if (stage) query.stage = stage;
    if (platform) query.platform = platform;
    if (startDate && endDate) {
      query.publishDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const items = await Content.find(query).sort({ publishDate: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateContent = async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!content) return res.status(404).json({ success: false, error: 'Content not found' });
    res.status(200).json({ success: true, data: content });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const deleteContent = async (req, res) => {
  try {
    const content = await Content.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!content) return res.status(404).json({ success: false, error: 'Content not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { createContent, getContent, updateContent, deleteContent };