import CartProduct from "../models/CartProduct.js";
import Product from "../models/Product.js";

export const addToCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required", error: true, success: false });
    }

    const checkItemCart = await CartProduct.findOne({ where: { userId, productId } });
    if (checkItemCart) {
      return res.status(400).json({ message: "Product already in cart" });
    }

    const cartItem = await CartProduct.create({ quantity: 1, userId, productId });

    return res.status(201).json({ data: cartItem, message: "Product added to cart successfully", error: false, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
};

export const getCartItemsController = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItems = await CartProduct.findAll({ where: { userId } });

    // Populate product details
    const cartWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findByPk(item.productId);
        return { ...item.toJSON(), productId: product };
      })
    );

    return res.status(200).json({ cartItem: cartWithProducts, message: "Cart items fetched successfully", error: false, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
};

export const updateCartItemQtyController = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id, quantity } = req.body;

    if (!(_id && quantity)) {
      return res.status(400).json({ message: "Cart item ID and quantity are required", error: true, success: false });
    }

    await CartProduct.update({ quantity }, { where: { id: _id, userId } });

    return res.status(200).json({ message: "Cart item quantity updated successfully", error: false, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
};

export const clearCartController = async (req, res) => {
  try {
    await CartProduct.destroy({ where: { userId: req.userId } });
    return res.status(200).json({ message: "Cart cleared", error: false, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
};

export const deleteCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Cart item ID is required", error: true, success: false });
    }

    const deleted = await CartProduct.destroy({ where: { id: _id, userId } });

    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found", error: true, success: false });
    }

    return res.status(200).json({ message: "Cart item removed successfully", error: false, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
};
