// src/pages/Dashboard.jsx
import { useEffect, useState, useCallback } from "react"; // Adicionado useCallback
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Grid3x3,
  List,
  Filter,
  Search,
  Trash2,
  Plus // Importe o ícone de adicionar se precisar para o botão do modal
} from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import ModalAddRepo from "../components/ModalAddRepo"; // Importe o Modal

export default function Dashboard() {
  const navigate = useNavigate();

  // BACKEND DATA
  const [projects, setProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // UI
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // MODALS
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Estado do Modal de Add

  // PAGINATION
  const [page, setPage] = useState(1);

  // --- FUNÇÃO DE CARREGAMENTO ---
  // isSilent = true significa que não mostra o "Carregando..." na tela inteira
  // útil para updates em background
  const loadProjects = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data } = await api.get("/api/projects", {
        params: {
          page,
          limit: 6,
          search: searchTerm,
          status: statusFilter
        }
      });

      setProjects(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Erro ao carregar projetos:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  // --- EFEITO INICIAL E DE FILTROS ---
  useEffect(() => {
    let cancelled = false;
    loadProjects();
    return () => { cancelled = true; };
  }, [loadProjects]);

  // --- POLLING INTELIGENTE (ATUALIZAÇÃO EM TEMPO REAL) ---
  useEffect(() => {
    // Verifica se existe algum projeto na lista atual que está processando ou pendente
    const hasActiveProjects = projects.some(p => 
      ['pending', 'processing'].includes(p.status)
    );

    let intervalId;

    if (hasActiveProjects) {
      // Se tiver projetos ativos, consulta a API a cada 4 segundos
      // usando o modo silencioso (sem spinner de tela cheia)
      intervalId = setInterval(() => {
        console.log("Polling updates..."); // Debug
        loadProjects(true); 
      }, 4000);
    }

    // Limpa o intervalo se o componente desmontar ou se não houver mais projetos ativos
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [projects, loadProjects]);


  // --- HANDLERS ---

  // Chamado pelo Modal quando um projeto é criado com sucesso
  const handleProjectAdded = (newProject) => {
    // 1. Fecha o modal
    setIsAddModalOpen(false);

    // 2. OPTIMISTIC UI: Adiciona imediatamente na lista visual
    // Se o filtro permitir ver o novo projeto, adicionamos ele no topo
    if (statusFilter === 'all' || statusFilter === 'pending') {
       setProjects(prev => [newProject, ...prev]);
    } else {
       // Se o usuário estiver filtrando por "Completed", forçamos um reload ou resetamos filtro
       loadProjects();
    }
    
    // O useEffect do Polling vai detectar que esse 'newProject' tem status 'pending'
    // e vai começar a atualizar automaticamente.
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/api/projects/${projectToDelete.id_projects}`);
      setProjects(prev => prev.filter(p => p.id_projects !== projectToDelete.id_projects));
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error("Erro ao deletar projeto:", err);
      alert("Erro ao excluir projeto. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    prontas: projects.filter((p) => p.status === "completed").length,
    processando: projects.filter((p) => ["processing", "pending"].includes(p.status)).length,
    erro: projects.filter((p) => p.status === "failed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Carregando projetos...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* SEARCH */}
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar repositórios..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full bg-[#1a1f2e] border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
            
          {/* BOTÃO ADICIONAR (Adicione onde achar melhor no seu layout) */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Novo Projeto</span>
          </button>

          {/* FILTER */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 py-3 px-4 bg-[#1a1f2e] border border-gray-800 rounded-lg text-gray-300 hover:text-white transition-all"
            >
              <span className="font-medium">
                {{
                    all: "Todos",
                    pending: "Pendentes",
                    processing: "Processando",
                    completed: "Completos",
                    failed: "Com erro",
                  }[statusFilter]
                }
              </span>
              <Filter className="w-4 h-4" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1f2e] border border-gray-800 rounded-xl shadow-xl z-20">
                {[
                  ["all", "Todos"],
                  ["pending", "Pendentes"],
                  ["processing", "Processando"],
                  ["completed", "Completos"],
                  ["failed", "Com erro"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setStatusFilter(value);
                      setPage(1);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      statusFilter === value
                        ? "bg-blue-600/20 text-blue-300"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIEW MODE TOGGLES */}
          <div className="flex bg-[#1a1f2e] rounded-lg border border-gray-800 p-1">
             <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition ${viewMode === "grid" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
             >
                <Grid3x3 className="w-5 h-5" />
             </button>
             <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition ${viewMode === "list" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
             >
                <List className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800">
          <h3 className="text-3xl font-bold text-green-400">{stats.prontas}</h3>
          <p className="text-sm text-gray-400">Documentações Prontas</p>
        </div>

        <div className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800">
          <h3 className="text-3xl font-bold text-yellow-400">{stats.processando}</h3>
          <p className="text-sm text-gray-400">Em Processamento</p>
        </div>

        <div className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800">
          <h3 className="text-3xl font-bold text-red-400">{stats.erro}</h3>
          <p className="text-sm text-gray-400">Com Erro</p>
        </div>
      </div>

      {/* PROJECT LIST */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Seus Projetos</h2>
        <p className="text-gray-400 mb-6">
          {projects.length} repositórios encontrados
        </p>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum projeto encontrado.
          </div>
        ) : (
          <div
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 gap-6"
                : "grid-cols-1 gap-4"
            }`}
          >
            {projects.map((p) => (
              <ProjectCard
                key={p.id_projects}
                project={p}
                viewMode={viewMode}
                onOpenDocs={() => navigate(`/project/${p.id_projects}/documentation`)}
                onDelete={() => handleDeleteClick(p)}
              />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg border border-gray-800 ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-[#1a1f2e] text-gray-400 hover:text-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      <ModalAddRepo 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProjectAdded={handleProjectAdded}
      />

      {/* DELETE MODAL (Mantido igual ao seu original) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f2e] border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
             {/* ... conteúdo do modal de delete igual ao seu ... */}
             <div className="flex gap-3 mt-6">
               <button onClick={() => setDeleteModalOpen(false)} className="flex-1 px-4 py-2 bg-[#2a3142] text-gray-300 rounded-lg">Cancelar</button>
               <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Excluir</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}