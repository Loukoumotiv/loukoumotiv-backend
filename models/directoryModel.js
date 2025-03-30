const mongoose = require('mongoose');

const directorySchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    position: { type: String, required: true },
    companyName: { type: String },
    notes: { type: String },
}, { timestamps: true })

const Directory = mongoose.model('directory', directorySchema);

module.exports = Directory; 