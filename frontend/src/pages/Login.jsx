import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github } from 'lucide-react';
import Logo from '../assets/imgs/Logo.png';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3030/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Erro ao fazer login');
        return;
      }

      localStorage.setItem('token', data.token);

      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com servidor');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1419]">
      <div className="w-full max-w-[420px] rounded-2xl bg-[#1a1f2e]/80 backdrop-blur-xl p-8">
        {/* LOGO + TÍTULO CENTRALIZADOS */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 justify-center mb-1">
            <img src={Logo} alt="Logo" className="h-16 w-16" />
            <h1 className="text-2xl font-bold text-white">
              Synapse<strong className="text-blue-300">Docs</strong>
            </h1>
          </div>

          <p className="text-xs text-gray-400">
            Documentação de API gerada por IA a partir do seu repositório
          </p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-3 mb-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="dev@exemplo.com"
              className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-linear-to-r from-[#7c3aed] to-[#3b82f6] py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            Entrar
          </button>
        </form>

        {/* DIVISOR */}
        <div className="my-5 flex items-center">
          <div className="flex-1 border-t border-gray-700/50"></div>
          <span className="mx-3 text-xs text-gray-500 font-medium">
            OU CONTINUE COM
          </span>
          <div className="flex-1 border-t border-gray-700/50"></div>
        </div>

        {/* SÓ GITHUB */}
        <div className="grid grid-cols-1">
          <a
            href="http://localhost:3030/api/auth/github"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0f1419] border border-gray-700/50 py-2.5 text-sm text-gray-300 font-medium hover:bg-gray-800/50 hover:border-gray-600 transition-all"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>

        {/* FOOTER LINKS */}
        <div className="flex justify-center gap-4 text-xs text-gray-400 mt-5">
          <a href="#" className="hover:text-purple-400 transition-colors">
            Esqueci minha senha
          </a>
          <span>·</span>
          <a
            href="/register"
            className="hover:text-purple-400 transition-colors"
          >
            Não tem uma conta?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
