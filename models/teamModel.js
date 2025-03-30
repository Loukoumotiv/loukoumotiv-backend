const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'masseur'], default: 'masseur' },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: String },
    // fullAddress: {
    //     number: { type: String },
    //     street: { type: String },
    //     ZIPcode: { type: String },
    //     city: { type: String },
    // },
    number: { type: String },
    street: { type: String },
    ZIPcode: { type: String },
    city: { type: String },
    instagram: { type: String },
    picture: { type: String },
    siret: { type: String },
    IBAN: { type: String },
    joiningDate: { type: String },
    drivingLicense: { type: Boolean },
    motorized: { type: Boolean },
    notes: { type: String }
}, { timestamps: true })

const Team = mongoose.model('team', teamSchema);

module.exports = Team; 