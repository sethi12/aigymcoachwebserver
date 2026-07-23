const { db } = require("../config/firebase");

const getMemberWorkoutPlans = async (req, res) => {
  try {
    const { gymid, userid, password } = req.body;

    if (!gymid || !userid || !password) {
      return res.status(400).json({
        success: false,
        message: "Gym ID, User ID and Password are required.",
      });
    }

    const gymSnapshot = await db
      .collection("gyms")
      .where("gymid", "==", gymid)
      .limit(1)
      .get();

    if (gymSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    const gymRef = gymSnapshot.docs[0].ref;

    const memberSnapshot = await gymRef
      .collection("gymmembers")
      .where("userid", "==", userid)
      .where("password", "==", password)
      .limit(1)
      .get();

    if (memberSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const memberData = memberSnapshot.docs[0].data();

    return res.status(200).json({
      success: true,
      workoutPlans: memberData.workoutPlans || [],
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getMemberWorkoutPlans,
};