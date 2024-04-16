import { useState, useEffect } from "react";
import './Chat.css'
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import RedirectButton from "../ui/Button/RedirectButton/RedirectButton";

const Chat = () => {
	const { chatId } = useParams();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
	const [socket, setSocket] = useState(null);
	const navigate = useNavigate();
  //const username = localStorage.getItem('username');

  useEffect(() => {
		fetchMessages();

		const newSocket = io('http://localhost:4000', {
			query: { username: localStorage.getItem("username") }
		});
		setSocket(newSocket);

		const username = localStorage.getItem("username");
    newSocket.emit("online", username);

		newSocket.on('receiveMessage', (msg) => {
			console.log("Received message:", msg);
			setChat(prevChat => [...prevChat, msg]);
		});

    return () => {
      newSocket.disconnect();
			//setSocket(null);
    };
  }, []);

	const fetchMessages = async () => {
		try {
			const response = await axios.get(`http://localhost:4000/api/messages/${chatId}`, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
			});

			setChat(response.data); 
			console.log(response.data) // Confirm that response.data is an array of contacts
		} catch (error) {
			console.error('Failed to fetch messages:', error);
			navigate('/contacts');
		}
	};

  const sendMessage = async (e) => {
      e.preventDefault();
      if (message !== '') {
				try {
					const response = await axios.post(`http://localhost:4000/api/messages/${chatId}`,
						{ message }, 
						{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
					)

					if (socket) {
            socket.emit('sendMessage', response.data);
            console.log("Message sent via socket:", response.data);
          }

					setMessage('');
				} catch(e) {
					console.error(e);
				}
        //setChat(prevChat => [...prevChat, message])	;  // Update chat immediately for the user
      }
  };

  return (
		<div className="Chat">
			<RedirectButton link='/contacts'>To contact list</RedirectButton>
			<form onSubmit={sendMessage}>
				<input
					type="text"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Type a message..."
					required
				/>
				<button type="submit">Send</button>
			</form>
			<ul>
				{chat.map((msg, index) => (
					<li key={index}>{msg.sender_username}: {msg.message}</li>
				))}
			</ul>
		</div>
  );
}
 
export default Chat;