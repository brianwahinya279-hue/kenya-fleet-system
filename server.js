const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Serve your index.html dashboard file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Mock Database of your Lorries & Drivers in Kenya
let fleetDatabase = [
    { id: 1, regNo: 'KDA 892X', driverName: 'John Kamau', phone: '254712345678', baselineKmPerLitre: 2.5 },
    { id: 2, regNo: 'KCF 432L', driverName: 'David Omondi', phone: '254722334455', baselineKmPerLitre: 2.2 },
    { id: 3, regNo: 'KDD 105H', driverName: 'Hassan Juma', phone: '254733998877', baselineKmPerLitre: 2.8 }
];

// Endpoint to check routes and calculate fuel allowance
app.post('/api/fuel-check', async (req, res) => {
    const { regNo, distanceKm, requestedLitres, stationName } = req.body;

    const lorry = fleetDatabase.find(v => v.regNo === regNo);
    if (!lorry) {
        return res.status(404).json({ error: "Vehicle registration not found in fleet database." });
    }

    const baseFuelNeeded = distanceKm / lorry.baselineKmPerLitre;
    const allowedLimit = baseFuelNeeded * 1.10; // 10% safety buffer

    let status = (requestedLitres <= allowedLimit) ? "APPROVED" : "VARIANCE_FLAGGED";
    let message = status === "APPROVED" 
        ? `Success: Fuel request for ${lorry.regNo} at ${stationName} is within limits.`
        : `ALERT: Excess fuel requested! Allowed: ${allowedLimit.toFixed(1)}L, Requested: ${requestedLitres}L.`;

    const smsMessage = `FLEET [${status}] Lorry: ${lorry.regNo} | Driver: ${lorry.driverName} | Station: ${stationName} | Pumped: ${requestedLitres}L`;
    console.log("Live SMS Dispatch Triggered to Network for:", smsMessage);

    res.json({
        success: true,
        status,
        allowedLimit: allowedLimit.toFixed(1),
        requestedLitres,
        lorry,
        message
    });
});

app.listen(PORT, () => {
    console.log(`Kenya Fleet Server is running live on port ${PORT}`);
});