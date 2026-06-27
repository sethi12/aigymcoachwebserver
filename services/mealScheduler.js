// const { admin, db } = require("../config/firebase");

// const checkMeals = async () => {
//   try {
//     const today = new Date().toLocaleDateString("en-CA", {
//       timeZone: "Asia/Kolkata",
//     });
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
//         const lastNotifications = memberData.lastNotifications || {};
//         if (!memberData.fcmtoken) continue;

//         const dietsSnapshot = await member.ref.collection("diets").get();

//         for (const diet of dietsSnapshot.docs) {
//           const dietData = diet.data();

//           if (!dietData.diet || !dietData.diet.meals) continue;

//           for (const meal of dietData.diet.meals) {
//             const firestoreTime = meal.time.trim().toUpperCase();

//             console.log(
//               "Meal:",
//               meal.mealName,
//               firestoreTime,
//               "| Current:",
//               currentTime,
//             );

//             if (firestoreTime !== currentTime) continue;
//             if (lastNotifications[meal.mealName] === today) {
//               console.log(
//                 `⏩ ${meal.mealName} already sent today for ${memberData.userid}`,
//               );
//               continue;
//             }
//             matchedMeals.push({
//               gymId: gym.id,
//               memberId: member.id,
//               userid: memberData.userid,
//               mealName: meal.mealName,
//               recipe: meal.recipe.title,
//               time: meal.time,
//             });

//             try {
// await admin.messaging().send({
//   token: memberData.fcmtoken,

//   notification: {
//     title: "🏋 Elite Fitness",
//     body: `🍽 ${meal.mealName}

// ${meal.recipe.title}

// 🔥 ${meal.calories} kcal
// 💪 ${meal.protein}g Protein

// Tap to view recipe`,
//   },

//   webpush: {
//     notification: {
//       icon: "https://yourdomain.com/logo-192.png",   // Gym logo
//       badge: "https://yourdomain.com/badge.png",
//       image: "https://yourdomain.com/breakfast.jpg", // Optional
//       tag: `${memberData.userid}-${meal.mealName}`,  // Prevents duplicate browser notifications
//       requireInteraction: true,
//       vibrate: [200, 100, 200],
//     },

//     fcmOptions: {
//       link: "https://yourdomain.com/dashboard",
//     },
//   },
// });
//               await member.ref.set(
//                 {
//                   lastNotifications: {
//                     ...lastNotifications,
//                     [meal.mealName]: today,
//                   },
//                 },
//                 { merge: true },
//               );
//               //   webpush: {
//               //     fcmOptions: {
//               //     //   link: `https://your-domain.com/dashboard?meal=${encodeURIComponent(meal.mealName)}`;
//               //     link:`https://vercel.com/chaitanya-sethis-projects`
//               //     }
//               //   }

//               console.log(`✅ Notification sent to ${memberData.userid}`);
//             } catch (err) {
//               console.error(
//                 `❌ Notification failed for ${memberData.userid}`,
//                 err.message,
//               );
//             }
//           }
//         }
//       }
//     }

//     return {
//       success: true,
//       currentTime,
//       totalMatched: matchedMeals.length,
//       meals: matchedMeals,
//     };
//   } catch (err) {
//     console.error(err);

//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// };

// module.exports = { checkMeals };
