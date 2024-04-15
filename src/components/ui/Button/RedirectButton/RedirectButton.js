import { useNavigate } from 'react-router-dom';
import Button from '../Button';

const RedirectButton = ({ link, text }) => {
	const navigate = useNavigate();

	const handleRedirect = (e) => {
		e.preventDefault();
		navigate(link);
	}
	
	return (  
		<div>
			<Button type='button' onClick={handleRedirect}>{text}</Button>
		</div>
	);
}
 
export default RedirectButton;