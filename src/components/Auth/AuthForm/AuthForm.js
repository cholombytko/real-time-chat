import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RedirectButton from "../../ui/Button/RedirectButton/RedirectButton";
import './AuthForm.css'
import Button from '../../ui/Button/Button';

const AuthForm = ({ type, endpoint, redirectLink, redirectText }) => {
	const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
	const [isFailed, setIsFailed] = useState(false);
  const navigate = useNavigate();

	const handleAuth = async (e) => {
    e.preventDefault();

		if (!username.trim()) {
			alert("Username cannot be empty.");
			return;
		}

    try {
      const response = await axios.post(endpoint, {
        username,
        password
      });
      localStorage.setItem('token', response.data.token);
			localStorage.setItem('username', username);
      navigate('/contacts');
    } catch (error) {
			setIsFailed(true);
      console.error(error);
    }
  };

	return ( 
		<div className="auth">
			<h2>{type}</h2>
      <form
				className="auth-form"
				onSubmit={handleAuth}
			>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type='submit'>{type}</Button>
      </form>
			<h3>{isFailed ? `${type} Failed. Try Again!` : ''}</h3>
			<RedirectButton
				text={redirectText}
				link={redirectLink}
			/>
		</div>
	);
}
 
export default AuthForm;