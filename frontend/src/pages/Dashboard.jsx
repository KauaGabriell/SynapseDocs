import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Grid3x3,
  List,
  Filter,
  Search,
  User,
  FileText,
  Code,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const classes = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    completed: "bg-green-500/10 text-green-400 border-green-500/30",
    failed: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
        classes[status] || "bg-gray-500/10 text-gray-400 border-gray-500/30"
      }`}
    >
      {status || "Indefinido"}
    </span>
  );
};

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

  // PAGINATION
  const [page, setPage] = useState(1);

  async function loadProjects() {
    try {
      const { data } = await api.get("/api/projects", {
        params: {
          page,
          limit: 6,
          search: searchTerm,
          status: statusFilter
        }
      });

      setProjects(data.items);       // <- CORRIGIDO
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Erro ao carregar projetos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [page, searchTerm, statusFilter]);

  const stats = {
    prontas: projects.filter((p) => p.status === "completed").length,
    processando: projects.filter((p) => p.status === "processing").length,
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

        {/* FILTER + VIEW */}
        <div className="flex items-center gap-3">
          {/* FILTER DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 py-3 px-4 bg-[#1a1f2e] border border-gray-800 rounded-lg text-gray-300 hover:text-white transition-all"
            >
              <span className="font-medium">
                {
                  {
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
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1f2e] border border-gray-800 rounded-xl shadow-xl z-20 animate-fade-in">
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

          {/* VIEW MODE */}
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 rounded-lg border border-gray-800 ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-[#1a1f2e] text-gray-400 hover:text-white"
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`p-3 rounded-lg border border-gray-800 ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-[#1a1f2e] text-gray-400 hover:text-white"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* RESUMO */}
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

      {/* LIST */}      
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
              <div
                key={p.id_projects}
                className="bg-[#1a1f2e] rounded-2xl p-6 border border-gray-800 hover:border-blue-500/50 transition-all shadow-lg flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold truncate">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {p.description || "Sem descrição"}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <User className="w-4 h-4" />
                  <span className="truncate">{p.author || "Desconhecido"}</span>
                </div>

                <div className="mt-auto flex gap-2">
                  <a
                    href={p.repositoryUrl}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full bg-[#2a3142] hover:bg-[#384054] text-gray-300 font-medium py-2 rounded-lg transition"
                  >
                    <Code className="w-4 h-4" /> Ver Código
                  </a>

                  <button
                    onClick={() =>
                      navigate(`/project/${p.id_projects}/documentation`)
                    }
                    className="flex items-center justify-center gap-2 w-full bg-[#2a3142] hover:bg-[#384054] text-gray-300 font-medium py-2 rounded-lg transition"
                  >
                    <FileText className="w-4 h-4" /> Docs
                  </button>
                </div>
              </div>
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
    </div>
  );
}
