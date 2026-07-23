const round = (value, decimals = 1) => {

    if (value === null || value === undefined)
        return null;

    return Number(value.toFixed(decimals));

};

const calculateAverage = (values) => {

    const valid = values.filter(v => v !== null);

    if (!valid.length)
        return null;

    return valid.reduce((a, b) => a + b, 0) / valid.length;

};

const buildConsensus = (results) => {

    if (!results.length)
        return null;

    // Ignore weak extractions
    const filtered = results.filter(result => {

        const count = Object.values(result.nutrition)
            .filter(v => v !== null).length;

        return count >= 3;

    });

    if (!filtered.length)
        return null;

    const nutrition = {

        calories: round(
            calculateAverage(
                filtered.map(r => r.nutrition.calories)
            )
        ),

        protein: round(
            calculateAverage(
                filtered.map(r => r.nutrition.protein)
            )
        ),

        carbs: round(
            calculateAverage(
                filtered.map(r => r.nutrition.carbs)
            )
        ),

        fat: round(
            calculateAverage(
                filtered.map(r => r.nutrition.fat)
            )
        ),

        fiber: round(
            calculateAverage(
                filtered.map(r => r.nutrition.fiber)
            )
        ),

        sugar: round(
            calculateAverage(
                filtered.map(r => r.nutrition.sugar)
            )
        ),

        sodium: round(
            calculateAverage(
                filtered.map(r => r.nutrition.sodium)
            )
        )

    };

    return {

        nutrition,

        confidence: Math.min(
            100,
            80 + filtered.length * 5
        ),

        sources: filtered.map(r => ({

            title: r.title,

            url: r.source,

            extractedBy: r.extractedBy

        }))

    };

};

module.exports = {

    buildConsensus

};