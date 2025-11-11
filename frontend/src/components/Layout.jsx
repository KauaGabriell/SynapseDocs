import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ModalAddRepo from "../components/ModalAddRepo";
import api from "../services/api";

export default function Layout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/api/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f1419] text-white">
      <Sidebar onAddRepo={() => setIsModalOpen(true)} />

      <div className="flex-1 flex flex-col">
        <Header onAddRepo={() => setIsModalOpen(true)} />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet context={{ projects, fetchProjects, loading }} />
        </main>
      </div>

      <ModalAddRepo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectAdded={fetchProjects}
      />
    </div>
  );
}
