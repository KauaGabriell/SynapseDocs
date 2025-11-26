import React from "react";
import { User, Calendar, FileText, Code } from "lucide-react";

export default function ProjectCard({ project, viewMode = "grid", onOpenDocs, onDelete }) {
  return (
    <article
      className={`bg-[#1a1f2e] rounded-2xl p-6 border border-gray-800 hover:border-blue-500/50 transition-all shadow-lg flex flex-col ${
        viewMode === "list" ? "md:flex-row md:items-start" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-3 gap-4">
          {/* title */}
          <h3 className="text-lg font-semibold line-clamp-1 max-w-[70%] wrap-break-word">
            {project.name}
          </h3>

          {/* status badge */}
          <div className="shrink-0">
            <StatusBadgeInline status={project.status} />
          </div>
        </div>

        {/* description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description || "Sem descrição"}
        </p>

        <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="truncate">{project.author || "Desconhecido"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="truncate">
              Atualizado em {new Date(project.updatedAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      </div>

      {/* ALTERAÇÃO AQUI: 
        Adicionado 'md:flex-col' quando viewMode é 'list'.
        Isso empilha os botões verticalmente na lateral em vez de espremê-los numa linha.
      */}
      <div 
        className={`mt-2 flex gap-2 ${
          viewMode === "list" 
            ? "md:mt-0 md:ml-6 md:shrink-0 md:w-40 md:flex-col" 
            : ""
        }`}
      >
        <a
          href={project.repositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#2a3142] hover:bg-[#384054] text-gray-300 font-medium py-2 px-2 rounded-lg transition text-sm"
        >
          <Code className="w-4 h-4" /> Ver Código
        </a>

        <button
          onClick={onOpenDocs}
          className="flex-1 flex items-center justify-center gap-2 bg-[#2a3142] hover:bg-[#384054] text-gray-300 font-medium py-2 px-2 rounded-lg transition text-sm"
          aria-label={`Abrir documentação de ${project.name}`}
        >
          <FileText className="w-4 h-4" /> Docs
        </button>

        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium py-2 px-2 rounded-lg transition text-sm flex-1 md:flex-none md:h-10" // Ajuste opcional para altura no modo lista
          aria-label={`Excluir ${project.name}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7zm3-4h6l1 1h3v2H3V4h3l1-1z" />
          </svg>
        </button>
      </div>
    </article>
  );
}

function StatusBadgeInline({ status }) {
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
}