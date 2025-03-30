const Partner = require('../models/partnerModel');

const addPartner = async (req, res) => {
    const { name, type, location, website, referenceContact, notes } = req.body;
    try {
        if (!name || !type || !location || !website || !referenceContact)
            throw Error("Les champs * doivent être renseignés");
            
        // for the reference contact ? 
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (!emailRegex.test(email)) {
        //     throw Error("Format d'email invalide");
        // }

        const partner = await Partner.create({
            name,
            type,
            location,
            website,
            referenceContact,
            notes
        });

        res.status(200).json({ message: "Nouveau partenaire ajouté avec succès", partner, id: partner._id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du nouveau partenaire", error: error.message });
    }
};

const getPartner = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");
        const partner = await Partner.findById({ _id: Id });
        if (!partner) throw Error("Erreur lors de l'affichage du partenaire");
        res.status(200).json({ message: "Données du partenaire récupérées avec succès", partner });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'affichage du partenaire", error: error.message });
    }
}

const getAllPartners = async (_, res) => {
    try {
        const partners = await Partner.find({});
        res.status(200).json({ message: "Données des partenaires récupérées avec succès", partners });
    } catch (error) {
        res.status(500).json({ message: `Erreur lors de l'affichage des données des partenaires`, error: error.message })
    }
}

const deletePartner = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");
        const result = await Partner.findByIdAndDelete({ _id: Id });
        if (!result) throw Error("Erreur lors de la suppression du partenaire");
        const partners = await Partner.find({});
        res.status(200).json({ message: "Partnaire supprimé avec succès", partners, Id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du partenaire", error: error.message })
    }
}

const updatePartner = async (req, res) => {
    const { name, type, location, website, referenceContact, notes } = req.body;
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");

        // for the reference contact ?
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (email && !emailRegex.test(email)) {
        //     throw Error("Format d'email invalide");
        // }

        if (!name || !type || !location || !website || !referenceContact) {
            throw Error("Les champs * doivent être renseignés");
        }

        const result = await Partner.findByIdAndUpdate({ _id: Id }, {
            name,
            type,
            location,
            website,
            referenceContact,
            notes
        });
        if (!result) throw Error("Erreur lors de la mise à jour du membre");

        const partner = await getPartnerById(Id);
        res.status(200).json({ message: "Membre mis à jour avec succès", partner, Id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du membre", error: error.message });
    }
};

const getByType = async (req, res) => {
    const { type } = req.body;
    try {
        if (!type) throw Error("Pas de type renseigné");
        const partners = await Partner.find({ type });
        if (!partners || partners.length === 0) {
            const allTypes = await Partner.distinct("type");
            if (!allTypes.includes(type)) {
                throw Error(`Le type "${type}" n'existe pas`);
            }
            throw Error(`Aucun partenaire trouvé avec le type "${type}"`);
        }
        res.status(200).json({
            message: `Données des partenaires "${type}" récupérées avec succès`,
            partners
        });
    } catch (error) {
        res.status(404).json({
            message: `Erreur : ${error.message}`,
            error: error.message
        });
    }
};

const getPartnerById = async (Id) => {
    try {
        const partner = await Partner.findById({ _id: Id });
        return partner;
    } catch (error) {
        return error;
    }
}

module.exports = { addPartner, getByType, getPartner, getAllPartners, deletePartner, updatePartner };