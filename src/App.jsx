import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [femaleRoster, setFemaleRoster] = useState([]);
  const [maleRoster, setMaleRoster] = useState([]);

  const [isFirstRound, setIsFirstRound] = useState(true);

  const [presentFemales, setPresentFemales] = useState([]);
  const [presentMales, setPresentMales] = useState([]);

  const [femaleGroupA, setFemaleGroupA] = useState([]);
  const [femaleGroupB, setFemaleGroupB] = useState([]);
  const [maleGroupA, setMaleGroupA] = useState([]);
  const [maleGroupB, setMaleGroupB] = useState([]);

  const [appStage, setAppStage] = useState('setup'); 

  const [pool, setPool] = useState([]);
  const [poolA, setPoolA] = useState([]);
  const [poolB, setPoolB] = useState([]);

  const [currentPair, setCurrentPair] = useState([]);
  const [historyPairs, setHistoryPairs] = useState([]);
  const [sessionPairs, setSessionPairs] = useState([]);
  
  const [selectedHistorySession, setSelectedHistorySession] = useState('');
  const [sessionTimestamp, setSessionTimestamp] = useState('');
  
  // Novo estado para controlar a animação
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historySnapshot = await getDocs(collection(db, "drawHistory"));
        const pairs = [];
        historySnapshot.forEach((documentSnapshot) => {
          pairs.push(documentSnapshot.data());
        });
        setHistoryPairs(pairs);

        const playersSnapshot = await getDocs(collection(db, "players"));
        const females = [];
        const males = [];
        playersSnapshot.forEach((documentSnapshot) => {
          const data = documentSnapshot.data();
          if (data.gender === "F") females.push(data.name);
          if (data.gender === "M") males.push(data.name);
        });
        setFemaleRoster(females.sort());
        setMaleRoster(males.sort());
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Falha na autenticacao. Verifique as credenciais e tente novamente.");
    }
  };

  const togglePresence = (player, group, setGroup) => {
    if (group.includes(player)) {
      setGroup(group.filter(p => p !== player));
    } else {
      setGroup([...group, player]);
    }
  };

  const handleGroupSelection = (player, group, setGrpA, setGrpB, grpA, grpB) => {
    if (group === 'A') {
      if (!grpA.includes(player)) setGrpA([...grpA, player]);
      if (grpB.includes(player)) setGrpB(grpB.filter(p => p !== player));
    } else if (group === 'B') {
      if (!grpB.includes(player)) setGrpB([...grpB, player]);
      if (grpA.includes(player)) setGrpA(grpA.filter(p => p !== player));
    } else {
      if (grpA.includes(player)) setGrpA(grpA.filter(p => p !== player));
      if (grpB.includes(player)) setGrpB(grpB.filter(p => p !== player));
    }
  };

  const startDrawFemale = () => {
    if (isFirstRound) {
      if (presentFemales.length === 0) {
        alert("Selecione pelo menos duas jogadoras para iniciar o sorteio feminino.");
        return;
      }
      if (presentFemales.length % 2 !== 0) {
        alert("Garanta que a selecao feminina tenha um numero par de presentes.");
        return;
      }
      setPool([...presentFemales]);
    } else {
      if (femaleGroupA.length === 0 || femaleGroupB.length === 0) {
        alert("Selecione jogadoras para os Grupos A e B.");
        return;
      }
      if (femaleGroupA.length !== femaleGroupB.length) {
        alert("Os Grupos A e B femininos precisam ter a mesma quantidade de jogadoras.");
        return;
      }
      setPoolA([...femaleGroupA]);
      setPoolB([...femaleGroupB]);
    }
    setSessionTimestamp(new Date().toISOString());
    setAppStage('drawFemale');
  };

  const startDrawMale = () => {
    if (isFirstRound) {
      if (presentMales.length === 0) {
        alert("Selecione pelo menos dois jogadores para iniciar o sorteio masculino.");
        return;
      }
      if (presentMales.length % 2 !== 0) {
        alert("Garanta que a selecao masculina tenha um numero par de presentes.");
        return;
      }
      setPool([...presentMales]);
    } else {
      if (maleGroupA.length === 0 || maleGroupB.length === 0) {
        alert("Selecione jogadores para os Grupos A e B.");
        return;
      }
      if (maleGroupA.length !== maleGroupB.length) {
        alert("Os Grupos A e B masculinos precisam ter a mesma quantidade de jogadores.");
        return;
      }
      setPoolA([...maleGroupA]);
      setPoolB([...maleGroupB]);
    }
    setSessionTimestamp(new Date().toISOString());
    setAppStage('drawMale');
  };

  const drawFirst = () => {
    if (isFirstRound) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const p1 = pool[randomIndex];
      setCurrentPair([p1]);
      setPool(pool.filter(p => p !== p1));
    } else {
      const randomIndex = Math.floor(Math.random() * poolA.length);
      const p1 = poolA[randomIndex];
      setCurrentPair([p1]);
      setPoolA(poolA.filter(p => p !== p1));
    }
  };

  const drawSecond = () => {
    if (isFirstRound) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const p2 = pool[randomIndex];
      setCurrentPair([...currentPair, p2]);
      setPool(pool.filter(p => p !== p2));
    } else {
      const randomIndex = Math.floor(Math.random() * poolB.length);
      const p2 = poolB[randomIndex];
      setCurrentPair([...currentPair, p2]);
      setPoolB(poolB.filter(p => p !== p2));
    }
  };

  // Função que encapsula o sorteio e roda a animação de 3 segundos
  const handleDrawSequence = (playerNumber) => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      if (playerNumber === 1) {
        drawFirst();
      } else {
        drawSecond();
      }
    }, 3000);
  };

  const confirmPair = async () => {
    const p1 = currentPair[0];
    const p2 = currentPair[1];
    const currentGender = appStage === 'drawFemale' ? 'F' : 'M';
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    const newPairData = { 
      player1: p1, 
      player2: p2, 
      timestamp: new Date().toISOString(),
      sessionTimestamp: sessionTimestamp,
      date: currentDate,
      gender: currentGender
    };
    
    try {
      await addDoc(collection(db, "drawHistory"), newPairData);
    } catch (err) {
      console.error("Erro ao salvar partida no Firebase", err);
    }
    
    setHistoryPairs([...historyPairs, newPairData]);
    setSessionPairs([...sessionPairs, newPairData]);
    setCurrentPair([]);

    if (isFirstRound) {
      if (pool.length === 0) {
        setAppStage('done');
      }
    } else {
      if (poolA.length === 0) {
        setAppStage('done');
      }
    }
  };

  const cancelPair = () => {
    if (isFirstRound) {
      setPool([...pool, currentPair[0], currentPair[1]]);
    } else {
      setPoolA([...poolA, currentPair[0]]);
      setPoolB([...poolB, currentPair[1]]);
    }
    setCurrentPair([]);
  };

  const renderDrawButtons = () => {
    let isRepeated = false;
    if (currentPair.length === 2) {
      isRepeated = historyPairs.some(match => 
        (match.player1 === currentPair[0] && match.player2 === currentPair[1]) ||
        (match.player1 === currentPair[1] && match.player2 === currentPair[0])
      );
    }

    if (currentPair.length === 0) {
      return (
        <button onClick={() => handleDrawSequence(1)} disabled={isAnimating} className="bg-gray-800 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-gray-900 transition duration-300 disabled:opacity-50">
          Sortear Primeiro Jogador
        </button>
      );
    }
    
    if (currentPair.length === 1) {
      return (
        <button onClick={() => handleDrawSequence(2)} disabled={isAnimating} className="bg-gray-800 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-gray-900 transition duration-300 disabled:opacity-50">
          Sortear Segundo Jogador
        </button>
      );
    }
    
    if (currentPair.length === 2) {
      if (isRepeated) {
        return (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-yellow-600 font-bold mb-2 text-lg">Aviso: Esta dupla ja jogou junta anteriormente.</p>
            <div className="flex space-x-4">
              <button onClick={confirmPair} className="bg-green-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-green-700 transition duration-300">
                Confirmar Dupla
              </button>
              <button onClick={cancelPair} className="bg-red-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-red-700 transition duration-300">
                Recusar Dupla
              </button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-green-600 font-bold mb-2 text-lg">Dupla valida para a sessao.</p>
            <div className="flex space-x-4">
              <button onClick={confirmPair} className="bg-green-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-green-700 transition duration-300">
                Confirmar Dupla
              </button>
              <button onClick={cancelPair} className="bg-gray-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-gray-700 transition duration-300">
                Cancelar Sorteio
              </button>
            </div>
          </div>
        );
      }
    }
  };

  const availableSessions = [...new Set(historyPairs.map(p => p.sessionTimestamp || p.date || new Date(p.timestamp).toLocaleDateString('pt-BR')))].sort((a, b) => {
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

  const formatLabel = (val) => {
    if (!val) return '';
    if (val.includes('T')) {
      const d = new Date(val);
      return `${d.toLocaleDateString('pt-BR')} as ${d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    }
    return val;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-xl w-96 border-t-4 border-brandRed">
          <div className="text-center mb-6">
            <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="Logotipo Secos e Molhados" className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-brandGold shadow-md" />
            <h2 className="text-2xl font-bold text-brandRed">Secos e Molhados</h2>
            <p className="text-gray-500 font-medium">Sistema de Sorteio 2026</p>
          </div>
          <input type="email" placeholder="Email Autorizado" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brandRed" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brandRed" />
          <button type="submit" className="w-full bg-brandRed text-white font-bold py-3 rounded hover:bg-red-800 transition duration-300">Acessar Sistema</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative">
      
      {/* Overlay de Animação */}
      {isAnimating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-8 animate-pulse">Sorteando...</h2>
            <div className="flex space-x-6 justify-center">
              <span className="text-7xl animate-bounce" style={{ animationDelay: '0s' }}>🎾</span>
              <span className="text-7xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎾</span>
              <span className="text-7xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎾</span>
            </div>
          </div>
        </div>
      )}

      <header className="bg-brandRed text-white p-4 shadow-md flex justify-between items-center border-b-4 border-brandGold">
        <div className="flex items-center space-x-4">
          <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="Logotipo Secos e Molhados" className="w-12 h-12 rounded-full border-2 border-brandGold" />
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">TTC Secos e Molhados Sorteio</h1>
        </div>
        <button onClick={() => signOut(auth)} className="bg-white text-brandRed px-4 py-2 rounded font-bold hover:bg-gray-200 transition duration-300">Sair</button>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6 bg-white rounded-lg shadow-lg border border-gray-200">
        
        {appStage === 'setup' && (
          <div>
            <div className="flex justify-end mb-6">
              <button onClick={() => setAppStage('history')} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition duration-300 shadow">
                Consultar Historico de Sorteios
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-100 rounded-lg flex flex-col md:flex-row md:items-center justify-between border border-gray-300">
              <span className="font-bold text-gray-700 text-lg mb-4 md:mb-0">Este sorteio e referente a Primeira Rodada?</span>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={isFirstRound} onChange={() => setIsFirstRound(true)} className="w-5 h-5 text-brandRed focus:ring-brandRed" />
                  <span className="font-medium text-gray-800">Sim Primeira Rodada</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={!isFirstRound} onChange={() => setIsFirstRound(false)} className="w-5 h-5 text-brandRed focus:ring-brandRed" />
                  <span className="font-medium text-gray-800">Nao Dividir em Grupos</span>
                </label>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-brandRed mb-6 border-b pb-2">Passo 1: Selecionar Jogadores Presentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="text-xl font-bold text-brandRed mb-4 flex justify-between">
                  <span>Divisao Feminina</span>
                  {isFirstRound ? (
                    <span className="bg-white px-3 py-1 rounded-full text-sm border border-brandRed">{presentFemales.length} Presentes</span>
                  ) : (
                    <span className="bg-white px-3 py-1 rounded-full text-sm border border-brandRed">A: {femaleGroupA.length} | B: {femaleGroupB.length}</span>
                  )}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {femaleRoster.map(player => (
                    <div key={player} className="flex justify-between items-center p-2 hover:bg-red-100 rounded transition duration-200 border border-transparent hover:border-red-200">
                      <span className="font-medium text-sm truncate pr-2">{player}</span>
                      {isFirstRound ? (
                        <input type="checkbox" className="w-5 h-5 text-brandRed focus:ring-brandRed border-gray-300 rounded cursor-pointer" 
                               checked={presentFemales.includes(player)}
                               onChange={() => togglePresence(player, presentFemales, setPresentFemales)} />
                      ) : (
                        <select 
                          className="text-sm border border-gray-300 rounded p-1 bg-white focus:outline-none focus:ring-1 focus:ring-brandRed"
                          value={femaleGroupA.includes(player) ? 'A' : femaleGroupB.includes(player) ? 'B' : 'none'}
                          onChange={(e) => handleGroupSelection(player, e.target.value, setFemaleGroupA, setFemaleGroupB, femaleGroupA, femaleGroupB)}
                        >
                          <option value="none">Ausente</option>
                          <option value="A">Grupo A</option>
                          <option value="B">Grupo B</option>
                        </select>
                      )}
                    </div>
                  ))}
                  {femaleRoster.length === 0 && <p className="text-sm text-gray-500 col-span-2">Aguardando dados do banco</p>}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex justify-between">
                  <span>Divisao Masculina</span>
                  {isFirstRound ? (
                    <span className="bg-white px-3 py-1 rounded-full text-sm border border-gray-400">{presentMales.length} Presentes</span>
                  ) : (
                    <span className="bg-white px-3 py-1 rounded-full text-sm border border-gray-400">A: {maleGroupA.length} | B: {maleGroupB.length}</span>
                  )}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {maleRoster.map(player => (
                    <div key={player} className="flex justify-between items-center p-2 hover:bg-gray-200 rounded transition duration-200 border border-transparent hover:border-gray-300">
                      <span className="font-medium text-sm truncate pr-2">{player}</span>
                      {isFirstRound ? (
                        <input type="checkbox" className="w-5 h-5 text-brandRed focus:ring-brandRed border-gray-300 rounded cursor-pointer" 
                               checked={presentMales.includes(player)}
                               onChange={() => togglePresence(player, presentMales, setPresentMales)} />
                      ) : (
                        <select 
                          className="text-sm border border-gray-300 rounded p-1 bg-white focus:outline-none focus:ring-1 focus:ring-brandRed"
                          value={maleGroupA.includes(player) ? 'A' : maleGroupB.includes(player) ? 'B' : 'none'}
                          onChange={(e) => handleGroupSelection(player, e.target.value, setMaleGroupA, setMaleGroupB, maleGroupA, maleGroupB)}
                        >
                          <option value="none">Ausente</option>
                          <option value="A">Grupo A</option>
                          <option value="B">Grupo B</option>
                        </select>
                      )}
                    </div>
                  ))}
                  {maleRoster.length === 0 && <p className="text-sm text-gray-500 col-span-2">Aguardando dados do banco</p>}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-4">
              <button onClick={startDrawFemale} className="bg-brandRed text-white text-lg font-bold py-3 px-8 rounded shadow hover:bg-red-800 transition duration-300">
                Iniciar Sorteio Feminino
              </button>
              <button onClick={startDrawMale} className="bg-gray-800 text-white text-lg font-bold py-3 px-8 rounded shadow hover:bg-gray-900 transition duration-300">
                Iniciar Sorteio Masculino
              </button>
            </div>
          </div>
        )}

        {appStage === 'history' && (
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
        )}

        {(appStage === 'drawFemale' || appStage === 'drawMale') && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              {appStage === 'drawFemale' ? 'Sorteio Chave Feminina' : 'Sorteio Chave Masculina'}
            </h2>
            
            <div className="flex justify-center items-center space-x-6 mb-10 h-40">
              {currentPair.length >= 1 ? (
                 <div className="bg-brandRed text-white text-4xl font-bold py-8 px-12 rounded-xl shadow-md border-4 border-brandGold">
                   {currentPair[0]}
                 </div>
              ) : (
                 <div className="bg-gray-100 text-gray-400 text-2xl font-bold py-8 px-12 rounded-xl border-4 border-dashed border-gray-300">
                   Aguardando
                 </div>
              )}
              
              <div className="text-4xl font-black text-brandGold">&</div>
              
              {currentPair.length === 2 ? (
                 <div className="bg-brandRed text-white text-4xl font-bold py-8 px-12 rounded-xl shadow-md border-4 border-brandGold">
                   {currentPair[1]}
                 </div>
              ) : (
                 <div className="bg-gray-100 text-gray-400 text-2xl font-bold py-8 px-12 rounded-xl border-4 border-dashed border-gray-300">
                   Aguardando
                 </div>
              )}
            </div>

            {renderDrawButtons()}

            <div className="mt-16 text-left">
              <h3 className="text-xl font-bold border-b pb-2 mb-4 text-gray-600">Partidas da Sessao Atual</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sessionPairs.map((pair, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200 text-center font-bold text-lg shadow-sm">
                    <span className="text-brandRed">{pair.player1}</span> <span className="text-gray-400 mx-1">x</span> <span className="text-brandRed">{pair.player2}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {appStage === 'done' && (
          <div className="text-center py-10">
            <h2 className="text-4xl font-black text-brandRed mb-6">Sorteio Concluido com Sucesso</h2>
            <p className="text-xl text-gray-600 mb-8">Todas as duplas foram geradas e salvas no banco de dados.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              {sessionPairs.map((pair, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-brandRed shadow-md font-bold text-lg">
                  {pair.player1} e {pair.player2}
                </div>
              ))}
            </div>
            <button onClick={() => window.location.reload()} className="mt-10 bg-brandGold text-white font-bold py-3 px-8 rounded hover:bg-yellow-600 transition duration-300">Iniciar Novo Evento</button>
          </div>
        )}
      </main>
    </div>
  );
}
