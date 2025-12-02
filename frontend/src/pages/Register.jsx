// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Github, BrainCircuit } from 'lucide-react'; // Usando ícone do Lucide como Logo provisório
import axios from 'axios';
import Logo from '../assets/imgs/logo.png'

// --- 🛠️ MOCK DO SERVIÇO DE API (Para funcionar neste ambiente) ---
// No seu projeto real, mantenha o import api from '../services/api';
const baseURL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, ''); // Ajuste conforme necessário

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// ------------------------------------------------------------------

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // ✅ Rota ajustada para /signup para evitar bloqueadores de anúncio
      const { data } = await api.post('/api/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('token', data.token);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Erro no registro:', error);
      const message = error.response?.data?.message || 'Erro ao criar conta';

      setErrors({
        submit: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1419]">
      <div className="w-full max-w-[420px] rounded-2xl bg-[#1a1f2e]/80 backdrop-blur-xl p-8 shadow-2xl border border-gray-800">
        {/* Logo e Título */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            {/* Substituído imagem local por ícone para preview */}
            <img src={Logo} alt="Logo SynapseDocs" className='h-16 w-16'/>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">SynapseDocs</h1>
          <p className="text-xs text-gray-400 text-center">
            Crie sua conta e comece a documentar suas APIs
          </p>
        </div>

        {/* Mensagem de erro global */}
        {errors.submit && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/50 px-4 py-3 animate-pulse">
            <p className="text-sm text-red-400 font-medium text-center">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nome
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Seu nome"
              className={`w-full rounded-lg border ${
                errors.username
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-700/50 focus:border-purple-500'
              } bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200`}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-400">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="dev@exemplo.com"
              className={`w-full rounded-lg border ${
                errors.email
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-700/50 focus:border-purple-500'
              } bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full rounded-lg border ${
                errors.password
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-700/50 focus:border-purple-500'
              } bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full rounded-lg border ${
                errors.confirmPassword
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-700/50 focus:border-purple-500'
              } bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-linear-to-r from-purple-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Criando conta...
              </span>
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="my-6 flex items-center relative">
          <div className="flex-1 border-t border-gray-700/50"></div>
          <span className="mx-3 text-[10px] tracking-widest text-gray-500 font-bold uppercase bg-[#1a1f2e] px-2 z-10">
            ou continue com
          </span>
          <div className="flex-1 border-t border-gray-700/50"></div>
        </div>

        {/* Botão GitHub */}
        <a
          href={`${baseURL}/api/auth/github`}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#0f1419] border border-gray-700/50 py-2.5 text-sm text-gray-300 font-medium hover:bg-white hover:text-black hover:border-white transition-all duration-300 mb-6 group"
        >
          <Github className="h-4 w-4 group-hover:text-black transition-colors" />
          <span>GitHub</span>
        </a>

        {/* Link para login */}
        <div className="text-center text-sm text-gray-400">
          Já tem uma conta?{' '}
          <Link
            to="/"
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium hover:underline"
          >
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
