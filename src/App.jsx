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
              <button onClick={confirmPair} className="bg-green-600 text-white text-xl font-bold py-4 px-10 rounded shadow hover:bg-green-700 transition
