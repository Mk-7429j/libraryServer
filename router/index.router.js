const router = require("express").Router();
const { uploadImage, deleteImage, handleQrUpload } = require("../controller/shared.controller");
const { upload } = require("../helper/multer.helper");
const {
  auth_routes,
  user_routes,
  // dashboard_routes,
  // client_router,
} = require("../router/routes_import");

router.use("/auth", auth_routes);
router.use("/user", user_routes);


// upload
router.post("/upload_images", upload.single("image"), uploadImage);
router.post("/upload-qr", handleQrUpload);
router.delete("/delete_image", deleteImage);


// // dashboard
// router.use("/dashboard", dashboard_routes);

// // clint
// router.use("/Client", client_router);


module.exports = router;
