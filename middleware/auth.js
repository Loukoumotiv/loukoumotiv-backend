const jwt = require('jsonwebtoken');
const Team = require('../models/teamModel');

const isAuthenticated = (role) => {
    return async (req, res, next) => {
        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer')
        )
            return res.status(400).json({
                message: `Pas de crédentiels d'authentification trouvés`,
            });
        const { authorization } = req.headers;
        const token = authorization.split(' ')[1];
        if (!token) return res.status(400).json({ message: "Pas de token renseigné" });
        try {
            const credentials = jwt.verify(token, process.env.SECRET_KEY);
            if (credentials.role !== role) throw Error("Vous n'êtes pas autorisé.e à compléter cette action.");
            const exist = await Team.findById({ _id: credentials.id });
            if (!exist) throw Error("Membre introuvable");
            next();
        } catch (error) {
            res.status(500).json({ message: "Une erreur est survenue.", error: error.message })
        }
    }
}
module.exports = { isAuthenticated };