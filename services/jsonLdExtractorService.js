const cheerio = require("cheerio");

/**
 * Convert values like:
 * "165 kcal" -> 165
 * "31 g" -> 31
 * "74 mg" -> 74
 */
const parseNutritionValue = (value) => {

    if (value === undefined || value === null) return null;

    if (typeof value === "number") return value;

    const match = value.toString().match(/-?\d+(\.\d+)?/);

    return match ? Number(match[0]) : null;

};

/**
 * Reject values that are almost certainly bad data rather than real
 * nutrition figures (e.g. a site accidentally embedding a serving count
 * or an ID in a NutritionInformation field). Generous on purpose.
 */
const isPlausible = (field, value) => {

    if (value === null) return true;

    const caps = {
        calories: 900,
        protein: 100,
        carbs: 100,
        fat: 100,
        fiber: 50,
        sugar: 100,
        sodium: 5000
    };

    const cap = caps[field];

    return cap === undefined || (value >= 0 && value <= cap);

};

const sanitize = (nutrition) => {

    const clean = {};

    for (const [field, value] of Object.entries(nutrition)) {

        clean[field] = isPlausible(field, value) ? value : null;

        if (value !== null && clean[field] === null) {
            console.log(`⚠️ Discarded implausible JSON-LD ${field} value: ${value}`);
        }

    }

    return clean;

};

/**
 * Recursively search any object for NutritionInformation
 */
const findNutritionInformation = (obj) => {

    if (!obj || typeof obj !== "object") return null;

    if (
        obj["@type"] === "NutritionInformation" ||
        (Array.isArray(obj["@type"]) &&
            obj["@type"].includes("NutritionInformation"))
    ) {
        return obj;
    }

    if (Array.isArray(obj)) {

        for (const item of obj) {

            const result = findNutritionInformation(item);

            if (result) return result;

        }

        return null;

    }

    for (const key of Object.keys(obj)) {

        const result = findNutritionInformation(obj[key]);

        if (result) return result;

    }

    return null;

};

const extractNutritionFromJsonLd = (
    html,
    sourceUrl = "",
    pageTitle = ""
) => {

    try {

        const $ = cheerio.load(html);

        const scripts = $('script[type="application/ld+json"]');

        for (let i = 0; i < scripts.length; i++) {

            const jsonText = $(scripts[i]).html();

            if (!jsonText) continue;

            try {

                let data = JSON.parse(jsonText);

                const nutrition =
                    findNutritionInformation(data);

                if (!nutrition) continue;

                const parsed = {

                    calories: parseNutritionValue(
                        nutrition.calories
                    ),

                    protein: parseNutritionValue(
                        nutrition.proteinContent
                    ),

                    carbs: parseNutritionValue(
                        nutrition.carbohydrateContent
                    ),

                    fat: parseNutritionValue(
                        nutrition.fatContent
                    ),

                    fiber: parseNutritionValue(
                        nutrition.fiberContent
                    ),

                    sugar: parseNutritionValue(
                        nutrition.sugarContent
                    ),

                    sodium: parseNutritionValue(
                        nutrition.sodiumContent
                    )

                };

                return {

                    source: sourceUrl,

                    title: pageTitle,

                    extractedBy: "jsonld",

                    nutrition: sanitize(parsed)

                };

            }

            catch (err) {

                continue;

            }

        }

        return null;

    }

    catch (err) {

        console.error("JSON-LD Extraction Error:", err);

        return null;

    }

};

module.exports = {

    extractNutritionFromJsonLd

};