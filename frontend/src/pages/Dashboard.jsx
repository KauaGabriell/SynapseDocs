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
} from "lucide-react";
import { useState } from "react";

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
  const { projects, loading } = useOutletContext();
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Carregando projetos...
      </div>
    );

  const filtered = projects.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    prontas: projects.filter((p) => p.status === "completed").length,
    processando: projects.filter((p) => p.status === "processing").length,
    erro: projects.filter((p) => p.status === "failed").length,
  };

  return (
    <div className="space-y-8">
      {/* Header de busca e botões */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar repositórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
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

          <button className="flex items-center gap-2 py-3 px-4 bg-[#1a1f2e] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800">
          <h3 className="text-3xl font-bold text-green-400 mb-1">
            {stats.prontas}
          </h3>
          <p className="text-sm text-gray-400">Documentações Prontas</p>
        </div>

        <div className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800">
          <h3 className="text-3xl font-bold text-yellow-400 mb-1">
            {stats.processando}
          </h3>
          <p className="text-sm text-gray-400">Em Processamento</p>
        </div>

        <div className="bg-[#1a1f2e] p-5 rounded-2xl border border-gray-800">
          <h3 className="text-3xl font-bold text-red-400 mb-1">{stats.erro}</h3>
          <p className="text-sm text-gray-400">Com Erro</p>
        </div>
      </div>

      {/* Lista */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Seus Projetos</h2>
        <p className="text-gray-400 mb-6">
          {filtered.length} de {projects.length} repositórios
        </p>

        {filtered.length === 0 ? (
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
            {filtered.map((p) => (
              <div
                key={p.id_projects}
                className="bg-[#1a1f2e] rounded-2xl p-6 border border-gray-800 hover:border-blue-500/50 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold truncate">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>

                  <p className="text-gray-400 text-sm mb-5 h-10">
                    {p.description || "Sem descrição"}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-5">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{p.author || "Desconhecido"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Atualizado em{" "}
                        {new Date(p.updatedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  {p.status === "processing" && (
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${p.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {p.progress || 0}%
                      </span>
                    </div>
                  )}
                </div>

                {/* BOTÕES */}
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-800/50">
                  <a
                    href={p.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#2a3142] hover:bg-[#384054] text-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors"
                  >
                    <Code className="w-4 h-4" /> Ver Código
                  </a>

                  {/* Novo botão de documentação */}
                  <button
                    onClick={() =>
                      navigate(`/project/${p.id_projects}/documentation`)
                    }
                    className="flex items-center justify-center gap-2 w-full bg-[#2a3142] hover:bg-[#384054] text-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Documentação
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
