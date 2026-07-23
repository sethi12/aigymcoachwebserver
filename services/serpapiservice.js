const axios = require("axios");

const SERPAPI_KEY = process.env.SERPAPI_KEY;

const TRUSTED_DOMAINS = [
    "fdc.nal.usda.gov",
    "myfooddata.com",
    "eatthismuch.com",
    "nutritionvalue.org",
    "nutritionix.com",
    "fatsecret.com"
];

const searchFood = async (foodName) => {

    try {

        const response = await axios.get(
            "https://serpapi.com/search.json",
            {
                params: {
                    engine: "google",
                    q: `${foodName} nutrition per 100g`,
                    api_key: SERPAPI_KEY,
                    num: 10
                }
            }
        );

        const results = response.data.organic_results || [];

        // Rank trusted domains first
        const rankedResults = results.sort((a, b) => {

            const aTrusted = TRUSTED_DOMAINS.some(domain => {
                try {
                    return new URL(a.link).hostname.includes(domain);
                } catch {
                    return false;
                }
            });

            const bTrusted = TRUSTED_DOMAINS.some(domain => {
                try {
                    return new URL(b.link).hostname.includes(domain);
                } catch {
                    return false;
                }
            });

            return Number(bTrusted) - Number(aTrusted);

        });

        return rankedResults.map(result => ({

            title: result.title,

            url: result.link,

            snippet: result.snippet || ""

        }));

    } catch (err) {

        console.error(
            "SerpAPI Error:",
            err.response?.data || err.message
        );

        return [];

    }

};

module.exports = {

    searchFood

};