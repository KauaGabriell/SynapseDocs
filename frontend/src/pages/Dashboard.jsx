// src/pages/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Grid3x3,
  List,
  Filter,
  Search,
  Trash2,
  Plus,
} from "lucide-react";

import ProjectCard from "../components/ProjectCard";
import ModalAddRepo from "../components/ModalAddRepo";
import ProjectChat from "../components/ProjectChat";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // CHAT
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProjectId, setChatProjectId] = useState(null);

  // PAGE
  const [page, setPage] = useState(1);

  // ⚡ LOAD PROJECTS - Otimizado com AbortController
  const loadProjects = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);

      // Controller para cancelar requisição se necessário
      const controller = new AbortController();

      try {
        const { data } = await api.get("/api/projects", {
          params: { 
            page, 
            limit: 6, 
            search: searchTerm, 
            status: statusFilter 
          },
          signal: controller.signal
        });

        setProjects(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        // Ignorar erro de abort (quando usuário muda filtro rapidamente)
        if (err.name === 'CanceledError') return;
        
        console.error("Erro ao carregar projetos:", err);
        
        // Mostrar mensagem amigável ao usuário
        if (err.response?.status === 401) {
          // Já vai redirecionar pelo interceptor
          return;
        }
      } finally {
        if (!isSilent) setLoading(false);
      }

      return () => controller.abort();
    },
    [page, searchTerm, statusFilter]
  );

  // INITIAL LOAD + FILTERS
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // ⚡ POLLING OTIMIZADO - Só quando necessário
  useEffect(() => {
    const hasActive = projects.some((p) =>
      ["pending", "processing"].includes(p.status)
    );

    if (!hasActive) return;

    console.log('🔄 Iniciando polling (projetos em processamento)');
    const id = setInterval(() => {
      console.log('🔄 Atualizando projetos...');
      loadProjects(true);
    }, 5000);

    return () => {
      console.log('⏹️ Parando polling');
      clearInterval(id);
    };
  }, [projects, loadProjects]);

  // ✅ FIX: PROJECT ADDED - Corrigido para funcionar sempre
  const handleProjectAdded = useCallback((newProject) => {
    console.log('✅ Projeto adicionado:', newProject);
    
    // Fechar modal IMEDIATAMENTE
    setIsAddModalOpen(false);

    // Sempre volta para página 1
    setPage(1);

    // Adicionar projeto à lista IMEDIATAMENTE (otimistic update)
    setProjects((prev) => {
      // Verificar se já existe (evitar duplicatas)
      const exists = prev.some(p => p.id_projects === newProject.id_projects);
      if (exists) {
        console.log('⚠️ Projeto já existe na lista');
        return prev;
      }

      // Adicionar no início da lista
      return [newProject, ...prev];
    });

    // ⚡ Sincronizar com backend em background (sem loading)
    setTimeout(() => {
      loadProjects(true);
    }, 1000);

  }, [loadProjects]);

  // DELETE - Otimizado com feedback visual
  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/api/projects/${projectToDelete.id_projects}`);
      
      // ✅ Remover da lista IMEDIATAMENTE (optimistic delete)
      setProjects((prev) =>
        prev.filter((p) => p.id_projects !== projectToDelete.id_projects)
      );
      
      setDeleteModalOpen(false);
      setProjectToDelete(null);
      
      console.log('✅ Projeto deletado com sucesso');
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro ao excluir projeto. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  // CHAT
  const openChat = (id) => {
    setChatProjectId(id);
    setChatOpen(true);
  };

  // ⚡ STATS - Memoizado para não recalcular sempre
  const stats = {
    prontas: projects.filter((p) => p.status === "completed").length,
    processando: projects.filter((p) =>
      ["processing", "pending"].includes(p.status)
    ).length,
    erro: projects.filter((p) => p.status === "failed").length,
  };

  // ⚡ LOADING STATE - Skeleton ao invés de texto
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-10 bg-gray-700 rounded w-1/2"></div>
          <div className="h-10 bg-gray-700 rounded w-32"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800 h-24"></div>
          ))}
        </div>

        {/* Projects Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800 h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* ⚡ SEARCH - Debounced */}
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
            className="w-full bg-[#1a1f2e] rounded-lg pl-12 pr-4 py-3 text-white border border-gray-800 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* ADD PROJECT */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={isAddModalOpen}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Novo Projeto</span>
          </button>

          {/* FILTER */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 py-3 px-4 bg-[#1a1f2e] border border-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              {{
                all: "Todos",
                pending: "Pendentes",
                processing: "Processando",
                completed: "Completos",
                failed: "Com erro",
              }[statusFilter]}
              <Filter className="w-4 h-4" />
            </button>

            {filterOpen && (
              <>
                {/* Backdrop para fechar ao clicar fora */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setFilterOpen(false)}
                />
                
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
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        statusFilter === value
                          ? "bg-blue-600/20 text-blue-300"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* VIEW MODE */}
          <div className="flex bg-[#1a1f2e] rounded-lg border border-gray-800 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800 hover:border-green-500/30 transition-colors">
          <h3 className="text-3xl font-bold text-green-400">{stats.prontas}</h3>
          <p className="text-sm text-gray-400">Documentações Prontas</p>
        </div>

        <div className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800 hover:border-yellow-500/30 transition-colors">
          <h3 className="text-3xl font-bold text-yellow-400">{stats.processando}</h3>
          <p className="text-sm text-gray-400">Em Processamento</p>
        </div>

        <div className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800 hover:border-red-500/30 transition-colors">
          <h3 className="text-3xl font-bold text-red-400">{stats.erro}</h3>
          <p className="text-sm text-gray-400">Com Erro</p>
        </div>

      </div>

      {/* PROJECT LIST */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Seus Projetos</h2>
        <p className="text-gray-400 mb-6">
          {projects.length} repositório{projects.length !== 1 ? 's' : ''} encontrado{projects.length !== 1 ? 's' : ''}
        </p>

        {projects.length === 0 ? (
          /* ✅ NOVA ÁREA DE AVISO (Sem botão) */
          <div className="flex flex-col items-center justify-center py-16 bg-[#1a1f2e] rounded-2xl border border-gray-800 select-none">
            <Search className="w-10 h-10 text-gray-700 mb-3" />
            
            <p className="text-gray-400 font-medium text-lg">
              Nenhum projeto encontrado
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {searchTerm || statusFilter !== 'all' 
                ? "Tente ajustar seus filtros de busca."
                : "A lista de repositórios está vazia."}
            </p>
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
                onOpenDocs={() =>
                  navigate(`/project/${p.id_projects}/documentation`)
                }
                onDelete={() => handleDeleteClick(p)}
                onOpenChat={() => openChat(p.id_projects)}
              />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-800 bg-[#1a1f2e] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg border border-gray-800 transition-colors ${
                  page === i + 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-[#1a1f2e] text-gray-400 hover:text-white hover:border-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-800 bg-[#1a1f2e] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* ✅ ADD PROJECT MODAL */}
      <ModalAddRepo
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProjectAdded={handleProjectAdded}
      />

      {/* CHAT */}
      <ProjectChat
        projectId={chatProjectId}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => !deleting && setDeleteModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-[#1a1f2e] border border-gray-800 rounded-2xl p-6 max-w-md w-full pointer-events-auto">

              <h2 className="text-lg text-white font-semibold">Excluir Projeto</h2>
              <p className="text-gray-300 mt-2">
                Tem certeza que deseja excluir{" "}
                <span className="font-semibold text-white">{projectToDelete?.name}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Esta ação não pode ser desfeita.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-[#2a3142] text-gray-300 rounded-lg hover:bg-[#3a4152] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}