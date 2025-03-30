const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: "partners", required: true },
    location: {
        place: { type: String, required: true },
        number: { type: String, required: true },
        street: { type: String, required: true },
        ZIPcode: { type: String, required: true },
        city: { type: String, required: true },
    },
    type: { type: String, required: true, enum: ['event', 'corporate', 'social'] },
    time: {
        date: { type: String, required: true },
        hours: { type: [String], required: true },
    },
    capacity: { type: String, required: true },
    requiredMembers: { type: Number, required: true },
    registeredMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "team" }],
    remuneration: { type: String, required: true },
    status: { type: String, enum: ['done', 'to do', 'cancelled'], default: 'to do' },
    teamBilling: { type: String, enum: ['done', 'in progress', 'to do'], default: 'to do' },
    partnerBilling: { type: String, enum: ['done', 'in progress', 'to do'], default: 'to do' },
    notes: { type: String },
}, { timestamps: true })

const Mission = mongoose.model('missions', missionSchema);

module.exports = Mission; 