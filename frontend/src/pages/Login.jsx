import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Gitlab, GitBranch } from 'lucide-react';
import Logo from '../assets/imgs/Logo.png';

function Login() {
  const navigate = useNavigate(); 

  useEffect(() => {
    const token = localStorage.getItem('token'); 
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]); // Adicionar 'navigate' às dependências

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login com e-mail (não implementado no MVP)');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1419]">
      
      {/* Card Principal */}
      <div className="w-full max-w-[420px] rounded-2xl bg-[#1a1f2e]/80 backdrop-blur-xl p-8">
        
        {/* Logo e Título */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-18 w-18 items-center justify-center rounded-xl">
            <img src={Logo} alt="Ícone de Cérebro" className='h-18 w-18'/>
          <h1 className="text-2xl font-bold text-white mb-1">SynapseDocs</h1>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Documentação de API gerada por IA a partir do seu repositório
          </p>
        </div>

        {/* Campos de Login */}
        <div className="space-y-3 mb-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="dev@exemplo.com"
              className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-700/50 bg-[#0f1419] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Botão de Entrar */}
        <button
          onClick={handleSubmit}
          className="w-full rounded-lg bg-linear-to-r from-[#7c3aed] to-[#3b82f6] py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          Entrar
        </button>

        {/* Divisor */}
        <div className="my-5 flex items-center">
          <div className="flex-1 border-t border-gray-700/50"></div>
          <span className="mx-3 text-xs text-gray-500 font-medium">
            OU CONTINUE COM
          </span>
          <div className="flex-1 border-t border-gray-700/50"></div>
        </div>

        {/* Botões de Login Social - Grid 2x2 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <a
            href="http://localhost:3030/api/auth/github"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0f1419] border border-gray-700/50 py-2.5 text-sm text-gray-300 font-medium hover:bg-gray-800/50 hover:border-gray-600 transition-all"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
          
          <button
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0f1419] border border-gray-700/50 py-2.5 text-sm text-gray-300 font-medium hover:bg-gray-800/50 hover:border-gray-600 transition-all"
          >
            <Gitlab className="h-4 w-4" />
            <span>GitLab</span>
          </button>

          <button
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0f1419] border border-gray-700/50 py-2.5 text-sm text-gray-300 font-medium hover:bg-gray-800/50 hover:border-gray-600 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>Bitbucket</span>
          </button>

          <button
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0f1419] border border-gray-700/50 py-2.5 text-sm text-gray-300 font-medium hover:bg-gray-800/50 hover:border-gray-600 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* Links no rodapé */}
        <div className="flex justify-center gap-4 text-xs text-gray-400">
          <a href="#" className="hover:text-purple-400 transition-colors">
            Esqueci minha senha
          </a>
          <span>·</span>
          <a href="/register" className="hover:text-purple-400 transition-colors">
            Não tem uma conta?
          </a>
        </div>

      </div>
    </div>
  );
}

export default Login;