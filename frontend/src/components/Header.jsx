import { Bell, User } from "lucide-react";

export default function Header({ onAddRepo }) {
  return (
    <header className="w-full backdrop-blur-md bg-[#131720]/80 border-b border-[#2C2C3C] flex items-center justify-between px-8 h-16 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col justify-center">
        <h1 className="text-white text-base font-semibold">Dashboard</h1>
        <p className="text-[#B0B0C3] text-sm">
          Gerencie seus repositórios e documentações
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Bell className="w-5 h-5 text-[#B0B0C3] hover:text-white cursor-pointer transition-colors" />
          <span className="absolute -top-1 -right-1 bg-[#DC3545] text-white text-[10px] font-semibold px-[5px] py-px rounded-full">
            1
          </span>
        </div>

        <User className="w-5 h-5 text-[#B0B0C3] hover:text-white cursor-pointer transition-colors" />

        <button
          onClick={onAddRepo}
          className="flex items-center justify-center gap-2 bg-linear-to-r from-[#7C5DFA] to-[#5E4BFA] text-white font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-[0_0_12px_rgba(124,93,250,0.4)]"
        >
          + Adicionar Repositório
        </button>
      </div>
    </header>
  );
}
