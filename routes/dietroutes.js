const express = require("express");
const router = express.Router();

const { getMemberDiets } = require("../controllers/dietController");

router.post("/member-diets", getMemberDiets);

module.exports = router;