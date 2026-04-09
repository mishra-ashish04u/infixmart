import { HttpError } from "../api/http.js";
import { deleteUploadByPublicPath } from "../files/uploads.js";
import {
  countRootCategories,
  countSubCategories,
  createCategory,
  deleteCategoryById,
  findCategoryById,
  listCategories,
  listChildCategories,
  updateCategory,
} from "../repositories/categories.js";

function buildCategoryTree(categories) {
  const categoryMap = Object.fromEntries(
    categories.map((cat) => [cat.id, { ...cat, children: [] }])
  );

  const rootCategories = [];

  for (const category of categories) {
    if (category.parentCatId && categoryMap[category.parentCatId]) {
      categoryMap[category.parentCatId].children.push(categoryMap[category.id]);
    } else if (!category.parentCatId) {
      rootCategories.push(categoryMap[category.id]);
    }
  }

  return rootCategories;
}

async function getAllCategories() {
  const categories = await listCategories();
  const tree = buildCategoryTree(categories);

  return {
    categories: tree,
    data: tree,
    message: "Categories fetched successfully",
    success: true,
    error: false,
  };
}

async function getCategoryCount() {
  return {
    count: await countRootCategories(),
    message: "Category count fetched successfully",
    success: true,
    error: false,
  };
}

async function getSubCategoryCount() {
  return {
    count: await countSubCategories(),
    message: "Subcategory count fetched successfully",
    success: true,
    error: false,
  };
}

async function getCategoryById(id) {
  const category = await findCategoryById(id);
  if (!category) {
    throw new HttpError(404, "Category not found");
  }

  return {
    categorybyId: category,
    message: "Category fetched successfully",
    success: true,
    error: false,
  };
}

async function createCategoryRecord(body) {
  const images = Array.isArray(body.images)
    ? body.images
    : JSON.parse(body.images || "[]");

  const category = await createCategory({
    name: body.name,
    images,
    parentCatName: body.parentCatName || null,
    parentCatId: body.parentCatId || null,
  });

  return {
    category,
    message: "Category created successfully",
    success: true,
    error: false,
  };
}

async function updateCategoryRecord(id, body) {
  const existing = await findCategoryById(id);
  if (!existing) {
    throw new HttpError(404, "Category not found");
  }

  const images = Array.isArray(body.images)
    ? body.images
    : JSON.parse(body.images || "[]");

  const category = await updateCategory(id, {
    name: body.name,
    images: images.length > 0 ? images : existing.images,
    parentCatName: body.parentCatName || null,
    parentCatId: body.parentCatId || null,
  });

  return {
    category,
    message: "Category updated successfully",
    success: true,
    error: false,
  };
}

async function deleteCategoryRecord(id) {
  const category = await findCategoryById(id);
  if (!category) {
    throw new HttpError(404, "Category not found");
  }

  for (const img of category.images || []) {
    await deleteUploadByPublicPath(img);
  }

  const subCategories = await listChildCategories(id);
  for (const sub of subCategories) {
    const thirdSubs = await listChildCategories(sub.id);
    for (const third of thirdSubs) {
      await deleteCategoryById(third.id);
    }
    await deleteCategoryById(sub.id);
  }

  await deleteCategoryById(id);

  return {
    message: "Category deleted successfully",
    success: true,
    error: false,
  };
}

async function bulkDeleteCategories(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new HttpError(400, "No category IDs provided");
  }

  for (const id of ids) {
    const category = await findCategoryById(id);
    if (!category) {
      continue;
    }

    await deleteCategoryRecord(id);
  }

  return {
    message: "Categories deleted successfully",
    success: true,
    error: false,
  };
}

export {
  bulkDeleteCategories,
  createCategoryRecord,
  deleteCategoryRecord,
  getAllCategories,
  getCategoryById,
  getCategoryCount,
  getSubCategoryCount,
  updateCategoryRecord,
};
