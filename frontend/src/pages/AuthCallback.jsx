import { useSearchParams, useNavigate,} from "react-router-dom";
import { useEffect } from "react";


function AuthCallback(){
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() =>{
        const token = searchParams.get('token');
        if(token){
            localStorage.setItem('token', token);

            navigate('/dashboard', {replace: true});
        }else{
            navigate('/', {replace: true});
        }
    },[searchParams, navigate]);

    return <div>Carregando Página....</div>
}

export default AuthCallback;