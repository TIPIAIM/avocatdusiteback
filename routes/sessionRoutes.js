const express = require("express");
const router = express.Router();
const { getUserSessions } = require("../controllers/sessionController");
 
router.get("/sessions", getUserSessions);

module.exports = router;
//getUserSessions