const Mission = require('../models/missionModel');

const addMission = async (req, res) => {
    const { title, description, partner, location, type, time, capacity, requiredMembers, registeredMembers, remuneration, status, teamBilling, partnerBilling, notes } = req.body;
    try {
        if (!title || !description || !partner || !location || !type || !time || !capacity || !requiredMembers || !remuneration)
            throw Error("Les champs * doivent être renseignés");

        const mission = await Mission.create({
            title,
            description,
            partner, location,
            type,
            time,
            capacity,
            requiredMembers,
            registeredMembers,
            remuneration,
            status,
            teamBilling,
            partnerBilling,
            notes
        });

        res.status(200).json({ message: "Nouvelle mission ajoutée avec succès", mission, id: mission._id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout de la mission", error: error.message });
    }
};

const getMission = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");

        const mission = await Mission.findById({ _id: Id })
            .populate({
                path: 'partner',
                model: 'partners',
                select: 'name',
            })
            .populate({
                path: 'registeredMembers',
                model: 'team',
                select: 'fullName',
            });

        if (!mission) throw Error("Erreur lors de l'affichage de la mission");

        res.status(200).json({ message: "Données de la mission récupérées avec succès", mission });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'affichage de la mission", error: error.message });
    }
};

const getAllMissions = async (_, res) => {
    try {
        const missions = await Mission.find({})
            .populate({
                path: 'partner',
                model: 'partners',
                select: 'name',
            })
            .populate({
                path: 'registeredMembers',
                model: 'team',
                select: 'fullName',
            });

        res.status(200).json({ message: 'Données des missions récupérées avec succès', missions });
    } catch (error) {
        res.status(500).json({ message: `Erreur lors de l'affichage des données des missions`, error: error.message });
    }
};

