import { HttpError } from "../api/http.js";
import {
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
} from "../repositories/attributes.js";

async function getAttributeTypes() {
  return { success: true, data: await listAttributeTypes() };
}

async function addAttributeType(body) {
  const name = String(body?.name || "").trim();
  if (!name) {
    throw new HttpError(400, "Name is required");
  }

  if (await findAttributeTypeByName(name)) {
    throw new HttpError(409, "Attribute type already exists");
  }

  return {
    success: true,
    data: { ...(await createAttributeType(name)), values: [] },
  };
}

async function editAttributeType(id, body) {
  const name = String(body?.name || "").trim();
  if (!name) {
    throw new HttpError(400, "Name is required");
  }

  const type = await findAttributeTypeById(id);
  if (!type) {
    throw new HttpError(404, "Not found");
  }

  const existing = await findAttributeTypeByName(name);
  if (existing && String(existing.id) !== String(id)) {
    throw new HttpError(409, "Attribute type name already exists");
  }

  return { success: true, data: await updateAttributeType(id, name) };
}

async function removeAttributeType(id) {
  const type = await findAttributeTypeById(id);
  if (!type) {
    throw new HttpError(404, "Not found");
  }

  await deleteAttributeType(id);
  return { success: true, message: "Deleted" };
}

async function getAttributeValues(id) {
  return { success: true, data: await listAttributeValues(id) };
}

async function addAttributeTypeValue(id, body) {
  const value = String(body?.value || "").trim();
  if (!value) {
    throw new HttpError(400, "Value is required");
  }

  const type = await findAttributeTypeById(id);
  if (!type) {
    throw new HttpError(404, "Attribute type not found");
  }

  return {
    success: true,
    data: await createAttributeValue(id, value),
  };
}

async function removeAttributeTypeValue(valueId) {
  const value = await findAttributeValueById(valueId);
  if (!value) {
    throw new HttpError(404, "Not found");
  }

  await deleteAttributeValue(valueId);
  return { success: true, message: "Deleted" };
}

export {
  addAttributeType,
  addAttributeTypeValue,
  editAttributeType,
  getAttributeTypes,
  getAttributeValues,
  removeAttributeType,
  removeAttributeTypeValue,
};
