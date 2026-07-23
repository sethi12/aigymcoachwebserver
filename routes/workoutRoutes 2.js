const express = require("express");
const router = express.Router();

const {
  getMemberWorkoutPlans,
} = require("../controllers/workoutController");

router.post("/member-workouts", getMemberWorkoutPlans);

module.exports = router;