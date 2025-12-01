// src/components/ModalAddRepo.jsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import api from "../services/api";

export default function ModalAddRepo({ isOpen, onClose, onProjectAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    repositoryUrl: "",
    description: "",
    language: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpar erro ao digitar
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log('📤 Enviando projeto:', formData);
      
      // 1. Fazer requisição ao backend
      const { data } = await api.post("/api/projects", formData);
      
      console.log('✅ Projeto criado:', data);
      
      // 2. ✅ CHAMAR callback com os dados (Dashboard fecha o modal)
      if (onProjectAdded) {
        onProjectAdded(data);
      }
      
      // 3. ✅ Limpar formulário APÓS sucesso
      setFormData({ 
        name: "", 
        repositoryUrl: "", 
        description: "", 
        language: "" 
      });

      // ❌ NÃO CHAMAR onClose() aqui!
      // O Dashboard já fecha o modal via handleProjectAdded
      
    } catch (error) {
      console.error("❌ Erro ao adicionar projeto:", error);
      
      // Mensagem de erro amigável
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError("Dados inválidos. Verifique os campos.");
      } else if (error.response?.status === 409) {
        setError("Este repositório já foi adicionado.");
      } else if (error.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else {
        setError("Erro ao adicionar projeto. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para fechar e limpar
  const handleClose = () => {
    if (!loading) {
      setFormData({ 
        name: "", 
        repositoryUrl: "", 
        description: "", 
        language: "" 
      });
      setError("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            // Fechar ao clicar no backdrop (fora do modal)
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="bg-[#121826]/90 border border-white/10 shadow-2xl rounded-2xl p-8 w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()} // Impedir fechar ao clicar no modal
          >
            {/* Botão Fechar */}
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition disabled:opacity-50"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold text-white mb-6">
              Adicionar Repositório
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Nome do Projeto */}
              <div>
                <label className="text-gray-300 text-sm block mb-1">
                  Nome do Projeto *
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Ex: Meu Projeto"
                  className="w-full bg-[#0f1419]/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-600"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-gray-300 text-sm block mb-1">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                  placeholder="Descreva o que o projeto faz..."
                  className="w-full bg-[#0f1419]/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition resize-none disabled:opacity-50 placeholder-gray-600"
                />
              </div>

              {/* URL do Repositório */}
              <div>
                <label className="text-gray-300 text-sm block mb-1">
                  URL do Repositório *
                </label>
                <input
                  name="repositoryUrl"
                  type="url"
                  value={formData.repositoryUrl}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="https://github.com/usuario/repo"
                  className="w-full bg-[#0f1419]/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Suportamos GitHub, GitLab e Bitbucket
                </p>
              </div>

              {/* Linguagem */}
              <div>
                <label className="text-gray-300 text-sm block mb-1">
                  Linguagem Principal
                </label>
                <input
                  name="language"
                  type="text"
                  value={formData.language}
                  onChange={handleChange}
                  placeholder="Ex: JavaScript, Python..."
                  disabled={loading}
                  className="w-full bg-[#0f1419]/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 placeholder-gray-600"
                />
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gray-700/60 hover:bg-gray-600 text-white rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={loading || !formData.name.trim() || !formData.repositoryUrl.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar Projeto"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}