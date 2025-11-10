import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar'; // 1. Importa o Sidebar (sem ícones)

function Dashboard() {
  // Lógica de estado
  const [projects, setProjects] = useState([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lógica para buscar os projetos
  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
      setError('Falha ao carregar projetos.');
    } finally {
      setLoading(false);
    }
  };

  // Roda o fetch no carregamento
  useEffect(() => {
    fetchProjects();
  }, []);

  // Lógica para adicionar um projeto
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repoUrl) return; // Não envia se estiver vazio
    
    const projectName = repoUrl.split('/').pop() || 'Novo Projeto';

    try {
      const response = await api.post('/api/projects', {
        name: projectName,
        repositoryUrl: repoUrl,
      });

      setProjects([...projects, response.data]);
      setRepoUrl('');
    } catch (err) {
      console.error('Erro ao adicionar projeto:', err);
      setError('Falha ao adicionar projeto.');
    }
  };

  // Renderização de carregamento/erro
  if (loading) return <div>Carregando projetos...</div>;
  if (error) return <div>{error}</div>;

  // Renderização Principal (Layout com Sidebar)
  return (
    <div className="flex bg-bg-main min-h-screen">
      <Sidebar /> 
      <main className="flex-1 p-8">
        
        {/* (Vamos adicionar o Header.jsx aqui em breve) */}
        
        <h1 className="text-3xl font-bold mb-6 text-text-primary">Meus Projetos</h1>

        {/* Formulário para o POST (Estilizado com as suas classes) */}
        <form onSubmit={handleSubmit} className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-text-secondary">Adicionar Novo Repositório</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/usuario/repo"
              className="flex-1 bg-bg-surface border border-border rounded-lg p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button 
              type="submit"
              className="bg-accent text-text-primary font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              Adicionar
            </button>
          </div>
        </form>

        <hr className="border-border mb-8" />

        {/* Lista para o GET (Estilizada com as suas classes) */}
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">Projetos no Banco:</h2>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <p className="text-text-secondary">Nenhum projeto encontrado. Adicione um acima para começar.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id_projects} className="p-4 bg-bg-surface rounded-lg border border-border flex justify-between items-center">
                <div>
                  <strong className="text-text-primary text-lg">{project.name}</strong>
                  <p className="text-text-secondary text-sm">{project.repositoryUrl}</p>
                </div>
                <span 
                  // Estilo dinâmico para o status
                  className={`py-1 px-3 rounded-full text-xs font-semibold
                    ${project.status === 'pending' ? 'bg-warning/20 text-warning' : ''}
                    ${project.status === 'completed' ? 'bg-success/20 text-success' : ''}
                    ${project.status === 'failed' ? 'bg-error/20 text-error' : ''}
                  `}
                >
                  {project.status}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;