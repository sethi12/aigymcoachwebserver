// const admin = require("firebase-admin");
// const { db } = require("../config/firebase");
// const { normalizeFoodName } = require("./foodnormailzer");

// const {
//     researchNutrition
// } = require("./nutritionResearchService");

// const {
//     buildConsensus
// } = require("./nutritionConsensusService");
// /**
//  * ----------------------------
//  * Food Matching Score
//  * ----------------------------
//  */

// const scoreFood = (food) => {

//     const name = food.name.toLowerCase();

//     let score = 0;

//     // Prefer common foods
//     if (name.includes("raw")) score += 5;
//     if (name.includes("fresh")) score += 4;
//     if (name.includes("whole")) score += 3;

//     // Avoid processed versions
//     if (name.includes("dried")) score -= 10;
//     if (name.includes("powder")) score -= 10;
//     if (name.includes("dehydrated")) score -= 10;
//     if (name.includes("mix")) score -= 8;
//     if (name.includes("substitute")) score -= 8;

//     return score;
// };

// const selectBestMatch = (docs) => {

//     if (docs.length === 0) return null;

//     const foods = docs.map(doc => doc.data());

//     foods.sort((a, b) => scoreFood(b) - scoreFood(a));

//     return foods[0];
// };

// /**
//  * ----------------------------
//  * Search Firestore
//  * ----------------------------
//  */

// const findFoodInFirestore = async (normalizedName) => {

//     console.log("Searching Firestore:", normalizedName);

//     // 1. normalizedName
//     let snapshot = await db
//         .collection("nutrition")
//         .where("normalizedName", "==", normalizedName)
//         .get();

//     console.log("normalizedName matches:", snapshot.size);

//     if (!snapshot.empty) {
//         return selectBestMatch(snapshot.docs);
//     }

//     // 2. normalizedAliases
//     snapshot = await db
//         .collection("nutrition")
//         .where("normalizedAliases", "array-contains", normalizedName)
//         .get();

//     console.log("normalizedAliases matches:", snapshot.size);

//     if (!snapshot.empty) {
//         return selectBestMatch(snapshot.docs);
//     }

//     // 3. aliases
//     snapshot = await db
//         .collection("nutrition")
//         .where("aliases", "array-contains", normalizedName)
//         .get();

//     console.log("aliases matches:", snapshot.size);

//     if (!snapshot.empty) {
//         return selectBestMatch(snapshot.docs);
//     }

//     return null;
// };

// /**
//  * ----------------------------
//  * Nutrition Calculation
//  * ----------------------------
//  */

// const calculateNutrition = (foodDoc, weight) => {

//     const baseWeight = foodDoc.serving?.baseWeight || 100;

//     const factor = weight / baseWeight;

//     const nutrition = {};

//     Object.entries(foodDoc.nutrition).forEach(([key, value]) => {

//         nutrition[key] = Number(
//             ((value || 0) * factor).toFixed(2)
//         );

//     });

//     return nutrition;
// };

// /**
//  * ----------------------------
//  * Meal Totals
//  * ----------------------------
//  */

// const calculateTotals = (foods) => {

//     const totals = {

//         calories: 0,
//         protein: 0,
//         carbs: 0,
//         fat: 0,
//         fiber: 0,
//         sugar: 0,
//         sodium: 0

//     };

//     foods.forEach(food => {

//         Object.keys(totals).forEach(key => {

//             totals[key] += food.nutrition[key] || 0;

//         });

//     });

//     Object.keys(totals).forEach(key => {

//         totals[key] = Number(totals[key].toFixed(2));

//     });

//     return totals;
// };

// /**
//  * ----------------------------
//  * Main Nutrition Service
//  * ----------------------------
//  */

// const getMealNutrition = async (detectedFoods) => {

//     const results = [];

//     for (const food of detectedFoods) {

//         const normalizedName = normalizeFoodName(food.name);

//         console.log(
//             `Searching: "${food.name}" -> "${normalizedName}"`
//         );

//         const firestoreFood =
//             await findFoodInFirestore(normalizedName);

// let finalFood = firestoreFood;

// if (!finalFood) {

//     console.log(
//         `"${normalizedName}" not found in Firestore.`
//     );

//     console.log("Researching nutrition...");

//     const extracted =
//         await researchNutrition(normalizedName);

//     const consensus =
//         buildConsensus(extracted);

//     if (consensus) {

//         await saveNutritionToFirestore(

//             normalizedName,

//             consensus

//         );

//         finalFood = {

//             name: normalizedName,

//             category: "Unknown",

//             source: "AI Research",

//             serving: {

//                 baseWeight: 100,

//                 unit: "g"

//             },

//             nutrition: consensus.nutrition

//         };

//     }

// }
// results.push({

//     originalName: food.name,

//     normalizedName,

//     matchedName: finalFood.name,

//     category: finalFood.category,

//     source: finalFood.source,

//     fdcId: finalFood.fdcId,

