require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { checkConnection } = require('./config/database');

const { initializeApp } = require('firebase/app');
const firebaseConfig = require('./config/firebase');
initializeApp(firebaseConfig);

const app = express();
const PORT = process.env.PORT || 8000;

const teamRoutes = require('./routes/teamRoutes');
const missionsRoutes = require('./routes/missionsRoutes');
const partnersRoutes = require('./routes/partnersRoutes');
const directoryRoutes = require('./routes/directoryRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: 'GET,PUT,POST,DELETE',
  credentials: true,
}));
app.use(express.json());

app.use('/team', teamRoutes);
app.use('/missions', missionsRoutes);
app.use('/partners', partnersRoutes);
app.use('/directory', directoryRoutes);
app.use('/newsletter', newsletterRoutes);

app.listen(PORT, () => {
  checkConnection();
  console.log(`Server is running on port ${process.env.PORT}`)
})