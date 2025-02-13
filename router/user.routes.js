const { VerifyToken } = require("../helper/shared.helper");
const { addUser, getSingleUser, editUser, } = require("./contorllers_import");

const router = require("express").Router();

router.post("/add_user", addUser);
router.put("/edit_user/:id", VerifyToken, editUser);
router.get("/get_single_user/:id", VerifyToken, getSingleUser);

module.exports = router;
