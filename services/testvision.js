// require("dotenv").config();

// const {
//   getMealNutrition,
// } = require("./nutritionservice");

// (async () => {
//   const foods = [
//     {
//       name: "Boiled Chicken Breast",
//       estimatedWeight: 250,
//     },
//     {
//       name: "Boiled Egg",
//       estimatedWeight: 50,
//     },
//   ];

//   const result = await getMealNutrition(foods);

//   console.log(JSON.stringify(result, null, 2));
// })();


// require("dotenv").config();

// const {
//     searchFood
// } = require("./serpapiservice");

// (async () => {

//     const results =
//         await searchFood("Chicken Breast");

//     console.log(results);

// })();
// require("dotenv").config();

// const {
//     researchNutrition
// } = require("./nutritionResearchService");

// (async () => {

//     const data =
//         await researchNutrition("Chicken Breast");

//     console.log("\n\nFINAL RESULTS\n");

//     console.dir(data, {
//         depth: null
//     });

// })();



// require("dotenv").config();

// const {
//     researchNutrition
// } = require("./nutritionResearchService");

// const {
//     buildConsensus
// } = require("./nutritionConsensusService");

// (async () => {

//     const extracted =
//         await researchNutrition("Chicken Breast");

//     const consensus =
//         buildConsensus(extracted);

//     console.dir(consensus, {
//         depth: null
//     });

// })();







// require("dotenv").config();

// const { getMealNutrition } = require("./nutritionservice");

// (async () => {

//     const result = await getMealNutrition([
//         {
//             name: "chicken biryani",
//             estimatedWeight: 150
//         }
//     ]);

//     console.dir(result, { depth: null });

// })();




require("dotenv").config();

const path = require("path");

const { analyzeMealImage } = require("./groqVisionService");
const { getMealNutrition } = require("./nutritionService");

(async () => {
    try {

        // Change this image whenever you want to test
        const imagePath = path.join(
            __dirname,
            "../test-images/idli-sambhar.webp"
        );

        // Convert local image to Base64 Data URL
        const fs = require("fs");

        const imageBuffer = fs.readFileSync(imagePath);

        const base64 = imageBuffer.toString("base64");

        const imageUrl = `data:image/jpeg;base64,${base64}`;

        console.log("\n========== GROQ VISION ==========\n");

        const groqResult = await analyzeMealImage(imageUrl);

        console.dir(groqResult, { depth: null });

        console.log("\n========== NUTRITION ==========\n");

        const nutrition = await getMealNutrition(
            groqResult.foods
        );

        console.dir(nutrition, { depth: null });

    } catch (err) {
        console.error(err);
    }
})();