import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import api from "../services/api";

export default function ModalAddRepo({ isOpen, onClose, onProjectAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    repositoryUrl: "",
    description: "",
    language: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/projects", formData);
      await onProjectAdded?.();
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar projeto:", error);
      alert("Erro ao adicionar projeto. Veja o console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="bg-[#121826]/90 border border-white/10 shadow-2xl rounded-2xl p-8 w-full max-w-lg relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold text-white mb-6">
              Adicionar Repositório
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-gray-300 text-sm block mb-1">
                  Nome do Projeto
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f1419]/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-1">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-[#0f1419]/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-1">
                  URL do Repositório
                </label>
                <input
                  name="repositoryUrl"
                  type="url"
                  value={formData.repositoryUrl}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f1419]/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-1">
                  Linguagem
                </label>
                <input
                  name="language"
                  type="text"
                  value={formData.language}
                  onChange={handleChange}
                  placeholder="Ex: JavaScript, Python..."
                  className="w-full bg-[#0f1419]/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gray-700/60 hover:bg-gray-600 text-white rounded-xl transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition disabled:opacity-50"
                >
                  {loading ? "Adicionando..." : "Adicionar"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
