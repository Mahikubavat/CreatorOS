const { Content } = require('../models');

exports.createContent = async (req, res) => {
  try {
    const content = await Content.create(req.body);
    res.status(201).json({ success: true, data: content });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getContent = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    let filter = { userId };
    if (startDate && endDate) {
      filter.publishDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const content = await Content.find(filter).sort({ publishDate: 1 });
    res.status(200).json({ success: true, count: content.length, data: content });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: content });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};