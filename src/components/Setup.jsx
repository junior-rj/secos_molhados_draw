import React from 'react';
import { togglePlayerPresence, assignGroup } from '../utils/logic';

export default function Setup({
  isFirstRound, setIsFirstRound,
  presentFemales, setPresentFemales,
  presentMales, setPresentMales,
  femaleGroupA, setFemaleGroupA,
  femaleGroupB, setFemaleGroupB,
  maleGroupA, setMaleGroupA,
  maleGroupB, setMaleGroupB,
  femaleRoster, maleRoster,
  startDrawFemale, startDrawMale,
  setAppStage,
  isFemaleDrawValid, isMaleDrawValid
}) {
  return (
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

      <div className="mb-8 p-6 bg-white border border-gray-300 rounded-lg shadow-sm flex flex-col md:flex-row justify-center items-center gap-6">
        <button 
          onClick={startDrawFemale} 
          disabled={!isFemaleDrawValid}
          className="bg-brandRed text-white text-lg font-bold py-3 px-8 rounded shadow hover:bg-red-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Iniciar Sorteio Feminino
        </button>
        <button 
          onClick={startDrawMale} 
          disabled={!isMaleDrawValid}
          className="bg-gray-800 text-white text-lg font-bold py-3 px-8 rounded shadow hover:bg-gray-900 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Iniciar Sorteio Masculino
        </button>
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
                         onChange={() => togglePlayerPresence(player, presentFemales, setPresentFemales)} />
                ) : (
                  <select 
                    className="text-sm border border-gray-300 rounded p-1 bg-white focus:outline-none focus:ring-1 focus:ring-brandRed"
                    value={femaleGroupA.includes(player) ? 'A' : femaleGroupB.includes(player) ? 'B' : 'none'}
                    onChange={(e) => assignGroup(player, e.target.value, setFemaleGroupA, setFemaleGroupB, femaleGroupA, femaleGroupB)}
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
                         onChange={() => togglePlayerPresence(player, presentMales, setPresentMales)} />
                ) : (
                  <select 
                    className="text-sm border border-gray-300 rounded p-1 bg-white focus:outline-none focus:ring-1 focus:ring-brandRed"
                    value={maleGroupA.includes(player) ? 'A' : maleGroupB.includes(player) ? 'B' : 'none'}
                    onChange={(e) => assignGroup(player, e.target.value, setMaleGroupA, setMaleGroupB, maleGroupA, maleGroupB)}
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
    </div>
  );
}