const deleteMission = async (req, res) => {
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");
        const result = await Mission.findByIdAndDelete({ _id: Id });
        if (!result) throw Error("Erreur lors de la suppression de la mission");
        const missions = await Mission.find({});
        res.status(200).json({ message: "Mission supprimée avec succès", missions, Id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la mission", error: error.message })
    }
}

const updateMission = async (req, res) => {
    const { title, description, partner, location, type, time, capacity, requiredMembers, remuneration, status, teamBilling, partnerBilling, notes } = req.body;
    const { Id } = req.params;
    try {
        if (!Id) throw Error("Pas d'id renseigné");

        if (!title || !description || !partner || !location || !type || !time || !capacity || !requiredMembers || !remuneration)
            throw Error("Les champs * doivent être renseignés");

        const result = await Mission.findByIdAndUpdate({ _id: Id }, {
            title,
            description,
            partner,
            location,
            type,
            time,
            capacity,
            requiredMembers,
            remuneration,
            status,
            teamBilling,
            partnerBilling,
            notes
        });
        if (!result) throw Error("Erreur lors de la mise à jour de la mission");

        const mission = await getMissionById(Id);
        res.status(200).json({ message: "Mission mise à jour avec succès", mission, Id });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la mission", error: error.message });
    }
};

const getByType = async (req, res) => {
    const { type } = req.body;
    try {
        if (!type) throw Error("Pas de type renseigné");
        const missions = await Mission.find({ type });
        if (!missions || missions.length === 0) {
            const allTypes = await Mission.distinct("type");
            if (!allTypes.includes(type)) {
                throw Error(`Le type "${type}" n'existe pas`);
            }
            throw Error(`Aucune mission trouvée avec le type "${type}"`);
        }
        res.status(200).json({
            message: `Données des missions "${type}" récupérées avec succès`,
            missions
        });
    } catch (error) {
        res.status(404).json({
            message: `Erreur : ${error.message}`,
            error: error.message
        });
    }
};

const getByStatus = async (req, res) => {
    const { status } = req.body;
    try {
        if (!status) throw Error("Pas de statut renseigné");
        const missions = await Mission.find({ status });
        if (!missions || missions.length === 0) {
            const allStatus = await Mission.distinct("status");
            if (!allStatus.includes(status)) {
                throw Error(`Aucune mission trouvée avec le statut "${status}"`);
            }
        }
        res.status(200).json({
            message: `Données des missions "${status}" récupérées avec succès`,
            missions
        });
    } catch (error) {
        res.status(404).json({
            message: `Erreur : ${error.message}`,
            error: error.message
        });
    }
};

const getByPartnerBillingStatus = async (req, res) => {
    const { partnerBilling } = req.body;
    try {
        if (!partnerBilling) throw Error("Pas de statut de facturation partenaire renseigné");
        const missions = await Mission.find({ partnerBilling });
        if (!missions || missions.length === 0) {
            const allPartnerBillings = await Mission.distinct("partnerBilling");
            if (!allPartnerBillings.includes(partnerBilling)) {
                throw Error(`Aucune facturation partenaire trouvée avec le statut "${partnerBilling}"`);
            }
        }
        res.status(200).json({
            message: `Données des facturations partenaires "${partnerBilling}" récupérées avec succès`,
            missions
        });
    } catch (error) {
        res.status(404).json({
            message: `Erreur : ${error.message}`,
            error: error.message
        });
    }
};

const getByTeamBillingStatus = async (req, res) => {
    const { teamBilling } = req.body;
    try {
        if (!teamBilling) throw Error("Pas de statut de facturation masseur renseigné");
        const missions = await Mission.find({ teamBilling });
        if (!missions || missions.length === 0) {
            const allTeamBillings = await Mission.distinct("teamBilling");
            if (!allTeamBillings.includes(teamBilling)) {
                throw Error(`Aucune facturation masseur trouvée avec le statut "${teamBilling}"`);
            }
        }
        res.status(200).json({
            message: `Données des facturations masseurs "${teamBilling}" récupérées avec succès`,
            missions
        });
    } catch (error) {
        res.status(404).json({
            message: `Erreur : ${error.message}`,
            error: error.message
        });
    }
};

const registerToMission = async (req, res) => {

    const { missionId, teamMemberId } = req.body;
    try {
        if (!missionId || !teamMemberId) throw Error("Pas d'ID de mission ou d'ID de membre d'équipe renseigné");
        const mission = await Mission.findById({ _id: missionId });
        if (!mission) throw Error("Mission introuvable");
        if (mission.registeredMembers.includes(teamMemberId)) {
            throw Error("Le membre d'équipe est déjà inscrit à cette mission");
        }
        if (mission.registeredMembers.length >= mission.requiredMembers) {
            throw Error("La mission a atteint le nombre maximum de masseurs requis");
        }

        mission.registeredMembers.push(teamMemberId);

        await mission.save();
        const updatedMission = await getMissionById(missionId);
        res.status(200).json({
            message: `Membre d'équipe inscrit avec succès à la mission "${mission.title}"`,
            mission: updatedMission,
            missionId
        });
    } catch (error) {
        res.status(500).json({
            message: `Erreur lors de l'inscription du membre d'équipe à la mission`,
            error: error.message
        });
    }
};

const dropMission = async (req, res) => {
    const { missionId, teamMemberId } = req.body;
    try {
        if (!missionId || !teamMemberId) throw Error("Pas d'ID de mission ou d'ID de membre d'équipe renseigné");
        const mission = await Mission.findById({ _id: missionId });
        if (!mission) throw Error("Mission introuvable");
        if (!mission.registeredMembers.includes(teamMemberId)) {
            throw Error("Le membre d'équipe n'est pas inscrit à cette mission");
        }

        mission.registeredMembers = mission.registeredMembers.filter(memberId => memberId != teamMemberId);
        await mission.save();
        const updatedMission = await getMissionById(missionId);
        res.status(200).json({
            message: `Membre d'équipe retiré avec succès de la mission "${mission.title}"`,
            mission: updatedMission,
            missionId
        });
    } catch (error) {
        res.status(500).json({
            message: `Erreur lors du retrait du membre d'équipe de la mission`,
            error: error.message
        });
    }
};

const getMissionsByTeamMember = async (req, res) => {
    const { teamMemberId } = req.params;
    try {
        if (!teamMemberId) throw Error("Pas d'ID de membre d'équipe renseigné");

        const missions = await Mission.find({ registeredMembers: teamMemberId })
        .populate({
            path: 'partner',
            model: 'partners',
            select: 'name',
        })
        res.status(200).json({
            message: `Données des missions où le membre d'équipe est inscrit récupérées avec succès`,
            missions
        });
    } catch (error) {
        res.status(500).json({
            message: `Erreur lors de la récupération des missions du membre d'équipe`,
            error: error.message
        });
    }
};

const getMissionById = async (Id) => {
    try {
        const mission = await Mission.findById({ _id: Id });
        return mission;
    } catch (error) {
        return error;
    }
}

module.exports = { addMission, getByType, getMission, getAllMissions, deleteMission, updateMission, getByStatus, getByPartnerBillingStatus, getByTeamBillingStatus, registerToMission, dropMission, getMissionsByTeamMember };