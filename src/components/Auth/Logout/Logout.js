import { useNavigate } from 'react-router-dom';

const Logout = () => {
	const navigate = useNavigate();

	const handleLogout = (e) => {
		e.preventDefault();
		localStorage.removeItem('token');
		localStorage.removeItem('username');
		navigate('/');
	}

	return (  
		<div>
			<button type='button' onClick={handleLogout}>Logout</button>
		</div>
	);
}
 
export default Logout;