import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('admin@example.com'); // Já preenchido pra facilitar
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Chama o backend
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      });
      
      // Salva no contexto e redireciona
      login(response.data.user, response.data.access_token);
      navigate('/');
    } catch (err) {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-500 mb-2">GDASH</h1>
          <p className="text-slate-400">Entre para acessar o painel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2 text-sm">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                type="email"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 text-white focus:outline-none focus:border-blue-500 transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                type="password"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 text-white focus:outline-none focus:border-blue-500 transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}