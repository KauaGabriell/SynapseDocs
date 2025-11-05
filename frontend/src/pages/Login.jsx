import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginButton from "../components/LoginButton";

function Login(){
    const navigate = useNavigate();
    useEffect(() =>{
        const token = localStorage.getItem('token');

        if(token){
            navigate('/dashboard', {replace: true});
        }
    }, [navigate]);
    return (
    <div>
      <h1>Página de Login</h1>
      <p>Você precisa se autenticar para continuar.</p>
      <LoginButton />
    </div>
  );
}

export default Login;