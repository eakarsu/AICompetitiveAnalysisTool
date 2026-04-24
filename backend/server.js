require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', require('./routes/index'));
app.use('/api/compliance-agents', require('./routes/complianceAgents'));

const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => console.log(`AI Competitive Analysis Backend running on port ${PORT}`));
