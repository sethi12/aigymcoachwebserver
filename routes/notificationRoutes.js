const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

router.post("/register-token", async (req, res) => {
  try {
    const { gymid, userid, password, fcmtoken } = req.body;

    if (!gymid || !userid || !password || !fcmtoken) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const snapshot = await db
      .collection("gyms")
      .doc(gymid)
      .collection("gymmembers")
      .where("userid", "==", userid)
      .where("password", "==", password)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({
        success: false,
        message: "Invalid User ID or Password",
      });
    }

    const memberDoc = snapshot.docs[0];

    await memberDoc.ref.update({
      fcmtoken,
      notificationEnabled: true,
      notificationEnabledAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Notification token registered successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;