import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Ícone do usuário */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#1a1f2e] border border-gray-800 text-gray-300 hover:text-white transition-all"
      >
        <User className="w-6 h-6" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1a1f2e] border border-gray-800 rounded-xl shadow-xl z-30 animate-fade-in overflow-hidden">

          <button
            onClick={() => navigate("/profile")}
            className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 transition-all"
          >
            Meu Perfil
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all"
          >
            Sair
          </button>

        </div>
      )}
    </div>
  );
}
