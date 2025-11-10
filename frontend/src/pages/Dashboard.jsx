import { useEffect, useState } from 'react';
import { Search, Grid3x3, List, Filter, Code, FileText, Calendar } from 'lucide-react';
import api from '../services/api'

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

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

  // Calcular estatísticas
  const stats = {
    completed: projects.filter(p => p.status === 'completed').length,
    processing: projects.filter(p => p.status === 'processing').length,
    failed: projects.filter(p => p.status === 'failed').length
  };

  // Filtrar projetos
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Função para obter badge do status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Tradução dos status
  const translateStatus = (status) => {
    const translations = {
      'completed': 'Concluído',
      'processing': 'Processando',
      'failed': 'Erro',
      'pending': 'Pendente'
    };
    return translations[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1419]">
        <div className="text-gray-400">Carregando projetos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1419]">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Gerencia seus repositórios e documentações</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
          <div className="text-4xl font-bold text-green-400 mb-2">{stats.completed}</div>
          <div className="text-gray-400 text-sm">Documentações Prontas</div>
        </div>
        <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
          <div className="text-4xl font-bold text-yellow-400 mb-2">{stats.processing}</div>
          <div className="text-gray-400 text-sm">Em Processamento</div>
        </div>
        <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
          <div className="text-4xl font-bold text-red-400 mb-2">{stats.failed}</div>
          <div className="text-gray-400 text-sm">Com Erro</div>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar repositórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-lg border transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 border-blue-600'
                : 'bg-[#1a1f2e] border-gray-800 hover:border-gray-700'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-lg border transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 border-blue-600'
                : 'bg-[#1a1f2e] border-gray-800 hover:border-gray-700'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button className="p-3 rounded-lg bg-[#1a1f2e] border border-gray-800 hover:border-gray-700 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Seus Projetos
          </h2>
          <span className="text-gray-400 text-sm">
            {filteredProjects.length} de {projects.length} repositórios
          </span>
        </div>

        {/* Projects Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id_projects}
                className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(project.status)}`}>
                        {translateStatus(project.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span>{project.language}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Atualizado em {project.updatedAt}</span>
                  </div>
                </div>

                {project.status === 'processing' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Progresso</span>
                      <span className="text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 bg-[#0f1419] border border-gray-800 hover:border-gray-700 rounded-lg py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Code className="w-4 h-4" />
                    Ver Código
                  </button>
                  <button className="flex-1 bg-[#0f1419] border border-gray-800 hover:border-gray-700 rounded-lg py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documentação
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id_projects}
                className="bg-[#1a1f2e] rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-white">{project.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(project.status)}`}>
                      {translateStatus(project.status)}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span>{project.language}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-[#0f1419] border border-gray-800 hover:border-gray-700 rounded-lg transition-colors">
                    <Code className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-[#0f1419] border border-gray-800 hover:border-gray-700 rounded-lg transition-colors">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhum projeto encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;