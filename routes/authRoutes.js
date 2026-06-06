const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

router.post("/login", async (req, res) => {
  try {
    const { gymname, password } = req.body;

    if (!gymname || !password) {
      return res.status(400).json({
        success: false,
        message: "Gym name and password are required",
      });
    }

    const snapshot = await db
      .collection("gyms")
      .where("gymname", "==", gymname)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({
        success: false,
        message: "Gym not found",
      });
    }

    const gymDoc = snapshot.docs[0];
    const gymData = gymDoc.data();

    if (gymData.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      gym: {
        docId: gymDoc.id,
        gymid: gymData.gymid,
        gymname: gymData.gymname,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;