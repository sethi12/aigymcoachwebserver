const fs = require("fs");
const path = require("path");
const { normalizeFoodName } = require("../services/foodnormailzer");

// ----------------------------
// Read USDA JSON
// ----------------------------
const usdaPath = path.join(__dirname, "usda.json");
const outputPath = path.join(__dirname, "cleanFoods.json");

const raw = fs.readFileSync(usdaPath, "utf8");
const usda = JSON.parse(raw);

// USDA Foundation Foods
const foods = usda.FoundationFoods;

// ----------------------------
// Helper Functions
// ----------------------------

function getNutrient(food, names) {

    if (!Array.isArray(names)) {
        names = [names];
    }

    const nutrients = food.foodNutrients || [];

    for (const nutrientName of names) {

        const nutrient = nutrients.find(
            n =>
                n.nutrient &&
                n.nutrient.name === nutrientName
        );

        if (nutrient && nutrient.amount != null) {

            // Convert Energy from kJ to kcal
            if (
                nutrient.nutrient.name === "Energy" &&
                nutrient.nutrient.unitName.toLowerCase() === "kj"
            ) {
                return +(nutrient.amount / 4.184).toFixed(1);
            }

            return nutrient.amount;
        }
    }

    return 0;
}

function createId(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "_");
}

function createSearchName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, " ");
}

// ----------------------------
// Convert Foods
// ----------------------------

const cleanFoods = foods
    .filter(food => food && typeof food === "object")
    .map((food) => {

        const name = food.description ?? "Unknown Food";

        const searchName = createSearchName(name);

        const normalizedName = normalizeFoodName(name);

        // Raw aliases
        const aliases = [
            name.toLowerCase(),
            searchName,
            normalizedName
        ];

        // Remove duplicate aliases
        const uniqueAliases = [...new Set(aliases)];

        // Normalized aliases
        const normalizedAliases = [
            ...new Set(
                uniqueAliases.map(alias => normalizeFoodName(alias))
            )
        ];

        return {

            id: createId(name),

            name,

            searchName,

            normalizedName,

            aliases: uniqueAliases,

            normalizedAliases,

            category: food.foodCategory?.description || "Unknown",

            source: "USDA",

            fdcId: food.fdcId,

            nutrition: {

                calories: getNutrient(food, [
                    "Energy",
                    "Energy (Atwater General Factors)",
                    "Energy (Atwater Specific Factors)"
                ]),

                protein:
                    getNutrient(food, "Protein"),

                carbs:
                    getNutrient(food, "Carbohydrate, by difference"),

                fat:
                    getNutrient(food, "Total lipid (fat)"),

                fiber:
                    getNutrient(food, "Fiber, total dietary"),

                sugar:
                    getNutrient(food, "Sugars, Total"),

                sodium:
                    getNutrient(food, "Sodium, Na")
            },

            serving: {

                baseWeight: 100,

                unit: "g"
            }

        };

    });

// ----------------------------
// Save Output
// ----------------------------

fs.writeFileSync(
    outputPath,
    JSON.stringify(cleanFoods, null, 2)
);

console.log("====================================");
console.log("USDA Parsing Completed Successfully");
console.log("====================================");
console.log(`Foods Parsed : ${cleanFoods.length}`);
console.log(`Saved File   : ${outputPath}`);
console.log("");

console.log("First Food Preview:\n");
console.log(cleanFoods[0]);