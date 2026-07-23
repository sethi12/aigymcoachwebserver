const cheerio = require("cheerio");

/**
 * Parse a nutrition cell's text into a single number.
 *
 * Nutrition-fact tables frequently pack a %DV figure and the actual
 * gram/mg/kcal value into the same cell with no separating whitespace
 * once Cheerio flattens nested markup (e.g. "10" next to "10.5" becomes
 * the literal string "1010.5"). A plain "first number found" regex will
 * happily swallow that whole run as one number.
 *
 * To avoid this we:
 *  1. Strip out any "N%" runs first (these are Daily Value percentages,
 *     never the value we want).
 *  2. Prefer a number that is immediately followed by a known unit
 *     (g, mg, kcal, cal) - this is almost always the real value and
 *     can't accidentally merge with an adjacent bare percentage.
 *  3. Fall back to the first plain number only if no unit-attached
 *     number is found.
 */
const parseValue = (value) => {

    if (!value) return null;

    let text = value.toString();

    // Remove "12%" / "12 %" style Daily Value figures entirely so they
    // can never merge with, or be mistaken for, the real value.
    text = text.replace(/-?\d+(\.\d+)?\s*%/g, " ");

    // Prefer a number glued to a unit (e.g. "10.5g", "165 kcal", "74mg").
    const withUnit = text.match(/-?\d+(\.\d+)?(?=\s?(kcal|cal|mg|g)\b)/i);

    if (withUnit) return Number(withUnit[0]);

    // Fall back: first plain number left in the (already %-stripped) text.
    const plain = text.match(/-?\d+(\.\d+)?/);

    return plain ? Number(plain[0]) : null;

};

/**
 * Reject values that are almost certainly extraction artifacts rather
 * than real nutrition figures. These caps are intentionally generous -
 * they only exist to catch concatenation bugs like "1010.5", not to
 * second-guess genuinely high-fat or high-sodium foods.
 */
const isPlausible = (field, value) => {

    if (value === null) return true;

    const caps = {
        calories: 900,   // per typical row/serving; pure oil tops out here
        protein: 100,
        carbs: 100,
        fat: 100,
        fiber: 50,
        sugar: 100,
        sodium: 5000     // mg - legitimately high for cured/processed foods
    };

    const cap = caps[field];

    return cap === undefined || (value >= 0 && value <= cap);

};

const sanitize = (nutrition) => {

    const clean = {};

    for (const [field, value] of Object.entries(nutrition)) {

        clean[field] = isPlausible(field, value) ? value : null;

        if (value !== null && clean[field] === null) {
            console.log(`⚠️ Discarded implausible ${field} value: ${value}`);
        }

    }

    return clean;

};

const extractNutritionFromHtmlTable = (
    html,
    sourceUrl = "",
    pageTitle = ""
) => {

    try {

        const $ = cheerio.load(html);

        const nutrition = {
            calories: null,
            protein: null,
            carbs: null,
            fat: null,
            fiber: null,
            sugar: null,
            sodium: null
        };

        $("table tr").each((_, row) => {

            // Direct children only - .find() would also pull in cells
            // from any nested sub-table some nutrition pages embed
            // inside a single row (e.g. a "Carbohydrates" row containing
            // its own mini table for Sugars/Fiber), which shifts indices
            // and points cells[1] at the wrong content entirely.
            const cells = $(row).children("td, th");

            if (cells.length < 2) return;

            const key = $(cells[0]).text().trim().toLowerCase();
            const value = $(cells[1]).text().trim();

            if (key.includes("calorie"))
                nutrition.calories = parseValue(value);

            else if (key.includes("protein"))
                nutrition.protein = parseValue(value);

            else if (
                key.includes("carbohydrate") ||
                key.includes("carb")
            )
                nutrition.carbs = parseValue(value);

            else if (key === "fat" || key.includes("total fat"))
                nutrition.fat = parseValue(value);

            else if (key.includes("fiber"))
                nutrition.fiber = parseValue(value);

            else if (key.includes("sugar"))
                nutrition.sugar = parseValue(value);

            else if (key.includes("sodium"))
                nutrition.sodium = parseValue(value);

        });

        const sanitized = sanitize(nutrition);

        const hasData = Object.values(sanitized).some(
            value => value !== null
        );

        if (!hasData) return null;

        return {

            source: sourceUrl,

            title: pageTitle,

            extractedBy: "html-table",

            nutrition: sanitized

        };

    } catch (err) {

        console.error("HTML Table Extraction Error:", err);

        return null;

    }

};

module.exports = {

    extractNutritionFromHtmlTable

};