import { execute, query } from "../db/mysql.js";

function mapRow(row) {
  return row ? { ...row, _id: row.id } : null;
}

function tableFor(kind) {
  if (kind === "ram") return "ProductRams";
  if (kind === "size") return "ProductSizes";
  if (kind === "weight") return "ProductWeights";
  throw new Error(`Unknown option list kind: ${kind}`);
}

async function listOptions(kind) {
  const table = tableFor(kind);
  const rows = await query(
    `SELECT id, name, createdAt, updatedAt
     FROM ${table}
     ORDER BY createdAt DESC`
  );

  return rows.map(mapRow);
}

async function findOptionByName(kind, name) {
  const table = tableFor(kind);
  const rows = await query(
    `SELECT id, name, createdAt, updatedAt
     FROM ${table}
     WHERE name = :name
     LIMIT 1`,
    { name }
  );

  return mapRow(rows[0]);
}

async function createOption(kind, name) {
  const table = tableFor(kind);
  const result = await execute(
    `INSERT INTO ${table} (name, createdAt, updatedAt)
     VALUES (:name, NOW(), NOW())`,
    { name }
  );

  const rows = await query(
    `SELECT id, name, createdAt, updatedAt
     FROM ${table}
     WHERE id = :id
     LIMIT 1`,
    { id: result.insertId }
  );

  return mapRow(rows[0]);
}

async function deleteOption(kind, id) {
  const table = tableFor(kind);
  const result = await execute(
    `DELETE FROM ${table}
     WHERE id = :id`,
    { id }
  );

  return result.affectedRows > 0;
}

export { createOption, deleteOption, findOptionByName, listOptions };
