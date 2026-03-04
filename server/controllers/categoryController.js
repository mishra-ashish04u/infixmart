import { Category } from "../models/Category.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

var imagesArr = [];
export const uploadImages = async (req, res) => {
  try {
    imagesArr = [];

    const image = req.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < req?.files?.length; i++) {
      // Use promise style, not callback
      const result = await cloudinary.uploader.upload(
        req?.files[i]?.path,
        options
      );
      imagesArr.push(result.secure_url);
      fs.unlinkSync(`uploads/${req?.files[i]?.filename}`);
    }

    return res.status(200).json({
      images: imagesArr,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const createCategory = async (req, res) => {
  try {
    let category = new Category({
      name: req.body.name,
      images: imagesArr,
      parentCatName: req.body.parentCatName || null,
      parentCatId: req.body.parentCatId || null,
    });

    if (!category) {
      return res
        .status(400)
        .json({ message: "Category not created", error: true, success: false });
    }

    await category.save();
    imagesArr = [];

    return res.status(201).json({
      category,
      message: "Category created successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    const categoryMap = {};

    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat._doc, children: [] };
    });

    const rootCategories = [];

    categories.forEach((cat) => {
      if (cat.parentCatId) {
        categoryMap[cat.parentCatId]?.children.push(categoryMap[cat._id]);
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    return res.status(200).json({
      data: rootCategories,
      message: "Categories fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getCategoryCount = async (req, res) => {
  try {
    const categoryCount = await Category.countDocuments({
      parentCatId: undefined,
    });

    if (!categoryCount) {
      return res
        .status(404)
        .json({ message: "No categories found", error: true, success: false });
    } else {
      return res.status(200).json({
        count: categoryCount,
        message: "Category count fetched successfully",
        success: true,
        error: false,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getSubCategoryCount = async (req, res) => {
  try {
    const categories = await Category.find();
    if (!categories) {
      return res
        .status(404)
        .json({ message: "No categories found", error: true, success: false });
    } else {
      const subCatList = [];
      for (let cat of categories) {
        if (cat.parentCatId !== undefined && cat.parentCatId !== null) {
          subCatList.push(cat);
        }
      }
      return res.status(200).json({
        count: subCatList.length,
        message: "Subcategory count fetched successfully",
        success: true,
        error: false,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", error: true, success: false });
    }
    return res.status(200).json({
      categorybyId: category,
      message: "Category fetched successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const deleteImageFromCloudinary = async (req, res) => {
  try {
    const imgUrl = req.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    if (imageName) {
      const result = await cloudinary.uploader.destroy(
        imageName,
        function (error, result) {
          //console.log(result, error);
        }
      );

      if (result) {
        res.status(200).send(result);
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", error: true, success: false });
    }

    const images = category.images;

    for (let img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(imageName, function (error, result) {
          //console.log(result, error);
        });
      }
    }
    const subCategory = await Category.find({ parentCatId: req.params.id });

    for (let i = 0; i < subCategory.length; i++) {
      const thirdSubCategory = await Category.find({
        parentCatId: subCategory[i]._id,
      });

      for (let j = 0; j < thirdSubCategory.length; j++) {
        await Category.findByIdAndDelete(thirdSubCategory[j]._id);
      }

      await Category.findByIdAndDelete(subCategory[i]._id);
    }

    const deletedCat = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCat) {
      return res
        .status(400)
        .json({ message: "Category not deleted", error: true, success: false });
    }

    return res.status(200).json({
      message: "Category deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const deleteMultipleCategories = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No category IDs provided", error: true, success: false });
    }

    for (const id of ids) {
      const category = await Category.findById(id);
      if (!category) continue;

      const images = category.images;
      for (let img of images) {
        if (!img) continue;
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];
        const imageName = image.split(".")[0];

        if (imageName) {
          await cloudinary.uploader.destroy(imageName, function (error, result) { });
        }
      }

      const subCategory = await Category.find({ parentCatId: id });
      for (let i = 0; i < subCategory.length; i++) {
        const thirdSubCategory = await Category.find({ parentCatId: subCategory[i]._id });
        for (let j = 0; j < thirdSubCategory.length; j++) {
          await Category.findByIdAndDelete(thirdSubCategory[j]._id);
        }
        await Category.findByIdAndDelete(subCategory[i]._id);
      }
      await Category.findByIdAndDelete(id);
    }

    return res.status(200).json({
      message: "Categories deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        images: imagesArr.length > 0 ? imagesArr : req.body.images,
        parentCatName: req.body.parentCatName || null,
        parentCatId: req.body.parentCatId || null,
      },
      { new: true }
    );

    if (!category) {
      return res
        .status(400)
        .json({ message: "Category not updated", error: true, success: false });
    }

    imagesArr = [];

    return res.status(200).json({
      category,
      message: "Category updated successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};
