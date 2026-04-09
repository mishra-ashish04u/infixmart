import { HttpError } from "../api/http.js";
import { deleteUploadByPublicPath } from "../files/uploads.js";
import {
  createHomeSlide,
  deleteHomeSlide,
  findHomeSlideById,
  listHomeSlides,
  updateHomeSlide,
} from "../repositories/home-slides.js";

function toBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return value === true || value === "true" || value === 1 || value === "1";
}

function parseImages(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [value].filter(Boolean);
    }
  }

  return [];
}

async function getHomeSlidesPublic(params) {
  return {
    success: true,
    data: await listHomeSlides(params),
  };
}

async function createHomeSlideRecord(body) {
  const images = parseImages(body.images);
  if (!images.length) {
    throw new HttpError(400, "At least one image is required");
  }

  return {
    success: true,
    message: "Home Slide added successfully",
    data: await createHomeSlide({
      images,
      title: body.title || null,
      link: body.link || null,
      order: Number(body.order ?? 0),
      type: body.type || "main",
      isActive: toBoolean(body.isActive, true),
    }),
  };
}

async function updateHomeSlideRecord(id, body) {
  const existing = await findHomeSlideById(id);
  if (!existing) {
    throw new HttpError(404, "Slide not found");
  }

  return {
    success: true,
    message: "Slide updated",
    data: await updateHomeSlide(id, {
      title: body.title,
      link: body.link,
      order: body.order !== undefined ? Number(body.order) : undefined,
      isActive:
        body.isActive !== undefined
          ? toBoolean(body.isActive, existing.isActive)
          : undefined,
      type: body.type,
    }),
  };
}

async function deleteHomeSlideRecord(id) {
  const existing = await findHomeSlideById(id);
  if (!existing) {
    throw new HttpError(404, "Home Slide not found");
  }

  for (const image of existing.images || []) {
    await deleteUploadByPublicPath(image);
  }

  await deleteHomeSlide(id);
  return {
    success: true,
    message: "Home Slide deleted successfully",
  };
}

export {
  createHomeSlideRecord,
  deleteHomeSlideRecord,
  getHomeSlidesPublic,
  updateHomeSlideRecord,
};
