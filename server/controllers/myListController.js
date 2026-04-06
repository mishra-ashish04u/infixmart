import MyList from "../models/MyList.js";

export const addToMyListController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, productTitle, image, rating, price, oldPrice, discount, brand } = req.body;

    const item = await MyList.findOne({ where: { userId, productId } });
    if (item) {
      return res.status(400).json({ message: "Product already in My List", success: false, error: true });
    }

    const myList = await MyList.create({ productId, productTitle, image, rating, price, oldPrice, discount, brand, userId });

    return res.status(201).json({ message: "Product added to My List", success: true, error: false, data: myList });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, success: false, error: true });
  }
};

export const deleteFromMyListController = async (req, res) => {
  try {
    const deleted = await MyList.destroy({ where: { id: req.params.id, userId: req.userId } });

    if (!deleted) {
      return res.status(404).json({ message: "Item not found in My List", success: false, error: true });
    }

    return res.status(200).json({ message: "Item removed from My List", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, success: false, error: true });
  }
};

export const getMyListController = async (req, res) => {
  try {
    const userId = req.userId;
    const myListItems = await MyList.findAll({ where: { userId } });

    return res.status(200).json({ message: "My List fetched successfully", success: true, error: false, data: myListItems });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, success: false, error: true });
  }
};
