import {
  FolderGit2,
  PlusCircle,
  FileText,
  MessageSquare,
  Settings,
  Zap,
} from "lucide-react";
import Logo from "../assets/imgs/logo.png";

export default function Sidebar({ onAddRepo }) {
  return (
    <aside className="w-64 bg-[#16181D] text-white flex flex-col justify-between p-4 border-r border-[#2C2C3C] min-h-screen">
      <div>
        <div className="flex items-center gap-2 mb-10">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold">
            <img src={Logo} alt="Logo" className="w-14 h-14 mt-2" />
          </div>
          <div>
            <h2 className="text-white font-semibold">SynapseDocs</h2>
            <p className="text-[#B0B0C3] text-xs">API Documentation</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem
            icon={<FolderGit2 />}
            label="Projetos"
            sub="Todos os repositórios"
            active
          />
          <SidebarItem
            icon={<PlusCircle />}
            label="Novo Repositório"
            sub="Adicionar repositório"
            onClick={onAddRepo}
          />
          <SidebarItem
            icon={<FileText />}
            label="Documentação"
            sub="Visualizar docs geradas"
          />
          <SidebarItem
            icon={<Settings />}
            label="Configurações"
            sub="Preferências do sistema"
          />
        </nav>
      </div>

      <div className="bg-[#121212] p-3 rounded-xl mt-6 border border-[#2C2C3C]">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="text-[#7C5DFA] w-4 h-4" />
          <span className="text-sm font-medium text-white">IA Ativa</span>
        </div>
        <p className="text-xs text-[#B0B0C3] leading-snug">
          Processamento automático de documentação ativo.
        </p>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, sub, active = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-0.5 px-3 py-2 rounded-lg cursor-pointer transition-all ${
        active
          ? "bg-[#2C2C3C] text-white"
          : "text-[#B0B0C3] hover:bg-[#2C2C3C]/60 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 mr-4">{icon}</div>
        <span className="font-medium text-sm">{label}</span>
      </div>
      <span className="text-xs text-[#8A8AAE] ml-10">{sub}</span>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#16181D] text-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b border-[#2C2C3C]">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#B0B0C3] hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export { SidebarItem, Modal };
