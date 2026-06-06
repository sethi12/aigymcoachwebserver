const express = require("express");

const router = express.Router();

const {
  addMember,
  generateUserId,
  getMembers,
  deleteMember,
} = require("../controllers/memberController");

router.post(
  "/generate-userid",
  generateUserId
);

router.post(
  "/add-member",
  addMember
);

router.get(
  "/members/:gymDocId",
  getMembers
);

router.delete(
  "/member/:gymDocId/:memberid",
  deleteMember
);

module.exports = router;