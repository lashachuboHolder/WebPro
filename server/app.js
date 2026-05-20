const express = require('express');
const cors = require('cors');

const authRoutes     = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const donationRoutes = require('./routes/donations');
const adminRoutes    = require('./routes/admin');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.use('/api/auth',      authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api',           donationRoutes);
app.use('/api/admin',     adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
