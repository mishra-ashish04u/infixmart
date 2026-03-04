import { Router } from "express";
import { forgotPasswordController, loginUserController, logoutUserController, refreshTokenController, registerUserController, removeImagefromCloudinary, resetPasswordController, updateUserDetails, userAvatarController, userDetails, verifyEmailController, verifyForgotPasswordOtp, resendVerificationOtpController } from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRoute = Router();

userRoute.post('/register', registerUserController);
userRoute.post('/verifyemail', verifyEmailController);
userRoute.post('/login', loginUserController);
userRoute.get('/logout', auth, logoutUserController);
userRoute.put('/user-avatar', auth, upload.array('avatar'), userAvatarController);
userRoute.delete('/deleteimage', auth, removeImagefromCloudinary);
userRoute.put('/:id', auth, updateUserDetails);
userRoute.post('/forgot-password', forgotPasswordController);
userRoute.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
userRoute.post('/resend-otp', resendVerificationOtpController);
userRoute.post('/reset-password', resetPasswordController);
userRoute.post('/refresh-token', refreshTokenController);
userRoute.get('/user-details', auth, userDetails);



export default userRoute;