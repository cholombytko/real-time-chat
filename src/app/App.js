import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { socket } from '../utils/socket'; // Ensure the socket utility is properly set up
import Chat from '../components/Chat/Chat';
import Login from '../components/Auth/Login/Login'; // Assuming Login component path
import Register from '../components/Auth/Register/Register'; // Assuming Register component path
import ContactsList from '../components/ContactList/ContactList';
import './App.css' // Assuming ContactsList component path
import Main from '../pages/main/main';

function App() {
  return (
    <Router>
      <header className='App-header'>
        <h1>Real-time Chat</h1>
      </header>
      <div>
        <Routes>
          <Route path="/" element={<Main/>} />
          <Route path="/register" element={<Register socket={socket}/>} />
          <Route path="/contacts" element={<ContactsList socket={socket}/>} />
          <Route path="/chat" element={<Chat socket={socket} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
