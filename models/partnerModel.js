const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['event', 'corporate', 'social'] },
    location: {
        place: { type: String, required: true },
        number: { type: String, required: true },
        street: { type: String, required: true },
        ZIPcode: { type: String, required: true },
        city: { type: String, required: true },
    },
    website: { type: String, required: true },
    referenceContact: {
        name: { type: String, required: true },
        number: { type: String, required: true },
        email: { type: String, required: true },
        position: { type: String },
    },
    notes: { type: String}
}, { timestamps: true })

const Partner = mongoose.model('partners', partnerSchema);

module.exports = Partner; 