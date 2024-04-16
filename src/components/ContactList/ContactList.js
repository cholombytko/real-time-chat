import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Logout from '../Auth/Logout/Logout';
import RedirectButton from '../ui/Button/RedirectButton/RedirectButton';

const ContactsList = () => {
	const [contacts, setContacts] = useState([]);
	const [username, setUsername] = useState('');
	const [onlineUsers, setOnlineUsers] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		fetchContacts();

		const socket = io('http://localhost:4000', {
			query: { username: localStorage.getItem("username") }
		});

    const username = localStorage.getItem("username");
    socket.emit("online", username);

    socket.on("user_online", (users) => {
			setOnlineUsers(users);
		});

		socket.on("user_offline", (users) => {
			setOnlineUsers(users);
		})

		return () => {
			socket.disconnect();	
		};
	}, []);

	const fetchContacts = async () => {
		try {
			const response = await axios.get('http://localhost:4000/api/contacts', {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
			});
			for(const contact of response.data) {
				contact.chatId = await createChat(contact.id);
			}
			setContacts(response.data); 
			console.log(response.data) // Confirm that response.data is an array of contacts
		} catch (error) {
			console.error('Failed to fetch contacts:', error);
			navigate('/');
		}
	};

	const createChat = async (contactId) => {
		try {
			const response = await axios.post('http://localhost:4000/api/create-chat',
				{ contactId },
				{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }},
			)	
			console.log(response)
			const chatId = response.data.chatId;
			return chatId;
		} catch (e) {
			console.error(e);
		}
	}

	const handleAddContact = async (event) => {
		event.preventDefault();
		try {
			const newContact = { username };  // Assuming the response includes necessary contact details
			setContacts(prevContacts => [...prevContacts, newContact]);  // Optimistically add to UI
			const response = await axios.post('http://localhost:4000/api/add-contact',
				{ username },
				{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
			);
			alert(response.data.message);
			setUsername('');  // Clear the username input field after successful addition
		} catch (error) {
			console.error('Error adding contact:', error);
			alert(error.response.data.message || "Failed to add contact");
			setContacts(prevContacts => prevContacts.filter(contact => contact.username !== username));  // Rollback on error
		}
	};

	return (
		<div>
			<h2>Contacts</h2>
			<Logout />
			<form onSubmit={handleAddContact}>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Enter username to add"
					required
				/>
				<button type="submit">Add Contact</button>
			</form>
			<ul>
				{contacts.map((contact, index) => (
					<li key={index} style={{ color: onlineUsers.includes(contact.username) ? 'green' : 'white' }}>
							{contact.username} <RedirectButton link={`/chat/${contact.chatId}`}>Send message</RedirectButton>
					</li>
				))}
			</ul>
		</div>
	);
}

export default ContactsList;