//     weight: food.estimatedWeight,

//     found: true,

//     nutrition: calculateNutrition(
//         finalFood,
//         food.estimatedWeight
//     )

// });

//     }

//     return {

//         foods: results,

//         totalNutrition: calculateTotals(
//             results.filter(food => food.found)
//         )

//     };

// };
// console.log("Saving nutrition to Firestore...");
// const saveNutritionToFirestore = async (
//     normalizedName,
//     consensus
// ) => {

//     await db
//     .collection("nutrition")
//     .doc(normalizedName)
//     .set({

//         normalizedName,

//         normalizedAliases: [],

//         aliases: [],

//         name: normalizedName,

//         category: "Unknown",

//         source: "AI Research",

//         serving: {

//             baseWeight: 100,

//             unit: "g"

//         },

//         nutrition: consensus.nutrition,

//         confidence: consensus.confidence,

//         references: consensus.sources,

//         createdAt:
//             admin.firestore.FieldValue.serverTimestamp(),

//         updatedAt:
//             admin.firestore.FieldValue.serverTimestamp()

//     });
//     console.log("Saved successfully.");

// };
// module.exports = {

//     getMealNutrition

// };



const admin = require("firebase-admin");
const { db } = require("../config/firebase");
const { normalizeFoodName } = require("./foodnormailzer");

const {
    researchNutrition
} = require("./nutritionResearchService");

const {
    buildConsensus
} = require("./nutritionConsensusService");
/**
 * ----------------------------
 * Food Matching Score
 * ----------------------------
 */

const scoreFood = (food) => {

    const name = food.name.toLowerCase();

    let score = 0;

    // Prefer common foods
    if (name.includes("raw")) score += 5;
    if (name.includes("fresh")) score += 4;
    if (name.includes("whole")) score += 3;

    // Avoid processed versions
    if (name.includes("dried")) score -= 10;
    if (name.includes("powder")) score -= 10;
    if (name.includes("dehydrated")) score -= 10;
    if (name.includes("mix")) score -= 8;
    if (name.includes("substitute")) score -= 8;

    return score;
};

const selectBestMatch = (docs) => {

    if (docs.length === 0) return null;

    const foods = docs.map(doc => doc.data());

    foods.sort((a, b) => scoreFood(b) - scoreFood(a));

    return foods[0];
};

/**
 * ----------------------------
 * Search Firestore
 * ----------------------------
 */

const findFoodInFirestore = async (normalizedName) => {

    console.log("Searching Firestore:", normalizedName);

    // 1. normalizedName
    let snapshot = await db
        .collection("nutrition")
        .where("normalizedName", "==", normalizedName)
        .get();

    console.log("normalizedName matches:", snapshot.size);

    if (!snapshot.empty) {
        return selectBestMatch(snapshot.docs);
    }

    // 2. normalizedAliases
    snapshot = await db
        .collection("nutrition")
        .where("normalizedAliases", "array-contains", normalizedName)
        .get();

    console.log("normalizedAliases matches:", snapshot.size);

    if (!snapshot.empty) {
        return selectBestMatch(snapshot.docs);
    }

    // 3. aliases
    snapshot = await db
        .collection("nutrition")
        .where("aliases", "array-contains", normalizedName)
        .get();

    console.log("aliases matches:", snapshot.size);

    if (!snapshot.empty) {
        return selectBestMatch(snapshot.docs);
    }

    return null;
};

/**
 * ----------------------------
 * Nutrition Calculation
 * ----------------------------
 */

const calculateNutrition = (foodDoc, weight) => {

    const baseWeight = foodDoc.serving?.baseWeight || 100;

    const factor = weight / baseWeight;

    const nutrition = {};

    Object.entries(foodDoc.nutrition).forEach(([key, value]) => {

        nutrition[key] = Number(
            ((value || 0) * factor).toFixed(2)
        );

    });

    return nutrition;
};

const EMPTY_NUTRITION = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
};

/**
 * Fallback nutrition built directly from Groq's vision estimate when
 * no reliable source (Firestore or web research) could be found for
 * this food. Groq already estimates calories/protein/carbs/fat scaled
 * to the actual detected portion (not per-100g), so these numbers are
 * used as-is - no baseWeight scaling needed here, unlike
 * calculateNutrition() which scales a per-100g Firestore doc.
 *
 * This is intentionally lower-confidence than a verified source and
 * is labeled as such (source: "ai-vision-estimate") so the app/UI can
 * distinguish "USDA/verified data" from "AI's best guess" - important
 * for a health/fitness product where users may act on these numbers.
 */
const buildVisionEstimateNutrition = (food) => ({
    calories: food.calories ?? 0,
    protein: food.protein ?? 0,
    carbs: food.carbs ?? 0,
    fat: food.fat ?? 0,
    // Groq's meal-image prompt doesn't estimate these - unknown rather
    // than falsely implying "zero fiber/sugar/sodium in this food."
    fiber: null,
    sugar: null,
    sodium: null
});

