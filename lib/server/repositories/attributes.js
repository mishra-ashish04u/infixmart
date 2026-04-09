import { execute, query } from "../db/mysql.js";

function mapType(row) {
  return row ? { ...row, _id: row.id } : null;
}

function mapValue(row) {
  return row ? { ...row, _id: row.id } : null;
}

async function listAttributeTypes() {
  const [types, values] = await Promise.all([
    query(
      `SELECT id, name, createdAt, updatedAt
       FROM AttributeTypes
       ORDER BY name ASC`
    ),
    query(
      `SELECT id, attributeTypeId, value, createdAt, updatedAt
       FROM AttributeValues
       ORDER BY value ASC`
    ),
  ]);

  const groupedValues = values.reduce((acc, row) => {
    const key = row.attributeTypeId;
    acc[key] ||= [];
    acc[key].push(mapValue(row));
    return acc;
  }, {});

  return types.map((row) => ({
    ...mapType(row),
    values: groupedValues[row.id] || [],
  }));
}

async function findAttributeTypeById(id) {
  const rows = await query(
    `SELECT id, name, createdAt, updatedAt
     FROM AttributeTypes
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  return mapType(rows[0]);
}

async function findAttributeTypeByName(name) {
  const rows = await query(
    `SELECT id, name, createdAt, updatedAt
     FROM AttributeTypes
     WHERE name = :name
     LIMIT 1`,
    { name }
  );

  return mapType(rows[0]);
}

async function createAttributeType(name) {
  const result = await execute(
    `INSERT INTO AttributeTypes (name, createdAt, updatedAt)
     VALUES (:name, NOW(), NOW())`,
    { name }
  );

  return findAttributeTypeById(result.insertId);
}

async function updateAttributeType(id, name) {
  await execute(
    `UPDATE AttributeTypes
     SET name = :name, updatedAt = NOW()
     WHERE id = :id`,
    { id, name }
  );

  return findAttributeTypeById(id);
}

async function deleteAttributeType(id) {
  const result = await execute(
    `DELETE FROM AttributeTypes
     WHERE id = :id`,
    { id }
  );

  return result.affectedRows > 0;
}

async function listAttributeValues(attributeTypeId) {
  const rows = await query(
    `SELECT id, attributeTypeId, value, createdAt, updatedAt
     FROM AttributeValues
     WHERE attributeTypeId = :attributeTypeId
     ORDER BY value ASC`,
    { attributeTypeId }
  );

  return rows.map(mapValue);
}

async function createAttributeValue(attributeTypeId, value) {
  const result = await execute(
    `INSERT INTO AttributeValues (attributeTypeId, value, createdAt, updatedAt)
     VALUES (:attributeTypeId, :value, NOW(), NOW())`,
    { attributeTypeId, value }
  );

  const rows = await query(
    `SELECT id, attributeTypeId, value, createdAt, updatedAt
     FROM AttributeValues
     WHERE id = :id
     LIMIT 1`,
    { id: result.insertId }
  );

  return mapValue(rows[0]);
}

async function findAttributeValueById(id) {
  const rows = await query(
    `SELECT id, attributeTypeId, value, createdAt, updatedAt
     FROM AttributeValues
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  return mapValue(rows[0]);
}

async function deleteAttributeValue(id) {
  const result = await execute(
    `DELETE FROM AttributeValues
     WHERE id = :id`,
    { id }
  );

  return result.affectedRows > 0;
}

export {
  createAttributeType,
  createAttributeValue,
  deleteAttributeType,
  deleteAttributeValue,
  findAttributeTypeById,
  findAttributeTypeByName,
  findAttributeValueById,
  listAttributeTypes,
  listAttributeValues,
  updateAttributeType,
};
