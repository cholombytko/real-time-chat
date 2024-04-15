const { Pool } = require("pg");

const pool = new Pool({
	user: process.ENV.USER,
	password: process.ENV.PASS,
	host: process.ENV.HOST,
	database: process.ENV.DB,
	port: process.ENV.DB_PORT,
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
			receiver_id INTEGER NOT NULL,
			message TEXT NOT NULL,
			timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
		);
	`;

	const res = await pool.query(createTableQuery1);
	const res2 = await pool.query(createTableQuery2);
	const res3 = await pool.query(createTableQuery3);
}

check();
module.exports = pool;