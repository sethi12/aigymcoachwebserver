const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 60 * 1000, // vision calls are slower than text-only, default SDK timeout is too short
  maxRetries: 2,
});

const SYSTEM_PROMPT = `You are an expert food recognition and nutrition estimation AI for a fitness coaching app.

Your ONLY task is to identify foods from an image and estimate their nutrition.

STRICT RULES:
- Return ONLY one valid JSON object. No markdown, no code fences, no commentary, no explanation.
- Detect every visible distinct food item (don't lump different foods together).
- Estimate weight in grams based on visible portion size.
- Estimate calories, protein (g), carbs (g), and fat (g) for that estimated weight.
- Use common English food names.
- If unsure of an item, use "Unknown Food" but still estimate weight/macros as best guess.

Return EXACTLY this JSON shape, nothing else:
{
  "foods": [
    {
      "name": "Chicken Breast",
      "estimatedWeight": 180,
      "calories": 297,
      "protein": 56,
      "carbs": 0,
      "fat": 6.5
    }
  ],
  "totalCalories": 297,
  "totalProtein": 56,
  "totalCarbs": 0,
  "totalFat": 6.5
}`;

const verifyImageUrlReachable = async (imageUrl) => {
  try {
    const res = await fetch(imageUrl, { method: "HEAD" });
    if (!res.ok) {
      throw new Error(`Image URL not reachable, status ${res.status}`);
    }
    const contentType = res.headers.get("content-type");
    if (contentType && !contentType.startsWith("image/")) {
      throw new Error(`URL did not return an image, got content-type: ${contentType}`);
    }
  } catch (err) {
    throw new Error(`Image URL check failed: ${err.message}`);
  }
};

const extractJson = (raw) => {
  let response = raw || "";

  // Strip fenced code blocks, just in case
  response = response.replace(/```json/gi, "").replace(/```/g, "");

  // Strip a closed <think>...</think> block if it somehow appears
  response = response.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // Unclosed <think> means reasoning truncated before the real answer — nothing usable
  if (/<think>/i.test(response) && !/<\/think>/i.test(response)) {
    return null;
  }

  response = response.trim();

  const firstBrace = response.indexOf("{");
  const lastBrace = response.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    return null;
  }

  return response.substring(firstBrace, lastBrace + 1);
};

const callGroqVision = async (imageUrl) => {
  const completion = await groq.chat.completions.create({
    model: "qwen/qwen3.6-27b",
    temperature: 0,
    max_completion_tokens: 1024,
    reasoning_effort: "none",   // skip the <think> phase entirely — this is what was eating your tokens
    reasoning_format: "hidden", // belt-and-suspenders: even if reasoning runs, don't surface it
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Identify every food item in this meal and estimate its nutrition." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  return completion.choices[0].message.content;
};

const analyzeMealImage = async (imageUrl, attempt = 1) => {
  const MAX_ATTEMPTS = 3;

  try {
    await verifyImageUrlReachable(imageUrl);

    const raw = await callGroqVision(imageUrl);

    console.log(`========== RAW GROQ RESPONSE (attempt ${attempt}) ==========`);
    console.log(raw);
    console.log("=======================================");

    const cleanJson = extractJson(raw);

    if (!cleanJson) {
      throw new Error("Groq did not return usable JSON.");
    }

    const result = JSON.parse(cleanJson);

    if (!result.foods || !Array.isArray(result.foods)) {
      throw new Error("Invalid JSON structure returned by Groq.");
    }

    if (result.totalCalories === undefined) {
      result.totalCalories = result.foods.reduce((sum, f) => sum + (f.calories || 0), 0);
      result.totalProtein = result.foods.reduce((sum, f) => sum + (f.protein || 0), 0);
      result.totalCarbs = result.foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
      result.totalFat = result.foods.reduce((sum, f) => sum + (f.fat || 0), 0);
    }

    return result;
  } catch (error) {
    console.error(`Groq Vision Error (attempt ${attempt}):`, error.message);

    if (attempt < MAX_ATTEMPTS) {
      return analyzeMealImage(imageUrl, attempt + 1);
    }

    throw error;
  }
};

module.exports = {
  analyzeMealImage,
};