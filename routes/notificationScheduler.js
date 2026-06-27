// const express = require("express");
// const router = express.Router();
// const { admin,db } = require("../config/firebase");

// router.get("/check-meals", async (req, res) => {
//   try {
//     // Current Indian Time
//     const now = new Date();

//     const currentTime = now
//       .toLocaleTimeString("en-IN", {
//         timeZone: "Asia/Kolkata",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       })
//       .toUpperCase();

//     console.log("Current IST:", currentTime);

//     const gymsSnapshot = await db.collection("gyms").get();

//     let matchedMeals = [];

//     for (const gym of gymsSnapshot.docs) {
//       const membersSnapshot = await gym.ref
//         .collection("gymmembers")
//         .where("notificationEnabled", "==", true)
//         .get();
//       console.log("Members Found:", membersSnapshot.size);
//       for (const member of membersSnapshot.docs) {
//         const memberData = member.data();

//         const dietsSnapshot = await member.ref.collection("diets").get();
//         console.log("Diets Found:", dietsSnapshot.size);
//         for (const diet of dietsSnapshot.docs) {
//           const dietData = diet.data();

//           if (!dietData.diet || !dietData.diet.meals) continue;

//           for (const meal of dietData.diet.meals) {
//             console.log(
//               "Firestore Meal Time:",
//               JSON.stringify(meal.time),
//               "Current:",
//               JSON.stringify(currentTime),
//             );
//             if (meal.time === currentTime) {
//               matchedMeals.push({
//                 gymId: gym.id,
//                 memberId: member.id,
//                 userid: memberData.userid,
//                 token: memberData.fcmtoken,
//                 mealName: meal.mealName,
//                 recipe: meal.recipe.title,
//                 time: meal.time,
//               });
//             }
//           }
//         }
//       }
//     }

//     return res.json({
//       success: true,
//       currentTime,
//       totalMatched: matchedMeals.length,
//       meals: matchedMeals,
//     });
//     console.log(currentTime);
//   } catch (err) {
//     console.error(err);

//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });

// module.exports = router;








// const express = require("express");
// const router = express.Router();
// const { admin, db } = require("../config/firebase");

// router.get("/check-meals", async (req, res) => {
//   try {
//     const currentTime = new Date()
//       .toLocaleTimeString("en-IN", {
//         timeZone: "Asia/Kolkata",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       })
//       .toUpperCase();

//     console.log("Current IST:", currentTime);

//     const gymsSnapshot = await db.collection("gyms").get();

//     const matchedMeals = [];

//     for (const gym of gymsSnapshot.docs) {
//       const membersSnapshot = await gym.ref
//         .collection("gymmembers")
//         .where("notificationEnabled", "==", true)
//         .get();

//       for (const member of membersSnapshot.docs) {
//         const memberData = member.data();

//         if (!memberData.fcmtoken) continue;

//         const dietsSnapshot = await member.ref.collection("diets").get();

//         for (const diet of dietsSnapshot.docs) {
//           const dietData = diet.data();

//           if (!dietData.diet?.meals) continue;

//           for (const meal of dietData.diet.meals) {
//             const firestoreTime = meal.time.trim().toUpperCase();

//             console.log(
//               "Meal:",
//               meal.mealName,
//               firestoreTime,
//               "| Current:",
//               currentTime
//             );

//             if (firestoreTime !== currentTime) continue;

//             matchedMeals.push({
//               gymId: gym.id,
//               memberId: member.id,
//               userid: memberData.userid,
//               mealName: meal.mealName,
//               recipe: meal.recipe.title,
//               time: meal.time,
//             });

//             try {
//               await admin.messaging().send({
//                 token: memberData.fcmtoken,

//                 notification: {
//                   title: `🍽 ${meal.mealName} Time`,
//                   body: `${meal.recipe.title}\nTime to eat!`,
//                 },

//                 // webpush: {
//                 //   notification: {
//                 //     icon: "https://yourdomain.com/icon.png",
//                 //     badge: "https://yourdomain.com/icon.png",
//                 //   },
//                 // },
//               });

//               console.log(
//                 `✅ Notification sent to ${memberData.userid}`
//               );
//             } catch (error) {
//               console.error(
//                 `❌ Failed for ${memberData.userid}:`,
//                 error.message
//               );
//             }
//           }
//         }
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       currentTime,
//       totalMatched: matchedMeals.length,
//       meals: matchedMeals,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();

const { checkMeals } = require("../services/mealScheduler");

router.get("/check-meals", async (req, res) => {
  const result = await checkMeals();
  res.json(result);
});

module.exports = router;