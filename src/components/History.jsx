import React, { useMemo } from 'react';

export default function History({ setAppStage, historyPairs, femaleRoster, selectedHistorySession, setSelectedHistorySession }) {
  
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

  const formatLabel = (val) => {
    if (!val) return '';
    if (val.includes('T')) {
      const d = new Date(val);
      return `${d.toLocaleDateString('pt-BR')} as ${d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    }
    return val;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-brandRed">Historico de Sorteios</h2>
        <button onClick={() => setAppStage('setup')} className="bg-gray-600 text-white px-4 py-2 rounded font-bold hover:bg-gray-700 transition duration-300">
          Voltar ao Inicio
        </button>
      </div>

      <div className="mb-8 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
        <label className="font-bold text-gray-700 mr-4">Selecione o Evento:</label>
        <select 
          className="border border-gray-300 rounded p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brandRed font-medium text-gray-800"
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
