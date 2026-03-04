import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const registerUserController = async (req, res) => {
  try {
    let user;

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        error: true,
        success: false,
      });
    }

    user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists", error: true, success: false });
    }

    const verifycode = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashPassword,
      otp: verifycode,
      otp_expires: Date.now() + 10 * 60 * 1000, // 10 minutes from now
    });

    await user.save();

    // Correct usage: pass arguments, not an object
    await sendEmailFun(
      email,
      "Verify your email",
      "",
      VerificationEmail(name, verifycode)
    );

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      success: true,
      error: false,
      message:
        "User registered successfully. Please check your email to verify your account.",
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const verifyEmailController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    const isCodeValid = user.otp === otp;
    const isNotExpired = user.otp_expires > Date.now();

    if (isCodeValid && isNotExpired) {
      user.verify_email = true;
      user.otp = null;
      user.otp_expires = null;
      await user.save();
      return res.status(200).json({
        message: "Email verified successfully",
        success: true,
        error: false,
      });
    } else if (!isCodeValid) {
      return res
        .status(400)
        .json({ message: "Invalid OTP", error: true, success: false });
    } else {
      return res
        .status(400)
        .json({ message: "OTP Expired", error: true, success: false });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    if (user.status !== "active") {
      return res.status(400).json({
        message: `Your account is ${user.status}. Please contact support.`,
        error: true,
        success: false,
      });
    }

    if (user.verify_email !== true) {
      return res.status(400).json({
        message: `Your email is not verified. Please verify your email to login.`,
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res
        .status(400)
        .json({ message: "Invalid Credentials", error: true, success: false });
    }

    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user?._id, {
      last_login_date: Date.now(),
    });

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    return res.status(200).json({
      message: "Login Successful",
      success: true,
      error: false,
      data: {
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const logoutUserController = async (req, res) => {
  try {
    const userid = req.userId;

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    await User.findByIdAndUpdate(userid, {
      refreshToken: "",
    });

    return res
      .status(200)
      .json({ message: "Logout Successful", success: true, error: false });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

var imagesArr = [];
export const userAvatarController = async (req, res) => {
  try {
    imagesArr = [];

    const userid = req.userId;
    const image = req.files;

    const user = await User.findOne({ _id: userid });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", error: true, success: false });
    }

    //first remove existing image from cloudinary
    const imgUrl = user?.avatar;
    const urlArr = imgUrl.split("/");
    const avatar_image = urlArr[urlArr.length - 1];
    const imageName = avatar_image.split(".")[0];

    if (imageName) {
      const result = await cloudinary.uploader.destroy(
        imageName,
        function (error, result) {
          //console.log(result, error);
        }
      );
    }

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
      console.log(imagesArr);
      fs.unlinkSync(`uploads/${req?.files[i]?.filename}`);
    }

    user.avatar = imagesArr[0];
    await user.save();

    return res.status(200).json({
      _id: userid,
      avatar: imagesArr[0],
      message: "Image uploaded successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const removeImagefromCloudinary = async (req, res) => {
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
};

export const updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, mobile, country, password } = req.body;

    const userExist = await User.findById(userId);
    if (!userExist) {
      return res
        .status(404)
        .json({ message: "User not found", error: true, success: false });
    }

    let verifyCode = "";
    if (email && email !== userExist.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      userExist.otp_expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    }

    let hashPassword = "";

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
    } else {
      hashPassword = userExist.password;
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name,
        email: email,
        verify_email: verifyCode !== "" ? false : userExist.verify_email,
        mobile: mobile,
        country: country,
        password: hashPassword,
        otp: verifyCode !== "" ? verifyCode : null,
        otp_expires: verifyCode !== "" ? Date.now() + 10 * 60 * 1000 : "",
      },
      { new: true }
    );

    if (verifyCode !== "") {
      await sendEmailFun(
        email,
        "Verify your email",
        "",
        VerificationEmail(name, verifyCode)
      );
    }

    return res.status(200).json({
      message: "User details updated successfully",
      success: true,
      error: false,
      user: {
        name: updateUser?.name,
        _id: updateUser?._id,
        email: updateUser?.email,
        mobile: updateUser?.mobile,
        country: updateUser?.country,
        avatar: updateUser?.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = verifyCode;
    user.otp_expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    await user.save();

    await sendEmailFun(
      email,
      "Verify your email",
      "",
      VerificationEmail(user?.name, verifyCode)
    );

    return res.status(200).json({
      message: "Please check your email to reset your password.",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    if (otp !== user.otp) {
      return res
        .status(400)
        .json({ message: "Invalid OTP", error: true, success: false });
    }

    if (user.otp_expires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP Expired", error: true, success: false });
    }

    user.otp = null;
    user.otp_expires = null;
    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Email, Old Password, New Password and Confirm Password are required",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    const checkPassword = await bcrypt.compare(oldPassword, user.password);
    if (!checkPassword) {
      return res
        .status(400)
        .json({ message: "Invalid Old Password", error: true, success: false });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New Password and Confirm Password do not match",
        error: true,
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashPassword;
    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const refreshTokenController = async (req, res) => {
  // Implementation for refresh token logic goes here
  try {
    const refreshToken =
      req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1];
    if (!refreshToken) {
      return res
        .status(401)
        .json({
          message: "No refresh token provided",
          error: true,
          success: false,
        });
    }

    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_TOKEN
    );

    if (!verifyToken) {
      return res
        .status(403)
        .json({
          message: "Invalid refresh token",
          error: true,
          success: false,
        });
    }

    const userId = verifyToken?.id;

    const newAccessToken = await generateAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.cookie("accessToken", newAccessToken, cookiesOption);

    return res.status(200).json({
      message: "New Access Token generated",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};

export const userDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password -refreshToken -otp -otp_expires");
    return res.status(200).json({
      message: "User details fetched successfully",
      success: true,
      error: false,
      user
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
}

export const resendVerificationOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found!", error: true, success: false });
    }

    if (user.verify_email) {
      return res.status(400).json({
        message: "Email is already verified",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = verifyCode;
    user.otp_expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    await user.save();

    await sendEmailFun(
      email,
      "Verify your email",
      "",
      VerificationEmail(user.name, verifyCode)
    );

    return res.status(200).json({
      message: "Verification OTP resent successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
