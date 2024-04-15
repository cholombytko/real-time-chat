import Login from "../../components/Auth/Login/Login";
import './main.css'

const Main = () => {
	return (
		<div className="main">
			<div className="column">
				<p>
					Experience seamless communication with our real-time chat.
					Connect, collaborate, and share instantly in a secure, user-friendly environment.
					Perfect for personal and professional conversations. Join now and start chatting!
				</p>
			</div>
			<div className="column">
				<Login/>
			</div>
		</div>
	);
}
 
export default Main;
