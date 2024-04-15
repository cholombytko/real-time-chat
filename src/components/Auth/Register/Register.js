import AuthForm from "../AuthForm/AuthForm";
import authTypes from "../authTypes";

const Register = () => {
  return (
		<div>
			<AuthForm
				type={authTypes.register}
				endpoint='http://localhost:4000/api/auth/register/'
				redirectLink='/'
				redirectText='Login page'
			/>
		</div>
	)
}

export default Register;
