const { login,checkLoginStatus} = require("../router/contorllers_import");
const { VerifyToken}=require("../helper/shared.helper");
const { changePassword, forgotPassword, VerifyResetLink, resetPassword } = require("../controller/auth.controller");
const router = require("express").Router();

router.post("/login", login);

router.get("/check-login", VerifyToken,checkLoginStatus);

router.post("/change_password", VerifyToken, changePassword);

router.post("/forgot_password", forgotPassword);

router.get("/verifyreset_link/:id", VerifyResetLink);

router.post("/reset-password", resetPassword);

module.exports = router;
