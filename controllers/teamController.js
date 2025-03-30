const Team = require('../models/teamModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } = require('firebase/auth');
const { FileUpload } = require("../middleware/imageUploader");

const generateToken = (id, role) => {
    const token = jwt.sign({ id, role }, process.env.SECRET_KEY, { expiresIn: '1d' });
    return token;
}

const addTeamMember = async (req, res) => {
    const { fullName, role, phoneNumber, email, password, notes } = req.body;
    try {
        if (!fullName || !role || !phoneNumber || !email || !password)
            throw Error("Les champs * doivent être renseignés");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw Error("Format d'email invalide");
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw Error("Mot de passe faible. Inclure au moins une majuscule, une minuscule, un chiffre et un symbole.");
        }

        const existEmail = await Team.findOne({ email });
        if (existEmail) throw Error("Email déjà lié à un autre compte");

        const existNumber = await Team.findOne({ phoneNumber });
        if (existNumber) throw Error("Numéro de téléphone déjà lié à un autre compte");

        if (!fullName || !role || !email || !phoneNumber || !password) {
            throw Error("Les champs * doivent être renseignés");
        }

        const auth = getAuth();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const teamMember = await Team.create({
            fullName,
            role,
            phoneNumber,
            email,
            password: hashedPassword,
            notes
        });

        const firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
        teamMember.firebaseUid = firebaseUser.user.uid;
        await teamMember.save();
        await sendEmailVerification(auth.currentUser);

        const token = generateToken(teamMember._id, role);
        res.status(200).json({ message: "Nouveau membre ajouté avec succès", teamMember });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du nouveau membre", error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    // console.log(req.body);
    const ERROR_MESSAGES = {
        MISSING_CREDENTIALS: "Renseignez email et mot de passe",
        ACCOUNT_NOT_FOUND: "Pas de compte relié à cet email",
        INCORRECT_PASSWORD: "Mot de passe incorrect",
        UNVERIFIED_EMAIL: "Vérifiez votre email pour pouvoir vous connecter; le mail peut être dans vos spams, n'hésitez pas à contacter un admin au besoin",
        CONNECTION_ERROR: "Erreur de connexion. Veuillez réessayer.",
    };
    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.MISSING_CREDENTIALS,
            });
        }

        const exist = await Team.findOne({ email });
        if (!exist) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
            });
        }

        // console.log(exist.password);
        const comparing = await bcrypt.compare(password, exist.password);
        // console.log(comparing);
        if (!comparing) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.INCORRECT_PASSWORD,
            });
        }
        // console.log(password);
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.UNVERIFIED_EMAIL,
            });
        }

        const token = generateToken(exist._id, exist.role);
        return res.status(200).json({ success: true, message: "Connexion réussie ! Redirection vers l'espace missions", token, id: exist._id, role: exist.role });
    } catch (error) {
        const errorMessage = ERROR_MESSAGES.CONNECTION_ERROR;
        return res.status(500).json({ success: false, message: error.message || errorMessage });
    }
};

const getTeamMember = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'Id renseigné");
        const teamMember = await Team.findById({ _id: Id });
        if (!teamMember) throw Error("Erreur lors de l'affichage du membre");
        res.status(200).json({ message: "Données du membre récupérées avec succès", teamMember });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'affichage du membre", error: error.message });
    }
}

const getAllMembers = async (_, res) => {
    try {
        const teamMembers = await Team.find({});
        res.status(200).json({ message: "Données de l'équipe récupérées avec succès", teamMembers });
    } catch (error) {
        res.status(500).json({ message: `Erreur lors de l'affichage des données de l'équipe`, error: error.message })
    }
}

const deleteTeamMember = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");
        const result = await Team.findByIdAndDelete({ _id: Id });
        if (!result) throw Error("Erreur lors de la suppression du membre");
        const teamMembers = await Team.find({});
        res.status(200).json({ message: "Membre supprimé avec succès", teamMembers, Id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du membre", error: error.message })
    }
}

