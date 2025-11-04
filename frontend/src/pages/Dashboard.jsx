import { useEffect, useState } from 'react';
import api from '../services/api'; // Nosso Axios configurado com o token

function Dashboard() {
  const [message, setMessage] = useState('Carregando...');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Esta função roda assim que o componente é montado
    const fetchProtectedData = async () => {
      try {
        //O Axios (api) pega o token do localStorage
        //Ele chama nossa nova rota segura
        const response = await api.get('/api/projects'); 
        
        // O middleware (backend) verifica o token
        // A rota (backend) envia a resposta
        setMessage(response.data.message); 
        setUserId(response.data.userId);

      } catch (error) {
        // Se o token for inválido ou não existir, o middleware
        // retornará 401, e o Axios cairá neste 'catch'
        console.error('Erro ao buscar rota protegida:', error);
        setMessage('Erro: Você não está autenticado.');
      }
    };

    fetchProtectedData();
  }, []); 

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Status: {message}</p>
      {userId && <p>Seu ID de Usuário (do token) é: {userId}</p>}
    </div>
  );
}

export default Dashboard;