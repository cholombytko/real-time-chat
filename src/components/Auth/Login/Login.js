import AuthForm from "../AuthForm/AuthForm";
import authTypes from "../authTypes";

const Login = () => {
  return (
		<div>
			<AuthForm
				type={authTypes.login}
				endpoint='http://localhost:4000/api/auth/login/'
				redirectLink='/register'
				redirectText='Register page'
			/>
		</div>
	)
}

export default Login;
