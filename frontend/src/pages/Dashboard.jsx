import { useEffect, useState } from 'react';
import api from '../services/api'; // Nosso Axios configurado

function Dashboard() {
  // Estado CORRETO: Vamos armazenar a lista de projetos
  const [projects, setProjects] = useState([]); 
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Função para buscar os projetos (Item 2 - GET)
  const fetchProjects = async () => {
    try {
      // Chama a rota GET /api/projects
      const response = await api.get('/api/projects');
      
      // Armazena o ARRAY de projetos no estado
      setProjects(response.data); 
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
      setError('Falha ao carregar projetos.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Roda o 'fetchProjects' UMA VEZ quando a página carrega
  useEffect(() => {
    fetchProjects();
  }, []);

  // 3. Função para adicionar um projeto (Item 2 - POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const projectName = repoUrl.split('/').pop() || 'Novo Projeto';

    try {
      // Chama a rota POST /api/projects
      const response = await api.post('/api/projects', {
        name: projectName,
        repositoryUrl: repoUrl,
      });

      // Adiciona o novo projeto na lista da tela
      setProjects([...projects, response.data]);
      setRepoUrl(''); // Limpa o formulário
    } catch (err) {
      console.error('Erro ao adicionar projeto:', err);
      setError('Falha ao adicionar projeto.');
    }
  };

  if (loading) return <div>Carregando projetos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Dashboard (Meus Projetos)</h1>

      {/* Formulário para o POST */}
      <form onSubmit={handleSubmit}>
        <h3>Adicionar Novo Repositório</h3>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/usuario/repo"
        />
        <button type="submit">Adicionar</button>
      </form>

      <hr />

      <h2>Projetos no Banco:</h2>
      <ul>
        {projects.length === 0 ? (
          <li>Nenhum projeto encontrado. (O GET funcionou!)</li>
        ) : (
          projects.map((project) => (
            <li key={project.id_projects}>
              <strong>{project.name}</strong> (Status: {project.status})
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Dashboard;