/**
 * ----------------------------
 * Meal Totals
 * ----------------------------
 */

const calculateTotals = (foods) => {

    const totals = {

        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0

    };

    foods.forEach(food => {

        Object.keys(totals).forEach(key => {

            // Vision-estimate fallback foods leave fiber/sugar/sodium
            // as null (unknown) rather than 0 (verified zero) - guard
            // against null/undefined here so totals don't become NaN.
            totals[key] += food.nutrition[key] || 0;

        });

    });

    Object.keys(totals).forEach(key => {

        totals[key] = Number(totals[key].toFixed(2));

    });

    return totals;
};

/**
 * ----------------------------
 * Main Nutrition Service
 * ----------------------------
 */

const getMealNutrition = async (detectedFoods) => {

    const results = [];

    for (const food of detectedFoods) {

        const normalizedName = normalizeFoodName(food.name);

        console.log(
            `Searching: "${food.name}" -> "${normalizedName}"`
        );

        const firestoreFood =
            await findFoodInFirestore(normalizedName);

        let finalFood = firestoreFood;

        if (!finalFood) {

            console.log(
                `"${normalizedName}" not found in Firestore.`
            );

            console.log("Researching nutrition...");

            const extracted =
                await researchNutrition(normalizedName);

            const consensus =
                buildConsensus(extracted);

            if (consensus) {

                await saveNutritionToFirestore(

                    normalizedName,

                    consensus

                );

                finalFood = {

                    name: normalizedName,

                    category: "Unknown",

                    source: "AI Research",

                    serving: {

                        baseWeight: 100,

                        unit: "g"

                    },

                    nutrition: consensus.nutrition

                };

            }

        }

        // Research can legitimately come up empty (too few reliable
        // sources found structured data). Rather than zeroing this food
        // out, fall back to Groq's own vision-based estimate - it's
        // lower confidence than a verified nutrition-fact table, but
        // far more useful to the user than "0 calories" for something
        // that's clearly on their plate.
        if (!finalFood) {

            console.log(
                `⚠️ No reliable nutrition source for "${normalizedName}" - falling back to AI vision estimate.`
            );

            const weight = food.estimatedWeight || 100;

            // Groq's numbers are scaled to this specific portion, but
            // Firestore docs are always stored per-100g (baseWeight: 100)
            // so future lookups/scaling work the same way as any other
            // entry. Normalize before saving.
            const visionNutritionAtWeight =
                buildVisionEstimateNutrition(food);

            const visionNutritionPer100g = {};

            Object.entries(visionNutritionAtWeight).forEach(
                ([key, value]) => {

                    visionNutritionPer100g[key] =
                        value === null
                            ? null
                            : Number(
                                  ((value / weight) * 100).toFixed(2)
                              );

                }
            );

            await saveNutritionToFirestore(

                normalizedName,

                {
                    nutrition: visionNutritionPer100g,
                    // Deliberately lower than a real consensus score
                    // (which starts at 80+) so it's clear this came
                    // from a single vision guess, not scraped sources.
                    confidence: 40,
                    sources: [{
                        title: "Groq vision estimate (no reliable web sources found)",
                        url: null,
                        extractedBy: "ai-vision"
                    }]
                },

                "ai-vision-estimate"

            );

            results.push({

                originalName: food.name,

                normalizedName,

                matchedName: food.name,

                category: "Unknown",

                source: "ai-vision-estimate",

                fdcId: null,

                weight,

                found: true,

                confidence: "low",

                // Keep the values at the actual detected weight for
                // this meal's display/totals - not the per-100g figures
                // that just got saved to Firestore.
                nutrition: visionNutritionAtWeight

            });

            continue;

        }

        results.push({

            originalName: food.name,

            normalizedName,

            matchedName: finalFood.name,

            category: finalFood.category,

            source: finalFood.source,

            fdcId: finalFood.fdcId,

            weight: food.estimatedWeight,

            found: true,

            nutrition: calculateNutrition(
                finalFood,
                food.estimatedWeight
            )

        });

    }

    return {

        foods: results,

        totalNutrition: calculateTotals(
            results.filter(food => food.found)
        )

    };

};

const saveNutritionToFirestore = async (
    normalizedName,
    consensus,
    sourceLabel = "AI Research"
) => {

    await db
    .collection("nutrition")
    .doc(normalizedName)
    .set({

        normalizedName,

        normalizedAliases: [],

        aliases: [],

        name: normalizedName,

        category: "Unknown",

        source: sourceLabel,

        serving: {

            baseWeight: 100,

            unit: "g"

        },

        nutrition: consensus.nutrition,

        confidence: consensus.confidence,

        references: consensus.sources,

        createdAt:
            admin.firestore.FieldValue.serverTimestamp(),

        updatedAt:
            admin.firestore.FieldValue.serverTimestamp()

    });
    console.log("Saved successfully.");

};
module.exports = {

    getMealNutrition

};