const updateTeamMember = async (req, res) => {
    const file = req.file;
    let picture;

    const { fullName, phoneNumber, email, password, role, dateOfBirth, ZIPcode, street, number, city, instagram, siret, IBAN, joiningDate, drivingLicense, motorized, notes } = req.body;
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");

        if (file) {
            const imageUploadResult = await FileUpload(file);
            picture = imageUploadResult.downloadURL;
        }

        // if (fullName === "" || role === "" || email === "" || phoneNumber === "" || password === "") {
        // if (!fullName || !role || !email || !phoneNumber || !password) {
        //     throw Error("Les champs * doivent être renseignés");
        // }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            throw Error("Format d'email invalide");
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw Error("Mot de passe faible. Inclure au moins une majuscule, une minuscule, un chiffre et un symbole.");
        }

        const MemberToUpdate = await Team.findById(Id);
        if (MemberToUpdate.email !== email) {
            const existingEmailMember = await Team.findOne({ email });
            if (existingEmailMember && existingEmailMember._id != Id) {
                throw Error("L'email est déjà lié à un autre compte");
            }
        }
        if (MemberToUpdate.phoneNumber !== phoneNumber) {
            const existingPhoneMember = await Team.findOne({ phoneNumber });
            if (existingPhoneMember && existingPhoneMember._id != Id) {
                throw Error("Le numéro de téléphone est déjà lié à un autre compte");
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (password) {
            const result = await Team.findByIdAndUpdate({ _id: Id }, {
                fullName,
                phoneNumber,
                email,
                password: hashedPassword,
                dateOfBirth,
                role,
                // fullAddress: {
                //     city,
                //     number,
                //     street,
                //     ZIPcode
                // },
                number,
                street,
                ZIPcode,
                city,
                instagram,
                picture,
                siret,
                IBAN,
                joiningDate,
                drivingLicense,
                motorized,
                notes
            });
            if (!result) throw Error("Erreur lors de la mise à jour du membre");
        } else{
            const result = await Team.findByIdAndUpdate({ _id: Id }, {
                fullName,
                phoneNumber,
                email,
                dateOfBirth,
                role,
                // fullAddress: {
                //     city,
                //     number,
                //     street,
                //     ZIPcode
                // },
                number,
                street,
                ZIPcode,
                city,
                instagram,
                picture,
                siret,
                IBAN,
                joiningDate,
                drivingLicense,
                motorized,
                notes
            });
            if (!result) throw Error("Erreur lors de la mise à jour du membre");
        }

        const teamMember = await getMemberById(Id);
        res.status(200).json({ message: "Membre mis à jour avec succès", teamMember, Id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du membre", error: error.message });
    }
};

const getByRole = async (req, res) => {
    const { role } = req.body;
    try {
        if (!role) throw Error("Pas de rôle renseigné");
        const teamMembers = await Team.find({ role });
        if (!teamMembers || teamMembers.length === 0) {
            const allRoles = await Team.distinct("role");
            if (!allRoles.includes(role)) {
                throw Error(`Le rôle "${role}" n'existe pas`);
            }
            throw Error(`Aucun membre trouvé avec le rôle "${role}"`);
        }
        res.status(200).json({
            message: `Données des membres "${role}" récupérées avec succès`,
            teamMembers
        });
    } catch (error) {
        res.status(404).json({
            message: `Erreur : ${error.message}`,
            error: error.message
        });
    }
};

const switchToMasseur = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");
        const currentMember = await getMemberById(Id);
        if (currentMember.role === 'masseur') throw Error("Ce membre est déjà uniquement masseur");
        const result = await Team.findByIdAndUpdate({ _id: Id }, { role: 'masseur' });
        if (!result) throw Error("Erreur lors du passage d'admin à masseur");
        const teamMember = await getMemberById(Id);
        res.status(200).json({ message: "Membre passé simple masseur avec succès", teamMember, Id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du passage d'admin à masseur", error: error.message });
    }
};

const switchToAdmin = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");
        const currentMember = await getMemberById(Id);
        if (currentMember.role === 'admin') throw Error("Ce membre est déjà admin");
        const result = await Team.findByIdAndUpdate({ _id: Id }, { role: 'admin' });
        if (!result) throw Error("Erreur lors du passage de masseur à admin");
        const teamMember = await getMemberById(Id);
        res.status(200).json({ message: "Membre passé admin avec succès", teamMember, Id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du passage de masseur à admin", error: error.message });
    }
};

const getMemberById = async (Id) => {
    try {
        const teamMember = await Team.findById({ _id: Id });
        return teamMember;
    } catch (error) {
        return error;
    }
}

module.exports = { addTeamMember, getByRole, login, getTeamMember, getAllMembers, deleteTeamMember, updateTeamMember, switchToMasseur, switchToAdmin };