const { db } = require("../config/firebase");

const generateUniqueUserId = async (membersRef, name) => {
  let userid;
  let exists = true;

  const prefix = name
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase()
    .substring(0, 4);

  while (exists) {
    userid =
      prefix +
      Math.floor(1000 + Math.random() * 9000);

    const snapshot = await membersRef
      .where("userid", "==", userid)
      .limit(1)
      .get();

    exists = !snapshot.empty;
  }

  return userid;
};

const generateUserId = async (req, res) => {
  try {
    const { gymDocId, name } = req.body;

    if (!gymDocId || !name) {
      return res.status(400).json({
        success: false,
        message: "Gym ID and Name are required",
      });
    }

    const gymRef = db
      .collection("gyms")
      .doc(gymDocId);

    const gymDoc = await gymRef.get();

    if (!gymDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    const membersRef =
      gymRef.collection("gymmembers");

    const userid = await generateUniqueUserId(
      membersRef,
      name
    );

    return res.status(200).json({
      success: true,
      userid,
    });
  } catch (error) {
    console.error("GENERATE USERID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const addMember = async (req, res) => {
  try {
    const {
      gymDocId,
      userid,
      name,
      password,
    } = req.body;

    if (
      !gymDocId ||
      !userid ||
      !name ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const gymRef = db
      .collection("gyms")
      .doc(gymDocId);

    const gymDoc = await gymRef.get();

    if (!gymDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    const gymData = gymDoc.data();

    const membersRef =
      gymRef.collection("gymmembers");

    // Final uniqueness check
    const existingUser = await membersRef
      .where("userid", "==", userid)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return res.status(400).json({
        success: false,
        message:
          "User ID already exists. Generate a new ID.",
      });
    }

    const memberRef = membersRef.doc();

    const memberData = {
      memberid: memberRef.id,
      userid,
      gymid: gymData.gymid,
      name,
      password,
      createdAt: new Date(),
    };

    await memberRef.set(memberData);

    console.log("\n========== MEMBER CREATED ==========");
    console.log("Gym ID:", gymData.gymid);
    console.log("Member ID:", memberRef.id);
    console.log("User ID:", userid);
    console.log("Name:", name);
    console.log("====================================\n");

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      memberid: memberRef.id,
      userid,
      gymid: gymData.gymid,
    });
  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const getMembers = async (req, res) => {
  try {
    const { gymDocId } = req.params;

    if (!gymDocId) {
      return res.status(400).json({
        success: false,
        message: "Gym ID is required",
      });
    }

    const membersSnapshot = await db
      .collection("gyms")
      .doc(gymDocId)
      .collection("gymmembers")
      .orderBy("createdAt", "desc")
      .get();

    const members = [];

    membersSnapshot.forEach((doc) => {
      members.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error(
      "GET MEMBERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const deleteMember = async (req, res) => {
  try {
    const {
      gymDocId,
      memberid,
    } = req.params;

    if (!gymDocId || !memberid) {
      return res.status(400).json({
        success: false,
        message:
          "Gym ID and Member ID are required",
      });
    }

    const memberRef = db
      .collection("gyms")
      .doc(gymDocId)
      .collection("gymmembers")
      .doc(memberid);

    const memberDoc =
      await memberRef.get();

    if (!memberDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    await memberRef.delete();

    console.log(
      "\n========== MEMBER DELETED =========="
    );
    console.log(
      "Member ID:",
      memberid
    );
    console.log(
      "====================================\n"
    );

    return res.status(200).json({
      success: true,
      message:
        "Member deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE MEMBER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
module.exports = {
  addMember,
  generateUserId,
   getMembers,
  deleteMember,
};