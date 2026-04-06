import { Router } from "express";
import { forgotPasswordController, loginUserController, logoutUserController, refreshTokenController, registerUserController, deleteImage, resetPasswordController, updateUserDetails, userAvatarController, userDetails, verifyEmailController, verifyForgotPasswordOtp, resendVerificationOtpController, googleLoginController } from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { body, validationResult } from "express-validator";

const userRoute = Router();

// Express Validator error handler
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) return next();
        return res.status(400).json({
            error: true,
            success: false,
            message: errors.array().map(e => e.msg).join(", ")
        });
    };
};

userRoute.post('/register', validate([
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').matches(/\d/).withMessage('Password must contain a number').matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain a special character')
]), registerUserController);

userRoute.post('/verifyemail', verifyEmailController);

userRoute.post('/login', validate([
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
]), loginUserController);

userRoute.get('/logout', auth, logoutUserController);
userRoute.put('/user-avatar', auth, upload.array('avatar'), userAvatarController);
userRoute.delete('/deleteimage', auth, deleteImage);
userRoute.put('/:id', auth, updateUserDetails);
userRoute.post('/google-login', googleLoginController);
userRoute.post('/forgot-password', forgotPasswordController);
userRoute.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
userRoute.post('/resend-otp', resendVerificationOtpController);
userRoute.post('/reset-password', resetPasswordController);
userRoute.post('/refresh-token', refreshTokenController);
userRoute.get('/user-details', auth, userDetails);



export default userRoute;