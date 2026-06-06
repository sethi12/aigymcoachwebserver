const express = require("express");

const router = express.Router();
const upload = require("../middleware/upload");
const {
  addBodyPart,
  getBodyParts,

  addMuscleGroup,
  getMuscleGroups,

  addExercise,
  getExercises,
  deleteExercise,
} = require(
  "../controllers/exerciseController"
);

// BODY PARTS

router.post(
  "/add-bodypart",
  addBodyPart
);

router.get(
  "/bodyparts/:gymDocId",
  getBodyParts
);

// MUSCLE GROUPS

router.post(
  "/add-musclegroup",
  addMuscleGroup
);

router.get(
  "/musclegroups/:gymDocId/:bodyPartId",
  getMuscleGroups
);

// EXERCISES

router.post(
  "/add-exercise",
  upload.single("video"),
  addExercise
);

router.get(
  "/exercises/:gymDocId/:bodyPartId/:muscleGroupId",
  getExercises
);

router.delete(
  "/delete-exercise/:gymDocId/:bodyPartId/:muscleGroupId/:exerciseId",
  deleteExercise
);

module.exports = router;