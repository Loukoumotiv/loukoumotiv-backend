const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { addTeamMember, getByRole, login, getTeamMember, getAllMembers, deleteTeamMember, updateTeamMember, switchToMasseur, switchToAdmin } = require('../controllers/teamController');
const { isAuthenticated } = require("../middleware/auth");

router.post('/login', login);
router.get('/getById/:Id', getTeamMember);
router.get('/getAll', getAllMembers);
router.post('/getByRole', getByRole);
router.put('/update/:Id', upload.single('file'), updateTeamMember);

router.post('/add', isAuthenticated('admin'), addTeamMember);
router.delete('/delete/:Id', isAuthenticated('admin'), deleteTeamMember);
router.put('/switchToMasseur/:Id', isAuthenticated('admin'), switchToMasseur);
router.put('/switchToAdmin/:Id', isAuthenticated('admin'), switchToAdmin);

module.exports = router;