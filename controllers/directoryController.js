const Directory = require('../models/directoryModel');

const addContact = async (req, res) => {
    const { fullName, email, phoneNumber, position, companyName, notes } = req.body;
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!fullName || !email || !phoneNumber || !position)
            throw Error("Les champs * doivent être renseignés");


        if (!emailRegex.test(email)) {
            throw Error("Format d'email invalide");
        }
        const existEmail = await Directory.findOne({ email });
        if (existEmail) throw Error("Email déjà lié à un autre contact du répertoire");
        const existNumber = await Directory.findOne({ phoneNumber });
        if (existNumber) throw Error("Numéro de téléphone déjà lié à un autre contact du répertoire");

        const contact = await Directory.create({
            fullName,
            email,
            phoneNumber,
            position,
            companyName,
            notes
        })
        res.status(200).json({ message: `Nouveau contact ajouté au répertoire avec succès`, contact })
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de votre ajout au répertoire", error: error.message });
    }
}

const getAllContacts = async (_, res) => {
    try {
        const contacts = await Directory.find({});
        res.status(200).json({ message: "Données du répertoire récupérées avec succès", contacts });
    } catch (error) {
        res.status(500).json({ message: `Erreur lors de l'affichage du répertoire`, error: error.message })
    }
}

const getContact = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");
        const contact = await Directory.findById({ _id: Id });
        if (!contact) throw Error("Erreur lors de l'affichage du contact");
        res.status(200).json({ message: "Données du contact récupérées avec succès", contact });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'affichage du membre", error: error.message });
    }
}

const deleteContact = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");
        const result = await Directory.findByIdAndDelete({ _id: Id });
        if (!result) throw Error("Erreur lors de la suppression du membre");
        const contacts = await Directory.find({});
        res.status(200).json({ message: "Contact supprimé du répertoire avec succès", contact, Id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du contact", error: error.message })
    }
}

const updateContact = async (req, res) => {
    const { fullName, email, phoneNumber, position, companyName, notes } = req.body;
    const { Id } = req.params;
    try {
        if (!Id) {
            throw Error("Pas d'id renseigné");
        }

        if (!fullName || !email || !phoneNumber || !position) {
            throw Error("Les champs * doivent être renseignés");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            throw Error("Format d'email invalide");
        }

        const ContactToUpdate = await Directory.findById(Id); 
        if(ContactToUpdate.email !== email){
            const existingEmailContact = await Directory.findOne({ email });
            if (existingEmailContact && existingEmailContact._id !== Id) {
                throw Error("L'email est déjà lié à un autre contact du répertoire");
            }
        }
        if(ContactToUpdate.phoneNumber !== phoneNumber){
            const existingPhoneContact = await Directory.findOne({ phoneNumber });
            if (existingPhoneContact && existingPhoneContact._id !== Id) {
                throw Error("Le numéro de téléphone est déjà lié à un autre contact du répertoire");
            }
        }
        
        const result = await Directory.findByIdAndUpdate(Id, {
            fullName,
            email,
            phoneNumber,
            position,
            companyName,
            notes
        });

        if (!result) {
            throw Error("Erreur lors de la mise à jour du contact");
        }

        const contact = await getContactById(Id);
        res.status(200).json({ message: "Contact mis à jour avec succès", contact, Id });
    } catch (error) {
        res.status(500).json({ message: `Erreur lors de la mise à jour du contact: ${error.message}` });
    }
};

const getContactById = async (Id) => {
    try {
        const contact = await Directory.findById({ _id: Id });
        return contact;
    } catch (error) {
        return error;
    }
}

module.exports = { addContact, getAllContacts, getContact, deleteContact, updateContact }; 