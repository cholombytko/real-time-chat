import { useState, useEffect } from "react";
import './Chat.css'

function Chat({ socket }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const username = localStorage.getItem('username'); // Fetching username from local storage

  useEffect(() => {
      socket.on('receiveMessage', (msg) => {
          setChat(prevChat => [...prevChat, msg]);
      });

      return () => {
          socket.off('receiveMessage'); // Detach socket listener on cleanup
      };
  }, []);

  const sendMessage = (e) => {
      e.preventDefault();
      if (message !== '' && username) {
          const msg = {
              sender: username,
              message: message,
              timestamp: new Date().toISOString()
          };
          socket.emit('sendMessage', msg);
          setMessage('');
          setChat(prevChat => [...prevChat, msg]);  // Update chat immediately for the user
      }
  };

  return (
      <div className="Chat">
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
                  <li key={index}>{msg.sender}: {msg.message}</li>
              ))}
          </ul>
      </div>
  );
}
 
export default Chat;