import https from 'https';
import fs from 'fs';

const options = {
    key: fs.readFileSync('private-key.pem'),
    cert: fs.readFileSync('certificate.pem')
};

const server = https.createServer(options, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from HTTPS server\n');
});

const PORT = 3443;
server.listen(PORT, () => {
    console.log(`HTTPS server running on https://localhost:${PORT}`);
});