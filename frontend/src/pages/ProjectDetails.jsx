import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';


export default function ProjectDetails() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/api/projects/${id}/documentation`);
        setDoc(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Erro ao carregar documentação');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="text-gray-400">Carregando documentação...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{doc.info?.title || `Projeto ${id}`}</h1>
        <div className="flex gap-2">
          <a
            href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3030'}/api/projects/${id}/documentation`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-[#2a3142] rounded-lg text-sm"
          >
            Abrir raw JSON
          </a>
          <a
            href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(doc, null, 2))}`}
            download={`${doc.info?.title || 'openapi'}.json`}
            className="px-3 py-2 bg-[#2a3142] rounded-lg text-sm"
          >
            Baixar JSON
          </a>
        </div>
      </div>

      {/* QUICK VIEW: pretty JSON */}
      <pre className="bg-[#0b0f14] p-4 rounded-md overflow-auto text-xs" style={{ maxHeight: '70vh' }}>
        {JSON.stringify(doc, null, 2)}
      </pre>

      {/* FUTURO: aqui você pode renderizar Redoc/Swagger UI */}
      <div className="text-sm text-gray-400">
        Dica: para visualização rica, integre Redoc ou swagger-ui (posso gerar o componente).
      </div>
    </div>
  );
}
