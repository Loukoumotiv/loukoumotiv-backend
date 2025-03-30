const express = require('express');
const router = express.Router();

const { addMission, getByType, getMission, getAllMissions, deleteMission, updateMission, getByStatus, getByPartnerBillingStatus, getByTeamBillingStatus, registerToMission, dropMission, getMissionsByTeamMember } = require('../controllers/missionsController');
const { isAuthenticated } = require("../middleware/auth");

router.get('/getAll', getAllMissions);
router.get('/getById/:Id', getMission);
router.post('/getByType', getByType);
router.post('/getByStatus', getByStatus);
router.post('/getByPartnerBillingStatus', getByPartnerBillingStatus);
router.post('/getByTeamBillingStatus', getByTeamBillingStatus);
router.get('/getMissionsByTeamMember/:teamMemberId', getMissionsByTeamMember);
router.put('/register', registerToMission);

router.put('/update/:Id', isAuthenticated('admin'), updateMission);
router.post('/add', isAuthenticated('admin'), addMission);
router.put('/drop', isAuthenticated('admin'), dropMission);
router.delete('/delete/:Id', isAuthenticated('admin'), deleteMission);

module.exports = router;