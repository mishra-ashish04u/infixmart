import AttributeType from "../models/AttributeType.js";
import AttributeValue from "../models/AttributeValue.js";

export const getAttributeTypes = async (req, res) => {
  try {
    const types = await AttributeType.findAll({
      include: [{ model: AttributeValue, as: "values", attributes: ["id", "value"] }],
      order: [["name", "ASC"]],
    });
    return res.status(200).json({ success: true, data: types });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAttributeType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    const type = await AttributeType.create({ name: name.trim() });
    return res.status(201).json({ success: true, data: { ...type.toJSON(), values: [] } });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "Attribute type already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAttributeType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    const type = await AttributeType.findByPk(id);
    if (!type) return res.status(404).json({ success: false, message: "Not found" });
    await type.update({ name: name.trim() });
    return res.status(200).json({ success: true, data: type });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "Attribute type name already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAttributeType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await AttributeType.findByPk(id);
    if (!type) return res.status(404).json({ success: false, message: "Not found" });
    // CASCADE deletes AttributeValues via FK
    await AttributeValue.destroy({ where: { attributeTypeId: id } });
    await type.destroy();
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttributeValues = async (req, res) => {
  try {
    const { id } = req.params;
    const values = await AttributeValue.findAll({ where: { attributeTypeId: id }, order: [["value", "ASC"]] });
    return res.status(200).json({ success: true, data: values });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addAttributeValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    if (!value?.trim()) return res.status(400).json({ success: false, message: "Value is required" });
    const type = await AttributeType.findByPk(id);
    if (!type) return res.status(404).json({ success: false, message: "Attribute type not found" });
    const attrValue = await AttributeValue.create({ attributeTypeId: id, value: value.trim() });
    return res.status(201).json({ success: true, data: attrValue });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAttributeValue = async (req, res) => {
  try {
    const { valueId } = req.params;
    const val = await AttributeValue.findByPk(valueId);
    if (!val) return res.status(404).json({ success: false, message: "Not found" });
    await val.destroy();
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
