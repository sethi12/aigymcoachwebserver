const { searchFood } = require("./serpapiservice");
const { fetchPage } = require("./pageFetcherService");
const { extractNutritionFromJsonLd } = require("./jsonLdExtractorService");
const {
    extractNutritionFromHtmlTable
} = require("./htmlTableExtractorService");
const researchNutrition = async (foodName) => {

    const searchResults = await searchFood(foodName);

    if (!searchResults.length) {
        return [];
    }

    const topResults = searchResults.slice(0, 5);

    const extractedResults = await Promise.all(

        topResults.map(async (result) => {

            try {

                console.log(`Searching: ${result.title}`);

                const html = await fetchPage(result.url);

                if (!html) return null;

                let nutrition =
    extractNutritionFromJsonLd(
        html,
        result.url,
        result.title
    );

if (nutrition) {

    console.log(`✅ JSON-LD -> ${result.title}`);

    return nutrition;

}

nutrition =
    extractNutritionFromHtmlTable(
        html,
        result.url,
        result.title
    );

if (nutrition) {

    console.log(`✅ HTML Table -> ${result.title}`);

    return nutrition;

}

console.log(`❌ No Structured Nutrition -> ${result.title}`);

return null;

            } catch (err) {

                console.log(`Failed -> ${result.title}`);

                return null;

            }

        })

    );

    return extractedResults.filter(Boolean);

};

module.exports = {

    researchNutrition

};