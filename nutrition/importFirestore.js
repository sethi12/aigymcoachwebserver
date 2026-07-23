require("dotenv").config();
const fs = require("fs");
const path = require("path");

const { db, admin } = require("../config/firebase");

// ----------------------------
// Read cleanFoods.json
// ----------------------------
console.log(process.env.FIREBASE_SERVICE_ACCOUNT);
const foods = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "cleanFoods.json"),
        "utf8"
    )
);

// ----------------------------
// Upload Foods
// ----------------------------

async function uploadFoods() {

    const collection = db.collection("nutrition");

    const BATCH_SIZE = 500;

    let batch = db.batch();
    let operationCount = 0;
    let totalUploaded = 0;

    console.log(`Starting upload of ${foods.length} foods...\n`);

    for (const food of foods) {

        const docRef = collection.doc(food.id);

        batch.set(docRef, {
            ...food,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        operationCount++;

        if (operationCount === BATCH_SIZE) {

            await batch.commit();

            totalUploaded += operationCount;

            console.log(`✅ Uploaded ${totalUploaded} foods`);

            batch = db.batch();
            operationCount = 0;
        }
    }

    // Commit remaining documents
    if (operationCount > 0) {

        await batch.commit();

        totalUploaded += operationCount;
    }

    console.log("\n==================================");
    console.log("🎉 Upload Completed Successfully");
    console.log("==================================");
    console.log(`Total Foods Uploaded: ${totalUploaded}`);
}

uploadFoods()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Upload Failed");
        console.error(err);
        process.exit(1);
    });