import { X } from "lucide-react";

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#1a1f2e] border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Deletar repositório</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Tem certeza que deseja excluir este repositório? <span className="text-red-400">Essa ação é permanente.</span>
        </p>

        <div className="flex gap-3">
          <button onClick={onClose} className="w-1/2 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition">
            Cancelar
          </button>

          <button onClick={onConfirm} className="w-1/2 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}
