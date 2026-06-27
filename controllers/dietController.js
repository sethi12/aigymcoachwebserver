const { db } = require("../config/firebase");

const getMemberDiets = async (req, res) => {
  try {
    const { gymid, userid, password } = req.body;

    if (!gymid || !userid || !password) {
      return res.status(400).json({
        success: false,
        message: "Gym ID, User ID and Password are required",
      });
    }

    // Find Member
    const memberSnapshot = await db
      .collection("gyms")
      .doc(gymid)
      .collection("gymmembers")
      .where("userid", "==", userid)
      .where("password", "==", password)
      .limit(1)
      .get();

    if (memberSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: "Invalid User ID or Password",
      });
    }

    const memberDoc = memberSnapshot.docs[0];

    // Get all diets
    const dietSnapshot = await memberDoc.ref
      .collection("diets")
      .get();

    const diets = dietSnapshot.docs.map(doc => ({
      diet_docid: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      success: true,
      diets,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getMemberDiets,
};