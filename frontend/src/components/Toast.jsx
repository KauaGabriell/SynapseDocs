import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Grid3x3,
  List,
  Filter,
  Search,
  User,
  Calendar,
  FileText,
  Code,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import Toast from "../components/Toast";
import api from "../services/api";

// Badge de status
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
  const { projects, loading, fetchProjects } = useOutletContext();

  const navigate = useNavigate();

  // VIEW
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  // FILTERS
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // MODAL + TOAST
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const openDeleteModal = (id) => {
    setSelectedProject(id);
    setModalOpen(true);
  };

  const deleteProject = async () => {
    try {
      await api.delete(`/api/projects/${selectedProject}`);
      setModalOpen(false);
      setToastType("success");
      setToastMsg("Repositório excluído!");
      fetchProjects();
    } catch {
      setToastType("error");
      setToastMsg("Erro ao excluir repositório.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Carregando projetos...
      </div>
    );

  // ------ SEARCH + FILTERS ------
  let filtered = projects.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (statusFilter !== "all")
    filtered = filtered.filter((p) => p.status === statusFilter);

  filtered = filtered.sort((a, b) =>
    sortOrder === "asc"
      ? new Date(a.updatedAt) - new Date(b.updatedAt)
      : new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  // ------ PAGINATION ------
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () =>
    setCurrentPage((p) => (p < totalPages ? p + 1 : p));

  const prevPage = () =>
    setCurrentPage((p) => (p > 1 ? p - 1 : p));

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* SEARCH */}
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Buscar repositórios..."
            className="w-full bg-[#1a1f2e] border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* VIEW + FILTER BUTTON */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 rounded-lg border border-gray-800 ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-[#1a1f2e] text-gray-400 hover:text-white"
            }`}
          >
            <Grid3x3 />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`p-3 rounded-lg border border-gray-800 ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-[#1a1f2e] text-gray-400 hover:text-white"
            }`}
          >
            <List />
          </button>

          {/* dropdown de filtros */}
          <div className="relative group">
            <button className="flex items-center gap-2 py-3 px-4 bg-[#1a1f2e] border border-gray-800 rounded-lg text-gray-400 group-hover:text-white transition">
              <Filter className="w-4 h-4" /> Filtros
            </button>

            <div className="hidden group-hover:block absolute right-0 mt-2 bg-[#1a1f2e] border border-gray-700 rounded-xl shadow-xl z-20 w-52 p-3">
              <h3 className="text-sm text-gray-400 mb-2">Status</h3>

              {["all", "completed", "processing", "failed", "pending"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 ${
                      statusFilter === s
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-gray-300 hover:bg-gray-700/30"
                    }`}
                  >
                    {s === "all" ? "Todos" : s}
                  </button>
                )
              )}

              <h3 className="text-sm text-gray-400 mt-4 mb-2">Ordenar por</h3>

              <button
                onClick={() => {
                  setSortOrder("asc");
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 ${
                  sortOrder === "asc"
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-300 hover:bg-gray-700/30"
                }`}
              >
                Data (antigos → novos)
              </button>

              <button
                onClick={() => {
                  setSortOrder("desc");
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  sortOrder === "desc"
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-300 hover:bg-gray-700/30"
                }`}
              >
                Data (novos → antigos)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LISTAGEM */}
      <h2 className="text-xl font-semibold text-white mb-2">Seus Projetos</h2>
      <p className="text-gray-400 mb-6">
        {filtered.length} de {projects.length} repositórios
      </p>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Nenhum projeto encontrado.
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1"
          }`}
        >
          {paginated.map((p) => (
            <div
              key={p.id_projects}
              className="bg-[#1a1f2e] p-6 rounded-2xl border border-gray-800 hover:border-blue-500/40 transition-all shadow-xl flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {p.name}
                  </h3>

                  <p className="text-gray-400 text-sm line-clamp-3 mt-2">
                    {p.description || "Sem descrição"}
                  </p>

                  <div className="flex gap-3 text-sm text-gray-500 mt-3">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {p.author || "Desconhecido"}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Atualizado em{" "}
                      {new Date(p.updatedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                <StatusBadge status={p.status} />
              </div>

              {/* STATUS PROCESSING */}
              {p.status === "processing" && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${p.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-300">
                    {p.progress || 0}%
                  </span>
                </div>
              )}

              {/* AÇÕES */}
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-800/50">
                <a
                  href={p.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#2a3142] hover:bg-[#384054] text-gray-300 py-2.5 rounded-lg"
                >
                  <Code className="w-4 h-4" /> Ver Código
                </a>

                <button
                  onClick={() =>
                    navigate(`/project/${p.id_projects}/documentation`)
                  }
                  className="flex items-center justify-center gap-2 w-full bg-[#2a3142] hover:bg-[#384054] text-gray-300 py-2.5 rounded-lg"
                >
                  <FileText className="w-4 h-4" /> Documentação
                </button>

                <button
                  onClick={() => openDeleteModal(p.id_projects)}
                  className="flex items-center justify-center gap-2 w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2.5 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINAÇÃO */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300"
            >
              {[6, 10, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#1a1f2e] border border-gray-700 text-gray-300 disabled:opacity-40"
            >
              <ChevronLeft />
            </button>

            <span className="text-gray-300 text-sm">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#1a1f2e] border border-gray-700 text-gray-300 disabled:opacity-40"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={deleteProject}
      />

      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg("")}
        />
      )}
    </div>
  );
}
