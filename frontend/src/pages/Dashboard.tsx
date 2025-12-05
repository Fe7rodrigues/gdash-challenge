import { useEffect, useState } from 'react';
import axios from 'axios';
import { Wind, Droplets, Thermometer, CloudRain, FileSpreadsheet, FileText, Sparkles, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Importar Auth

interface WeatherLog {
  _id: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  timestamp: string;
  insight?: string;
}

export function Dashboard() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout, user } = useAuth(); // Hook de Auth

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/weather/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await axios.post('http://localhost:3000/api/weather/refresh');
      await fetchData();
    } catch (error) {
      alert("Erro ao atualizar dados.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const downloadCsv = () => { window.location.href = 'http://localhost:3000/api/weather/export/csv'; };
  const downloadXlsx = () => { window.location.href = 'http://localhost:3000/api/weather/export/xlsx'; };

  const current = logs[0];

  return (
    <div className="min-h-screen p-8 font-sans bg-slate-950 text-slate-50">
      {/* Header com Logout */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">GDASH Weather ⛈️</h1>
          <p className="text-slate-400">Olá, <span className="text-white font-bold">{user?.name}</span></p>
        </div>
        
        <div className="flex gap-3 flex-wrap items-center">
          <button onClick={handleManualRefresh} disabled={refreshing} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition shadow-lg">
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "..." : "Atualizar"}
          </button>

          <div className="w-px h-10 bg-slate-800 mx-2 hidden md:block"></div>

          <button onClick={downloadCsv} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-slate-700" title="CSV">
            <FileText size={20} />
          </button>
          <button onClick={downloadXlsx} className="bg-green-800 hover:bg-green-700 text-white p-2 rounded-lg border border-green-900" title="Excel">
            <FileSpreadsheet size={20} />
          </button>
          
          <button onClick={logout} className="ml-2 flex items-center gap-2 text-red-400 hover:text-red-300 transition">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </header>

      {/* ... (O resto do Dashboard continua igual) ... */}
      {loading ? (
        <div className="flex justify-center p-12"><p className="animate-pulse">Carregando...</p></div>
      ) : !current ? (
        <p>Aguardando dados...</p>
      ) : (
        <>
          <div className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 border border-violet-700/50 p-6 rounded-2xl mb-8 flex items-start gap-4 shadow-xl">
            <div className="bg-violet-600 p-3 rounded-full shrink-0"><Sparkles className="text-white" size={24} /></div>
            <div>
              <h3 className="font-bold text-violet-200 mb-1">Análise da IA</h3>
              <p className="text-lg text-white font-medium">{current.insight || "Sem insights no momento."}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-2"><Thermometer className="text-orange-500" /><span className="text-slate-400">Temp</span></div>
              <p className="text-3xl font-bold">{current.temperature}°C</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-2"><Droplets className="text-blue-500" /><span className="text-slate-400">Umidade</span></div>
              <p className="text-3xl font-bold">{current.humidity}%</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-2"><Wind className="text-gray-400" /><span className="text-slate-400">Vento</span></div>
              <p className="text-3xl font-bold">{current.wind_speed} km/h</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-2"><CloudRain className="text-purple-500" /><span className="text-slate-400">Condição</span></div>
              <p className="text-xl font-bold">{current.condition}</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-slate-200">Histórico</h2>
          <div className="overflow-x-auto bg-slate-900 rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-200">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Temp</th>
                  <th className="px-6 py-4">Umidade</th>
                  <th className="px-6 py-4">Insight</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-800">
                    <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4">{log.temperature}°C</td>
                    <td className="px-6 py-4">{log.humidity}%</td>
                    <td className="px-6 py-4 truncate max-w-xs">{log.insight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}