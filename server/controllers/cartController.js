import CartProduct from "../models/CartProduct.js";
import User from "../models/User.js";

export const addToCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    const checkItemCart = await CartProduct.findOne({ userId, productId });

    if (checkItemCart) {
      return res.status(400).json({ message: "Product already in cart" });
    }

    const cartItem = new CartProduct({
      quantity: 1,
      userId,
      productId,
    });

    const save = await cartItem.save();

    const updateCartUser = await User.updateOne(
      { _id: userId },
      { $push: { shopping_cart: productId } }
    );

    return res.status(201).json({
      data: save,
      message: "Product added to cart successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
};

export const getCartItemsController = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItem = await CartProduct.find({ userId }).populate("productId");

    return res.status(200).json({
      cartItem,
      message: "Cart items fetched successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
};

export const updateCartItemQtyController = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id, quantity } = req.body;

    if (!(_id && quantity)) {
      return res.status(400).json({
        message: "Cart item ID and quantity are required",
        error: true,
        success: false,
      });
    }

    const updateCartItem = await CartProduct.updateOne(
      { _id, userId },
      { quantity }
    );

    return res.status(200).json({
      data: updateCartItem,
      message: "Cart item quantity updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
};

export const deleteCartItemController = async (req, res) => {
  try {
    const userId = req.userId;
    const { _id, productId } = req.body;

    if (!(_id && productId)) {
      return res.status(400).json({
        message: "Cart item ID and product ID are required",
        error: true,
        success: false,
      });
    }

    const deleteCartItem = await CartProduct.deleteOne({ _id, userId });

    if (!deleteCartItem) {
      return res.status(404).json({
        message: "Cart item not found",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ _id: userId });

    const cartItems = user?.shopping_cart || [];

    const UpdateuserCart = [
      ...cartItems.slice(0, cartItems.indexOf(productId)),
      ...cartItems.slice(cartItems.indexOf(productId) + 1),
    ];

    user.shopping_cart = UpdateuserCart;
    await user.save();

    return res.status(200).json({
      data: deleteCartItem,
      message: "Cart item removed successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
};
