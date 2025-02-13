// authntications
const { login, checkLoginStatus } = require("../controller/auth.controller");
const {
  addUser,
  editUser,
  getSingleUser,
} = require("../controller/user.controller");

module.exports = {
  login,
  checkLoginStatus,
  getSingleUser,
  // employee
  addUser,
  editUser,
};
