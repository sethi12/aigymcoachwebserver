const { db, bucket } = require("../config/firebase");
const addBodyPart = async (req, res) => {
  try {
    const { gymDocId, name } = req.body;

    if (!gymDocId || !name) {
      return res.status(400).json({
        success: false,
        message: "Gym ID and body part name required",
      });
    }

    const bodyPartsRef = db
      .collection("gyms")
      .doc(gymDocId)
      .collection("bodyparts");

    const existing = await bodyPartsRef
      .where("name", "==", name)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({
        success: false,
        message: "Body part already exists",
      });
    }

    const bodyPartRef = bodyPartsRef.doc();

    await bodyPartRef.set({
      bodypartid: bodyPartRef.id,
      name,
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      bodypartid: bodyPartRef.id,
      name,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getBodyParts = async (req, res) => {
  try {
    const { gymDocId } = req.params;

    const snapshot = await db
      .collection("gyms")
      .doc(gymDocId)
      .collection("bodyparts")
      .orderBy("name")
      .get();

    const bodyParts = [];

    snapshot.forEach((doc) => {
      bodyParts.push(doc.data());
    });

    return res.json({
      success: true,
      bodyParts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const addMuscleGroup = async (
  req,
  res
) => {
  try {
    const {
      gymDocId,
      bodyPartId,
      name,
    } = req.body;

    if (
      !gymDocId ||
      !bodyPartId ||
      !name
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const muscleRef = db
      .collection("gyms")
      .doc(gymDocId)
      .collection("bodyparts")
      .doc(bodyPartId)
      .collection("musclegroups");

    const existing = await muscleRef
      .where("name", "==", name)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({
        success: false,
        message:
          "Muscle group already exists",
      });
    }

    const newMuscle = muscleRef.doc();

    await newMuscle.set({
      musclegroupid: newMuscle.id,
      name,
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      musclegroupid: newMuscle.id,
      name,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getMuscleGroups =
  async (req, res) => {
    try {
      const {
        gymDocId,
        bodyPartId,
      } = req.params;

      const snapshot = await db
        .collection("gyms")
        .doc(gymDocId)
        .collection("bodyparts")
        .doc(bodyPartId)
        .collection("musclegroups")
        .orderBy("name")
        .get();

      const muscles = [];

      snapshot.forEach((doc) => {
        muscles.push(doc.data());
      });

      return res.json({
        success: true,
        muscles,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };

  const addExercise = async (req, res) => {
  try {
    const {
      gymDocId,
      bodyPartId,
      muscleGroupId,
      exerciseName,
    } = req.body;

    if (
      !gymDocId ||
      !bodyPartId ||
      !muscleGroupId ||
      !exerciseName
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file required",
      });
    }

    const exerciseRef = db
      .collection("gyms")
      .doc(gymDocId)
      .collection("bodyparts")
      .doc(bodyPartId)
      .collection("musclegroups")
      .doc(muscleGroupId)
      .collection("exercises")
      .doc();

    const fileName = `gyms/${gymDocId}/exercises/${exerciseRef.id}.mp4`;

    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    await file.makePublic();

    const videoUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    await exerciseRef.set({
      exerciseid: exerciseRef.id,
      exerciseName,

      bodyPartId,
      muscleGroupId,

      videoUrl,
      videoPath: fileName,

      createdAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Exercise Added Successfully",
      exerciseid: exerciseRef.id,
      videoUrl,
    });
  } catch (error) {
    console.error(
      "ADD EXERCISE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



const getExercises = async (
  req,
  res
) => {
  try {
    const {
      gymDocId,
      bodyPartId,
      muscleGroupId,
    } = req.params;

    const snapshot = await db
      .collection("gyms")
      .doc(gymDocId)
      .collection("bodyparts")
      .doc(bodyPartId)
      .collection("musclegroups")
      .doc(muscleGroupId)
      .collection("exercises")
      .orderBy("createdAt", "desc")
      .get();

    const exercises = [];

    snapshot.forEach((doc) => {
      exercises.push(doc.data());
    });

    return res.json({
      success: true,
      exercises,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const deleteExercise = async (
  req,
  res
) => {
  try {
    const {
      gymDocId,
      bodyPartId,
      muscleGroupId,
      exerciseId,
    } = req.params;

    const exerciseRef = db
      .collection("gyms")
      .doc(gymDocId)
      .collection("bodyparts")
      .doc(bodyPartId)
      .collection("musclegroups")
      .doc(muscleGroupId)
      .collection("exercises")
      .doc(exerciseId);

    const exerciseDoc =
      await exerciseRef.get();

    if (!exerciseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    const exerciseData =
      exerciseDoc.data();

    if (exerciseData.videoPath) {
      await bucket
        .file(exerciseData.videoPath)
        .delete()
        .catch(() => {});
    }

    await exerciseRef.delete();

    return res.json({
      success: true,
      message:
        "Exercise deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE EXERCISE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
module.exports = {
  addBodyPart,
  getBodyParts,
  addMuscleGroup,
  getMuscleGroups,
  addExercise,
  getExercises,
  deleteExercise,
};