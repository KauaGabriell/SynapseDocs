import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, ChevronDown, ChevronRight,
  Copy, Check, Download, Tag, MessageSquare
} from "lucide-react";
import api from "../services/api";
import ProjectChat from "../components/ProjectChat";

/* ======================================================
   Estilos dos Métodos HTTP
====================================================== */
const methodStyles = {
  GET: "bg-blue-500 text-white",
  POST: "bg-green-600 text-white",
  PUT: "bg-yellow-600 text-white",
  PATCH: "bg-purple-600 text-white",
  DELETE: "bg-red-600 text-white",
  DEFAULT: "bg-gray-600 text-white",
};

/* ======================================================
   Estilos dos Status HTTP
====================================================== */
const statusStyles = {
  2: "bg-green-400/10 text-green-400 border-green-400/20",
  3: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  4: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  5: "bg-red-400/10 text-red-400 border-red-400/20",
  DEFAULT: "bg-gray-400/10 text-gray-400 border-gray-400/20",
};

/* ======================================================
   Resolve $ref automaticamente
====================================================== */
function resolveSchema(schema, components) {
  if (!schema) return schema;

  if (schema.$ref) {
    const refName = schema.$ref.replace("#/components/schemas/", "");
    return resolveSchema(components?.[refName], components);
  }

  if (schema.type === "object" && schema.properties) {
    const resolved = { ...schema, properties: {} };
    for (const key in schema.properties) {
      resolved.properties[key] = resolveSchema(schema.properties[key], components);
    }
    return resolved;
  }

  if (schema.type === "array" && schema.items) {
    return { ...schema, items: resolveSchema(schema.items, components) };
  }

  return schema;
}

