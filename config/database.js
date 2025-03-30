const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL;

async function checkConnection() {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log('Connected to database successfully');
    } catch (error) {
        console.log("Failed to connect", error);
    }
}

module.exports = { checkConnection };