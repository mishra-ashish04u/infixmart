import { HttpError } from "../api/http.js";
import { saveUploadedFiles, deleteUploadByPublicPath } from "../files/uploads.js";

async function uploadImagesFromRequest(request) {
  const formData = await request.formData();
  const images = await saveUploadedFiles(formData, "images");
  return {
    images,
    message: "Image uploaded successfully",
  };
}

async function deleteImageByQuery(request) {
  const { searchParams } = new URL(request.url);
  const img = searchParams.get("img");
  if (!img || !(await deleteUploadByPublicPath(img))) {
    throw new HttpError(400, "Invalid path");
  }

  return { result: "ok" };
}

export { deleteImageByQuery, uploadImagesFromRequest };
