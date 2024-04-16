const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
	user: process.env.USERNAME,
	password: process.env.PASSWORD,
	host: process.env.HOST,
	database: process.env.DATABASE,
	port: process.env.DB_PORT,
})

async function check(){

	const createTableQuery1 = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

	const createTableQuery2 = `
		CREATE TABLE IF NOT EXISTS contacts (
			id SERIAL PRIMARY KEY,
			user_id INTEGER NOT NULL,
			contact_id INTEGER NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (contact_id) REFERENCES users(id) ON DELETE CASCADE
	);
	`;

	const createTableQuery3 = `
		CREATE TABLE IF NOT EXISTS messages (
			id SERIAL PRIMARY KEY,
			sender_id INTEGER NOT NULL,
			sender_username TEXT NOT NULL,
			chat_id UUID NOT NULL,
			message TEXT NOT NULL,
			timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
			CONSTRAINT fk_chat_id FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
		);
	`;

	const createTableQuery4 = `
		CREATE TABLE IF NOT EXISTS chats (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user1_id INTEGER NOT NULL,
			user2_id INTEGER NOT NULL,
			FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
	);
	`

	const res = await pool.query(createTableQuery1);
	const res2 = await pool.query(createTableQuery2);
	const res3 = await pool.query(createTableQuery4);
	const res4 = await pool.query(createTableQuery3);
}

check();
module.exports = pool;