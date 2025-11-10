import React from 'react';
import {
  FolderOpen,
  Plus,
  BookOpen,
  MessageSquare,
  Settings,
  Sparkles,
} from 'lucide-react';
import Logo from '../assets/imgs/Logo.png';

function Sidebar() {
  return (
    <div className="w-52 h-screen bg-[#0F1117] p-4 flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-14 h-14  rounded-lg flex items-center justify-center">
          <img src={Logo} alt="Logo" className="w-14 h-14" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">SynapseDocs</h1>
          <p className="text-[10px] text-gray-500">API Documentation</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1">
        {/* Active Link - Projetos */}
        <a
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#3B82F6] text-white text-sm font-medium"
        >
          <FolderOpen className="w-4 h-4" />
          <div>
            <div>Projetos</div>
            <div className="text-[10px] font-normal opacity-90">
              Gerencie seus projetos
            </div>
          </div>
        </a>

        {/* Other Links */}
        <a
          href="#"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#1A1D25] text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <div>
            <div>Novo Repositório</div>
            <div className="text-[10px] opacity-70">Adicionar repositórios</div>
          </div>
        </a>

        <a
          href="#"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#1A1D25] text-sm transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <div>
            <div>Documentação</div>
            <div className="text-[10px] opacity-70">Visualizar docs geradas</div>
          </div>
        </a>

        <a
          href="#"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#1A1D25] text-sm transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <div>
            <div>Chat com IA</div>
            <div className="text-[10px] opacity-70">Pergunte ao Código</div>
          </div>
        </a>

        <a
          href="#"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#1A1D25] text-sm transition-colors"
        >
          <Settings className="w-4 h-4" />
          <div>
            <div>Configurações</div>
            <div className="text-[10px] opacity-70">Preferências do sistema</div>
          </div>
        </a>
      </nav>

      {/* IA Status - Bottom */}
      <div className="mt-auto p-3 bg-[#1A1D25] rounded-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-[#3B82F6]" />
          <h4 className="text-sm font-semibold text-white">IA Ativa</h4>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          Processamento automático de documentação ativo. Novos commits serão
          analisados automaticamente.
        </p>
      </div>
    </div>
  );
}

export default Sidebar;