/* ======================================================
   Página Principal
====================================================== */
export default function DocumentationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get(`/api/projects/${id}`);
        setProject(response.data);

        const content = response.data.documentation?.content;
        setDoc(content);

        const tags = extractTags(content);
        setSelectedTag(tags[0]);
      } catch (error) {
        console.error("Erro ao buscar documentação:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const extractTags = (doc) => {
    if (!doc?.paths) return [];
    const tags = new Set();

    Object.values(doc.paths).forEach((methods) => {
      Object.values(methods).forEach((op) => {
        if (op.tags) op.tags.forEach((t) => tags.add(t));
        else tags.add("Geral");
      });
    });

    return Array.from(tags);
  };

  const handleExport = () => {
    const text = JSON.stringify(doc, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${project?.name}-openapi.json`;
    anchor.click();
  };

  if (loading)
    return <div className="flex items-center justify-center h-screen text-gray-400">Carregando...</div>;

  if (!doc)
    return <div className="flex items-center justify-center h-screen text-red-400">Documentação não encontrada.</div>;

  const tags = extractTags(doc);

  return (
    <div className="flex h-screen bg-[#0f1419] text-white overflow-hidden">

      {/* =====================================================
          SIDEBAR MINIMALISTA
      ===================================================== */}
      <aside className="w-72 bg-[#16181D] border-r border-[#2C2C3C] flex flex-col">

        {/* Cabeçalho */}
        <div className="p-6 border-b border-[#2C2C3C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7C5DFA] rounded-lg flex items-center justify-center font-bold">
              {project?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-sm font-semibold truncate">{project?.name}</h1>
              <p className="text-xs text-gray-500">v{doc.info?.version}</p>
            </div>
          </div>
        </div>

        {/* Search input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar endpoints…"
              className="w-full bg-[#0F1216] border border-[#2C2C3C] rounded-lg text-sm pl-9 pr-3 py-2 focus:border-[#7C5DFA] outline-none"
            />
          </div>
        </div>

        {/* Lista de Tags (botões minimalistas) */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">

          {tags.map((tag) => {
            const active = tag === selectedTag;

            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`
                  flex items-center justify-between w-full px-3 py-2 rounded-md border
                  transition-all text-sm
                  ${active
                    ? "border-[#7C5DFA] text-[#7C5DFA]"
                    : "border-transparent text-gray-400 hover:border-gray-700 hover:text-white"}
                `}
              >
                <div className="flex items-center gap-2">
                  <Tag size={14} /> {tag}
                </div>
              </button>
            );
          })}

        </nav>

        {/* Botões inferiores */}
        <div className="p-4 border-t border-[#2C2C3C] space-y-2">
          <button
            onClick={() => setChatOpen(true)}
            className="w-full py-2 bg-[#7C5DFA] hover:bg-[#6C4FE0] rounded-lg text-white flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare size={16} /> Chat com IA
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-2 bg-[#0F1216] rounded-lg border border-[#2C2C3C] hover:bg-[#1A1D23] text-gray-300 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <button
            onClick={handleExport}
            className="w-full py-2 bg-[#0F1216] rounded-lg border border-[#2C2C3C] hover:bg-[#1A1D23] text-gray-300 flex items-center justify-center gap-2"
          >
            <Download size={16} /> Exportar OpenAPI
          </button>
        </div>

      </aside>

      {/* =====================================================
          ÁREA PRINCIPAL
      ===================================================== */}
      <main className="flex-1 overflow-y-auto p-10">

        {/* Título do grupo de endpoints */}
        <div className="max-w-4xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <Tag size={22} className="text-[#7C5DFA]" />
            {selectedTag}
          </h2>
          <p className="text-gray-500 text-sm">
            Endpoints relacionados ao grupo "{selectedTag}"
          </p>
        </div>

        {/* Lista de endpoints */}
        <div className="max-w-4xl mx-auto space-y-5">
          {Object.entries(doc.paths).map(([path, methods]) =>
            Object.entries(methods).map(([method, details]) => {
              const isSelected =
                details.tags?.includes(selectedTag) ||
                (!details.tags && selectedTag === "Geral");

              if (!isSelected) return null;

              if (
                !path.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !details.summary?.toLowerCase().includes(searchTerm.toLowerCase())
              )
                return null;

              return (
                <EndpointCard
                  key={method + path}
                  method={method.toUpperCase()}
                  path={path}
                  details={details}
                  components={doc.components?.schemas}
                />
              );
            })
          )}
        </div>

      </main>

      {/* =====================================================
          CHAT IA (Componente importado)
      ===================================================== */}
      <ProjectChat 
        projectId={id} 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
      />

    </div>
  );
}

/* ======================================================
   Card dos endpoints
====================================================== */
function EndpointCard({ method, path, details, components }) {
  const [open, setOpen] = useState(false);
  const methodColor = methodStyles[method] || methodStyles.DEFAULT;

  return (
    <div className="rounded-xl bg-[#16181D] border border-[#2C2C3C]">

      {/* Cabeçalho */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-[#1D1F26] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-md text-xs font-medium ${methodColor}`}>
            {method}
          </span>

          <span className="font-mono text-gray-300 text-sm">{path}</span>
        </div>

        {open ? (
          <ChevronDown size={18} className="text-gray-500" />
        ) : (
          <ChevronRight size={18} className="text-gray-500" />
        )}
      </button>

      {/* Conteúdo expandido */}
      {open && (
        <div className="px-6 py-6 border-t border-[#2C2C3C] bg-[#111318] space-y-8">

          <p className="text-gray-300 text-sm">{details.description}</p>

          {/* Request Body */}
          {details?.requestBody?.content?.["application/json"]?.schema && (
            <JsonPreview
              title="Corpo da Requisição"
              schema={resolveSchema(
                details.requestBody.content["application/json"].schema,
                components
              )}
            />
          )}

          {/* Responses */}
          <div>
            <h3 className="text-xs text-gray-500 uppercase mb-3 font-semibold">Respostas</h3>

            {Object.entries(details.responses).map(([status, r]) => {
              const style = statusStyles[status[0]] || statusStyles.DEFAULT;

              return (
                <div
                  key={status}
                  className="border border-[#2C2C3C] rounded-lg bg-[#0F1216] mb-4"
                >
                  <div className="px-4 py-2 border-b border-[#2C2C3C] flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 border rounded font-medium ${style}`}>
                      {status}
                    </span>
                    <span className="text-xs text-gray-400">{r.description}</span>
                  </div>

                  {r?.content?.["application/json"]?.schema && (
                    <JsonPreview
                      schema={resolveSchema(
                        r.content["application/json"].schema,
                        components
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================================================
   JSON Viewer
====================================================== */
function JsonPreview({ title, schema }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(schema.example || schema, null, 2);

  const copy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      {title && <h3 className="text-xs text-gray-500 uppercase mb-2 font-semibold">{title}</h3>}
      <div className="rounded-lg bg-[#0F1216] border border-[#2C2C3C] overflow-hidden">
        <div className="px-4 py-2 bg-[#131720] border-b border-[#2C2C3C] flex justify-between items-center">
          <span className="text-gray-500 text-xs font-mono">application/json</span>
          <button 
            onClick={copy} 
            className="text-gray-500 hover:text-white flex items-center gap-1 text-xs transition-colors"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>

        <pre className="p-4 text-[11px] text-gray-300 overflow-x-auto font-mono">
          {json}
        </pre>
      </div>
    </div>
  );
}