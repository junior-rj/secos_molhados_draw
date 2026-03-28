import React, { useState, useMemo } from 'react';

export default function History({ setAppStage, historyPairs, femaleRoster, selectedHistorySession, setSelectedHistorySession, handleDeleteByDate }) {
  
  const [showDeleteAdmin, setShowDeleteAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [dateToDelete, setDateToDelete] = useState('');

  const availableSessions = useMemo(() => {
    const uniqueSessions = [...new Set(historyPairs.map(p => p.sessionTimestamp || p.date || new Date(p.timestamp).toLocaleDateString('pt-BR')))];
    return uniqueSessions.sort((a, b) => {
      const getTime = (val) => {
        if (!val) return 0;
        if (val.includes('T')) return new Date(val).getTime();
        if (val.includes('/')) {
          const parts = val.split('/');
          if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
        }
        return 0;
      };
      return getTime(b) - getTime(a);
    });
  }, [historyPairs]);

  const availableDates = useMemo(() => {
    const uniqueDates = [...new Set(historyPairs.map(p => p.date || new Date(p.timestamp).toLocaleDateString('pt-BR')))];
    return uniqueDates.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/');
      const [dayB, monthB, yearB] = b.split('/');
      return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
    });
  }, [historyPairs]);

  const formatLabel = (val) => {
    if (!val) return '';
    if (val.includes('T')) {
      const d = new Date(val);
      return `${d.toLocaleDateString('pt-BR')} as ${d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    }
    return val;
  };

  const handleAuth = () => {
    if (password === 'excluirsm') {
      setIsAuth(true);
    } else {
      alert('Senha incorreta! Acesso negado.');
      setPassword('');
    }
  };

  const confirmDeletion = () => {
    if (!dateToDelete) return;
    if (window.confirm(`ATENCAO: Tem certeza que deseja apagar TODOS os sorteios registrados no dia ${dateToDelete}? Essa acao ira excluir os torneios masculino e feminino e nao pode ser desfeita.`)) {
      handleDeleteByDate(dateToDelete);
      setShowDeleteAdmin(false);
      setIsAuth(false);
      setPassword('');
      setDateToDelete('');
      setSelectedHistorySession(''); 
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <h2 className="text-2xl font-bold text-brandRed">Historico de Sorteios</h2>
        <div className="flex space-x-4">
          <button 
            onClick={() => {
              setShowDeleteAdmin(!showDeleteAdmin);
              setIsAuth(false);
              setPassword('');
            }} 
            className="bg-red-100 text-red-700 px-4 py-2 rounded font-bold hover:bg-red-200 transition duration-300 border border-red-200"
          >
            {showDeleteAdmin ? 'Fechar Painel' : 'Excluir Dias'}
          </button>
          <button onClick={() => setAppStage('setup')} className="bg-gray-600 text-white px-4 py-2 rounded font-bold hover:bg-gray-700 transition duration-300">
            Voltar ao Inicio
          </button>
        </div>
      </div>

      {showDeleteAdmin && (
         <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <h3 className="font-bold text-red-800 mb-4 text-lg">Painel Administrativo: Excluir Registros do Firebase</h3>
            {!isAuth ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input 
                  type="password" 
                  placeholder="Digite a senha de exclusao" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="border border-red-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto"
                />
                <button onClick={handleAuth} className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition duration-300">
                  Autenticar
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <select 
                  className="border border-red-300 rounded p-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-gray-800 w-full sm:w-auto"
                  value={dateToDelete}
                  onChange={e => setDateToDelete(e.target.value)}
                >
                  <option value="">Selecione a data para excluir</option>
                  {availableDates.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <button 
                  onClick={confirmDeletion} 
                  disabled={!dateToDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition duration-300 disabled:opacity-50"
                >
                  Confirmar Exclusao do Dia
                </button>
              </div>
            )}
         </div>
      )}

      <div className="mb-8 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
        <label className="font-bold text-gray-700 mr-4">Selecione o Evento para Visualizar:</label>
        <select 
          className="border border-gray-300 rounded p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brandRed font-medium text-gray-800 w-full md:w-auto mt-2 md:mt-0"
          value={selectedHistorySession}
          onChange={e => setSelectedHistorySession(e.target.value)}
        >
          <option value="">Escolha um evento registrado</option>
          {availableSessions.map(session => (
            <option key={session} value={session}>{formatLabel(session)}</option>
          ))}
        </select>
      </div>

      {selectedHistorySession && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="text-xl font-bold text-brandRed mb-4 text-center">Chave Feminina</h3>
            <div className="flex flex-col gap-3">
              {historyPairs.filter(p => {
                const pKey = p.sessionTimestamp || p.date || new Date(p.timestamp).toLocaleDateString('pt-BR');
                const pGender = p.gender || (femaleRoster.includes(p.player1) ? 'F' : 'M');
                return pKey === selectedHistorySession && pGender === 'F';
              }).map((pair, idx) => (
                <div key={idx} className="bg-white p-4 rounded border border-red-200 shadow-sm text-center font-bold text-gray-800">
                  {pair.player1} e {pair.player2}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Chave Masculina</h3>
            <div className="flex flex-col gap-3">
              {historyPairs.filter(p => {
                const pKey = p.sessionTimestamp || p.date || new Date(p.timestamp).toLocaleDateString('pt-BR');
                const pGender = p.gender || (femaleRoster.includes(p.player1) ? 'F' : 'M');
                return pKey === selectedHistorySession && pGender === 'M';
              }).map((pair, idx) => (
                <div key={idx} className="bg-white p-4 rounded border border-gray-300 shadow-sm text-center font-bold text-gray-800">
                  {pair.player1} e {pair.player2}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}