const express = require('express');
const router = express.Router();
const pool = require('../db/connect');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-app';

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Bearer token

    if (!token) return res.sendStatus(401);  // No token provided

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);  // Invalid token
        req.user = user;
        next();
    });
}

router.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, hashedPassword]
        );
        const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: result.rows[0].id, username: result.rows[0].username });
    } catch (error) {
        res.status(500).json({ message: 'Error registering new user', error: error.message });
    }
});

router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (!user.rows.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isValid) {
            return res.status(403).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user.rows[0].id, username: user.rows[0].username });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Assuming you have authentication middleware to get the authenticated user's id
router.post('/add-contact', authenticateToken, async (req, res) => {
	const contactUsername = req.body.username;  // The username of the new contact
	const userId = req.user.userId;  // Retrieved from the authenticated user's data

	if (!userId) {
			return res.status(400).json({ message: "User ID is missing." });
	}

	try {
			// Check if contact user exists and get their ID
			const contactResult = await pool.query(
					"SELECT id FROM users WHERE username = $1",
					[contactUsername]
			);

			if (contactResult.rows.length === 0) {
					return res.status(404).json({ message: "Contact not found." });
			}

			const contactId = contactResult.rows[0].id;

			// Insert new contact relation
			await pool.query(
					"INSERT INTO contacts (user_id, contact_id) VALUES ($1, $2)",
					[userId, contactId]
			);

			res.status(201).json({ message: "Contact added successfully." });
	} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Failed to add contact.", error: error.message });
	}
});


router.get('/contacts', authenticateToken,	 async (req, res) => {
	const userId = req.user.userId; // Assuming user ID is set on the req.user object by your auth middleware

	try {
			const query = `
					SELECT u.id, u.username
					FROM users u
					INNER JOIN contacts c ON c.contact_id = u.id
					WHERE c.user_id = $1;
			`;
			const contacts = await pool.query(query, [userId]);

			res.json(contacts.rows);
	} catch (err) {
			console.error('Failed to retrieve contacts:', err);
			res.status(500).json({ message: 'Failed to retrieve contacts' });
	}
});

module.exports = router;
