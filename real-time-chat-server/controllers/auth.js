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
        const token = jwt.sign({ userId: result.rows[0].id, username: result.rows[0].username }, JWT_SECRET, { expiresIn: '1h' });
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

        const token = jwt.sign({ userId: user.rows[0].id, username: user.rows[0].username }, JWT_SECRET, { expiresIn: '1h' });
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

router.get('/messages/:chatId', authenticateToken, async (req, res) => {
	const { chatId } = req.params;
	const userId = req.user.userId;

	try {
			// First, verify the user is part of the chat
			const chatVerification = await pool.query(`
					SELECT id FROM chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2);
			`, [chatId, userId]);

			if (chatVerification.rows.length === 0) {
					return res.status(403).json({ message: "Access denied." });
			}

			// Retrieve messages
			const messagesResult = await pool.query(`
					SELECT m.id, m.message, m.sender_id, m.sender_username, m.timestamp
					FROM messages m
					WHERE m.chat_id = $1
					ORDER BY m.timestamp ASC;
			`, [chatId]);

			res.json(messagesResult.rows);
	} catch (error) {
			console.error('Failed to retrieve messages:', error);
			res.status(500).json({ message: "Failed to retrieve messages", error: error.message });
	}
});

router.post('/messages/:chatId', authenticateToken, async (req, res) => {
	const userId = req.user.userId;
	const username = req.user.username; // Extracted from JWT after authentication
	const { chatId } = req.params;
	const { message } = req.body;  // Message content received from the client

	if (!message) {
			return res.status(400).json({ message: "Message content is required." });
	}

	try {
			// Verify that the user is part of the chat
			const chatVerification = await pool.query(`
					SELECT id FROM chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2);
			`, [chatId, userId]);

			if (chatVerification.rows.length === 0) {
					return res.status(403).json({ message: "Access denied. You are not part of this chat." });
			}

			// Insert the new message into the database
			const insertMessage = await pool.query(`
					INSERT INTO messages (sender_id, sender_username, chat_id, message)
					VALUES ($1, $2, $3, $4)
					RETURNING id, timestamp;
			`, [userId, username, chatId, message]);

			// Return the new message ID and timestamp to the client
			res.status(201).json({
					messageId: insertMessage.rows[0].id,
					sender_id: userId,
					sender_username: username,
					message: message,
					timestamp: insertMessage.rows[0].timestamp
			});
	} catch (error) {
			console.error('Failed to send message:', error);
			res.status(500).json({ message: "Failed to send message", error: error.message });
	}
});


router.post('/create-chat', authenticateToken, async (req, res) => {
	const { contactId } = req.body;
	console.log(contactId);
	const userId = req.user.userId;

	if (!contactId) {
			return res.status(400).json({ message: "Contact ID is required." });
	}

	try {
			// Check if a chat already exists
			const existingChat = await pool.query(`
					SELECT id FROM chats WHERE 
					(user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1);
			`, [userId, contactId]);

			if (existingChat.rows.length) {
					return res.status(200).json({ chatId: existingChat.rows[0].id, message: "Chat already exists." });
			}

			// Create new chat
			const result = await pool.query(`
					INSERT INTO chats (user1_id, user2_id)
					VALUES ($1, $2) RETURNING id;
			`, [userId, contactId]);

			res.status(201).json({ chatId: result.rows[0].id, message: "Chat created successfully." });
	} catch (error) {
			console.error('Failed to create chat:', error);
			res.status(500).json({ message: "Failed to create chat", error: error.message });
	}
});


module.exports = router;
