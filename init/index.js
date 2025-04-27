const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");

        await initDB(); // Ensure seeding happens only after a successful connection
    } catch (err) {
        console.error("Database Connection Error:", err);
    } finally {
        mongoose.connection.close(); // Close the connection after operation
    }
}

const initDB = async () => {
    // try {
    //     const count = await Listing.countDocuments();
    //     if (count > 0) {
    //         console.log("Database already has data. Skipping seeding.");
    //         return;
    //     }
        await Listing.deleteMany({});
        initData.data = initData.data.map((obj)=> ({...obj, owner: "67f3ea309a86b98566069bf1"}))
        await Listing.insertMany(initData.data);
        // console.log(" Database initialized with sample listings.");
        console.log(" Data was initialized.");
    // } catch (err) {
    //     console.error("Error initializing database:", err);
    // }
};

main();
initDB();
