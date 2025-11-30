// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import Logo from '../assets/imgs/Logo.png';

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
      const response = await fetch('http://localhost:3030/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      // Salva o token no localStorage
      localStorage.setItem('token', data.token);

      // Redireciona para o dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrors({
        submit: error.message || 'Erro ao criar conta',
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
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1419]">
      <div className="w-full max-w-[420px] rounded-2xl bg-[#1a1f2e]/80 backdrop-blur-xl p-8">
        {/* Logo e Título */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-18 w-18 items-center justify-center rounded-xl">
            <img src={Logo} alt="Logo SynapseDocs" className="h-18 w-18" />
            <h1 className="text-2xl font-bold text-white mb-1">SynapseDocs</h1>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Crie sua conta e comece a documentar suas APIs
          </p>
        </div>

        {/* Mensagem de erro */}
        {errors.submit && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/50 px-4 py-3">
            <p className="text-sm text-red-400">{errors.submit}</p>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-3 mb-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Nome</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Seu nome"
              className={`w-full rounded-lg border ${
                errors.username ? 'border-red-500' : 'border-gray-700/50'
              } bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors`}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-400">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="dev@exemplo.com"
              className={`w-full rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-700/50'
              } bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-gray-700/50'
              } bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full rounded-lg border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-700/50'
              } bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors`}
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
            className="w-full rounded-lg bg-linear-to-r from-[#7c3aed] to-[#3b82f6] py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        {/* Divisor */}
        <div className="my-5 flex items-center">
          <div className="flex-1 border-t border-gray-700/50"></div>
          <span className="mx-3 text-xs text-gray-500 font-medium">
            OU CONTINUE COM
          </span>
          <div className="flex-1 border-t border-gray-700/50"></div>
        </div>

        {/* Botão GitHub */}
        <a
          href="http://localhost:3030/api/auth/github"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#0f1419] border border-gray-700/50 py-2.5 text-sm text-gray-300 font-medium hover:bg-gray-800/50 hover:border-gray-600 transition-all mb-5"
        >
          <Github className="h-4 w-4" />
          <span>GitHub</span>
        </a>

        {/* Link para login */}
        <div className="text-center text-xs text-gray-400">
          Já tem uma conta?{' '}
          <Link
            to="/"
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;