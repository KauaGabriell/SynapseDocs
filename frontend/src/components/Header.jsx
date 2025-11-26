import { Bell, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Header({ onAddRepo }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="w-full backdrop-blur-md bg-[#131720]/80 border-b border-[#2C2C3C] flex items-center justify-between px-8 h-16 shadow-[0_2px_10px_rgba(0,0,0,0.3)] relative z-[50]">
      <div className="flex flex-col justify-center">
        <h1 className="text-white text-base font-semibold">Dashboard</h1>
        <p className="text-[#B0B0C3] text-sm">
          Gerencie seus repositórios e documentações
        </p>
      </div>

      <div className="flex items-center gap-6 relative">
        {/* Notificações */}
        <div className="relative">
          <Bell className="w-5 h-5 text-[#B0B0C3] hover:text-white cursor-pointer transition-colors" />
          <span className="absolute -top-1 -right-1 bg-[#DC3545] text-white text-[10px] font-semibold px-[5px] py-px rounded-full">
            1
          </span>
        </div>

        {/* User + Dropdown */}
        <div className="relative" ref={menuRef}>
          <User
            onClick={() => setOpen(!open)}
            className="w-6 h-6 text-[#B0B0C3] hover:text-white cursor-pointer transition-all"
          />

          {open && (
            <div
              className="absolute right-0 mt-3 w-44 bg-[#1C1F2A]
              border border-[#2C2C3C] rounded-xl shadow-xl z-9999
              animate-fadeIn p-2"
            >
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                  }}
                  className="px-3 py-2 text-sm text-left text-white hover:bg-[#2A2F3D] rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botão */}
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
