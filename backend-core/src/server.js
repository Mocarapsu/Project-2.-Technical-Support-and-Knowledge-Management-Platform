const express = require('express');
const app = express();
app.use(express.json());
app.get('/api/v1/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.listen(4000, () => console.log('Backend Core listening on port 4000'));
