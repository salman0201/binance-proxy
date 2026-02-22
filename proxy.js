export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Only POST allowed' });
  }

  try {
    // Read the API Key and Secret sent from Dhru Fusion
    const apiKey = req.body.apiKey;
    const secret = req.body.secret;

    if (!apiKey || !secret) {
      return res.status(400).json({ success: false, message: 'Missing API credentials' });
    }

    // Generate Binance timestamps
    const now = Date.now();
    const startTime = now - (24 * 60 * 60 * 1000);
    const endTime = now;
    const queryString = `timestamp=${now}&startTime=${startTime}&endTime=${endTime}`;

    // Secure HMAC SHA-256 Signature Generation
    const crypto = require('crypto');
    const signatureHex = crypto.createHmac('sha256', secret).update(queryString).digest('hex');

    // Send request to Binance
    const finalUrl = `https://api.binance.com/sapi/v1/pay/transactions?${queryString}&signature=${signatureHex}`;
    
    const binanceResponse = await fetch(finalUrl, {
      method: 'GET',
      headers: { 'X-MBX-APIKEY': apiKey }
    });

    const responseText = await binanceResponse.text();
    
    // Return exact Binance JSON to your Dhru Server
    res.status(binanceResponse.status).send(responseText);

  } catch (err) {
    res.status(500).json({ success: false, message: 'Worker Error: ' + err.message });
  }
}