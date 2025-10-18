const Compound = require("../models/compound");
const { validationResult } = require("express-validator");

exports.getPaginated = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  try {
    const { count, rows } = await Compound.findAndCountAll({ limit, offset, order: [["id", "ASC"]] });
    return res.json({ total: count, page, perPage: limit, data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    const c = await Compound.findByPk(id);
    if (!c) return res.status(404).json({ error: "Compound not found" });
    return res.json(c);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const c = await Compound.findByPk(id);
    if (!c) return res.status(404).json({ error: "Compound not found" });

    const { name, image, description } = req.body;
    c.name = name;
    c.image = image;
    c.description = description;

    await c.save();
    return res.json(c);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, image, description } = req.body;
    const c = await Compound.create({ name, image, description });
    return res.status(201).json(c);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.delete = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const c = await Compound.findByPk(id);
    if (!c) return res.status(404).json({ error: "Compound not found" });
    await c.destroy();
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
