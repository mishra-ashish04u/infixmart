import MyList from "../models/MyList.js";

export const addToMyListController = async (req, res) => {
  try {
    const userId = req.body.userId;
    const {
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      discount,
      brand,
    } = req.body;

    const item = await MyList.findOne({ userId, productId });

    if (item) {
      return res.status(400).json({
        message: "Product already in My List",
        success: false,
        error: true,
      });
    }

    const myList = new MyList({
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      discount,
      brand,
      userId,
    });

    const save = await myList.save();

    return res.status(201).json({
      message: "Product added to My List",
      success: true,
      error: false,
      data: save,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

export const deleteFromMyListController = async (req, res) => {
  try {
    const myListItem = await MyList.findById(req.params.id);

    if (!myListItem) {
      return res.status(404).json({
        message: "Item not found in My List",
        success: false,
        error: true,
      });
    }

    const deletedItem = await MyList.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(500).json({
        message: "Failed to remove item from My List",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Item removed from My List",
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};

export const getMyListController = async (req, res) => {
  try {
    const userId = req.userId;
    const myListItems = await MyList.find({ userId });

    if (!myListItems) {
      return res.status(404).json({
        message: "No items found in My List",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "My List fetched successfully",
      success: true,
      error: false,
      data: myListItems,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, success: false, error: true });
  }
};
