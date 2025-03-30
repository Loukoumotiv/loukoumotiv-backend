const Newsletter = require('../models/newsletterModel');

const subscribe = async (req, res) => {
    const { email } = req.body;
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw Error("Format d'email invalide");
        }

        const existEmail = await Newsletter.findOne({ email });
        if (existEmail) throw Error("Email déjà inscrit à la newsletter");
        const subscribed = await Newsletter.create({
            email
        })
        res.status(200).json({ message: `${email} inscrit à la newsletter avec succès`, subscribed })
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de votre inscription à la newsletter", error: error.message });
    }
}

const getAllSubscribed = async (_, res) => {
    try {
        const subscribed = await Newsletter.find({});
        res.status(200).json({ message: "Liste des inscrits à la newsletter récupérée avec succès", subscribed });
    } catch (error) {
        res.status(500).json({ message: `Une erreur est survenue en récupérant la liste des inscrits à la newsletter`, error: error.message })
    }
}

const getSubscriber = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");
        const subscriber = await Newsletter.findById({ _id: Id });
        if (!subscriber) throw Error("Erreur lors de l'affichage de l'inscrit à la newsletter");
        res.status(200).json({ message: "Mail de l'inscrit à la newsletter récupéré avec succès", subscriber });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'affichage du partenaire", error: error.message });
    }
}

const unsubscribe = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");
        const unsubscribingEmail = await Newsletter.findById(Id);
        if (!unsubscribingEmail) throw Error("Email introuvable");
        const result = await Newsletter.findByIdAndDelete(Id);
        if (!result) throw Error("Une erreur est survenue");
        res.status(200).json({ message: `${unsubscribingEmail.email} désinscrit avec succès`, Id });
    } catch (error) {
        res.status(500).json({ message: "Une erreur est survenue en désinscrivant cet email de la newsletter", error: error.message })
    }
}

module.exports = { subscribe, getAllSubscribed, getSubscriber, unsubscribe }; 