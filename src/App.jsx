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
            <div className="mb-6 p-4 bg-gray-100 rounded-lg flex flex-col md:flex-row md:items-center justify-between border border-gray-300">
              <span className="font-bold text-gray-700 text-lg mb-4 md:mb-0">Este sorteio e referente a Primeira Rodada?</span>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
                <label className="flex items-center space-x
