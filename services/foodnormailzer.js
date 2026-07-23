// services/foodNormalizer.js

const REMOVE_WORDS = [
  "raw",
  "boiled",
  "grilled",
  "fried",
  "roasted",
  "steamed",
  "baked",
  "cooked",
  "fresh",
  "skinless",
  "boneless",

  // USDA descriptors
  "commercial",
  "regular",
  "pack",
  "drained",
  "solids",
  "pasteurized",
  "frozen",
  "unheated",
  "heated",
  "canned",
  "prepared",
  "ready",
  "readytoeat",
  "salt",
  "added",
  "with",
  "without",
  "dry",
  "whole",
  "frozen",
  "unsalted",
  "salted",
  "low",
  "reduced"
];

const SINGULAR_MAP = {
  eggs: "egg",
  tomatoes: "tomato",
  potatoes: "potato",
  cherries: "cherry",
  strawberries: "strawberry",
  blueberries: "blueberry",
  raspberries: "raspberry",
  peppers: "pepper",
  onions: "onion",
  carrots: "carrot",
  apples: "apple",
  bananas: "banana",
  grapes: "grape",
  mushrooms: "mushroom",

  beans: "bean",
  almonds: "almond",
  walnuts: "walnut",
  cashews: "cashew",
  pistachios: "pistachio",
  peanuts: "peanut"
};

const normalizeFoodName = (name = "") => {
  let normalized = name.toLowerCase();

  // Remove punctuation
  normalized = normalized.replace(/[(),./-]/g, " ");

  // Remove multiple spaces
  normalized = normalized.replace(/\s+/g, " ").trim();

  // Split into words
  let words = normalized.split(" ");

  // Remove unwanted words
  words = words.filter(word => !REMOVE_WORDS.includes(word));

  // Convert plurals
  words = words.map(word => SINGULAR_MAP[word] || word);

  // Remove duplicates
  words = [...new Set(words)];

  return words.join(" ").trim();
};

module.exports = {
  normalizeFoodName,
};