import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [femaleRoster, setFemaleRoster] = useState([]);
  const [maleRoster, setMaleRoster] = useState([]);

  const [presentFemales, setPresentFemales] = useState([]);
  const [presentMales, setPresentMales] = useState([]);
  const [appStage, setAppStage] = useState('setup'); 

  const [pool, setPool] = useState([]);
  const [currentPair, setCurrentPair] = useState([]);
  const [historyPairs, setHistoryPairs] = useState([]);
  const [sessionPairs, setSessionPairs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const loadInitialPlayers = async () => {
    const malePlayers = [
      "Alexandre Cascardo", "Bottino", "Claudio Quiroz", "Colonese", 
      "Eduardo Caetano", "Eduardo Carneiro", "Fernando Cavalcante", "Fittipaldi", 
      "Flavio", "Foguete", "Gustavo Carneiro", "Joao Barreto", 
      "Joao Reis", "Joao Vita", "Jose Felipe", "Julio Cesar", 
      "Lincoln Rollin", "Luiz Henrique", "Marco Aranha", "Michel Neves", 
      "Neco", "Reco", "Rodrigo Ferreira", "Romulo", 
      "Taylor", "Tuninho", "Vanzilota", "Vitor", "Willy", "Ximenes"
    ];

    const femalePlayers = [
      "Adriane", "Ana Quiroz", "Andrea", "Cristina", "Giovanna", 
      "Jeovanna", "Katia", "Leticia", "Mariana Sa", "Nubia", 
      "Natalia", "Rose", "Sandra Conti", "Valeria"
    ];

    setIsUploading(true);
    try {
      const playersSnapshot = await getDocs(collection(db, "players"));
      const deletePromises = [];
      playersSnapshot.forEach((documentSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, "players", documentSnapshot.id)));
      });
      await Promise.all(deletePromises);

      for (const name of malePlayers) {
        await addDoc(collection(db, "players"), { name: name, gender: "M" });
      }
      for (const name of femalePlayers) {
        await addDoc(collection(db, "players"), { name: name, gender: "F" });
      }
      alert("Carga concluida com sucesso. O banco antigo foi limpo e os nomes foram atualizados. Recarregue a pagina para ver os nomes.");
    } catch (error) {
      console.error("Erro ao inserir ou apagar jogadores", error);
      alert("Ocorreu um erro durante a carga de dados.");
    }
    setIsUploading(false);
  };

  const togglePresence = (player, group, setGroup) => {
    if (group.includes(player)) {
      setGroup(group.filter(p => p !== player));
    } else {
      setGroup([...group, player]);
    }
  };

  const startDrawFemale = () => {
    if (presentFemales.length === 0) {
      alert("Selecione pelo menos duas jogadoras para iniciar o sorteio feminino.");
      return;
    }
    if (presentFemales.length % 2 !== 0) {
      alert("Garanta que a selecao feminina tenha um numero par de presentes.");
      return;
    }
    setPool([...presentFemales]);
    setAppStage('drawFemale');
  };

  const startDrawMale = () => {
    if (presentMales.length === 0) {
      alert("Selecione pelo menos dois jogadores para iniciar o sorteio masculino.");
      return;
    }
    if (presentMales.length % 2 !== 0) {
      alert("Garanta que a selecao masculina tenha um numero par de presentes.");
      return;
    }
    setPool([...presentMales]);
    setAppStage('drawMale');
  };

  const drawFirst = () => {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const p1 = pool[randomIndex];
    setCurrentPair([p1]);
    setPool(pool.filter(p => p !== p1));
  };

  const drawSecond = () => {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const p2 = pool[randomIndex];
    setCurrentPair([...currentPair, p2]);
    setPool(pool.filter(p => p !== p2));
  };

  const confirmPair = async () => {
    const p1 = currentPair[0];
    const p2 = currentPair[1];
    const newPairData = { player1: p1, player2: p2, timestamp: new Date().toISOString() };
    
    try {
      await addDoc(collection(db, "drawHistory"), newPairData);
    } catch (err) {
      console.error("Erro ao salvar partida no Firebase", err);
    }
    
    setHistoryPairs([...historyPairs, newPairData]);
    setSessionPairs([...sessionPairs, newPairData]);
    setCurrentPair([]);

    if (pool.length === 0) {
      setAppStage('done');
    }
  };

  const cancelPair = () => {
    setPool([...pool, currentPair[0], currentPair[1]]);
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
        <button onClick={drawFirst} className="bg-gray-800 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-gray-900 transition duration-300">
          Sortear Primeiro Jogador
        </button>
      );
    }
    
    if (currentPair.length === 1) {
      return (
        <button onClick={drawSecond} className="bg-gray-800 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-gray-900 transition duration-300">
          Sortear Segundo Jogador
        </button>
      );
    }
    
    if (currentPair.length === 2) {
      if (isRepeated && pool.length > 0) {
        return (
          <div className="flex flex-col items-center">
            <p className="text-red-600 font-bold mb-4 text-lg">Aviso: Esta dupla ja jogou junta anteriormente. Sorteio invalido.</p>
            <button onClick={cancelPair} className="bg-red-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-red-700 transition duration-300">
              Refazer Sorteio da Dupla
            </button>
          </div>
        );
      } else if (isRepeated && pool.length === 0) {
        return (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-yellow-600 font-bold mb-2 text-lg">Aviso: Dupla repetida, porem mantida por ser a ultima restante do grupo.</p>
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
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
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
              <span className="text-blue-800 font-medium">Carga Inicial de Jogadores no Banco de Dados</span>
              <button onClick={loadInitialPlayers} disabled={isUploading} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50">
                {isUploading ? 'Carregando' : 'Carregar Banco de Dados'}
              </button>
            </div>

            <h2 className="text-2xl font-bold text-brandRed mb-6 border-b pb-2">Passo 1: Selecionar Jogadores Presentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="text-xl font-bold text-brandRed mb-4 flex justify-between">
                  <span>Divisao Feminina</span>
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-brandRed">{presentFemales.length} Selecionadas</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {femaleRoster.map(player => (
                    <label key={player} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-red-100 rounded transition duration-200">
                      <input type="checkbox" className="w-5 h-5 text-brandRed focus:ring-brandRed border-gray-300 rounded" onChange={() => togglePresence(player, presentFemales, setPresentFemales)} /> 
                      <span className="font-medium">{player}</span>
                    </label>
                  ))}
                  {femaleRoster.length === 0 && <p className="text-sm text-gray-500 col-span-2">Aguardando dados do banco</p>}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex justify-between">
                  <span>Divisao Masculina</span>
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-gray-400">{presentMales.length} Selecionados</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {maleRoster.map(player => (
                    <label key={player} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-200 rounded transition duration-200">
                      <input type="checkbox" className="w-5 h-5 text-brandRed focus:ring-brandRed border-gray-300 rounded" onChange={() => togglePresence(player, presentMales, setPresentMales)} /> 
                      <span className="font-medium">{player}</span>
                    </label>
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

        {(appStage === 'drawFemale' || appStage === 'drawMale') && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              {appStage === 'drawFemale' ? 'Sorteio Chave Feminina' : 'Sorteio Chave Masculina'}
            </h2>
            
            <div className="flex justify-center items-center space-x-6 mb-10 h-40">
              {currentPair.length >= 1 ? (
                 <div className="bg-brandRed text-white text-4xl font-bold py-8 px-12 rounded-xl shadow-md border-4 border-brandGold animate-pulse">
                   {currentPair[0]}
                 </div>
              ) : (
                 <div className="bg-gray-100 text-gray-400 text-2xl font-bold py-8 px-12 rounded-xl border-4 border-dashed border-gray-300">
                   Aguardando
                 </div>
              )}
              
              <div className="text-4xl font-black text-brandGold">&</div>
              
              {currentPair.length === 2 ? (
                 <div className="bg-brandRed text-white text-4xl font-bold py-8 px-12 rounded-xl shadow-md border-4 border-brandGold animate-pulse">
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
