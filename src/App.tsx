import React from 'react';
import './App.css'; //added line
import Board from './components/Board'


const App: React.FC = () => {
  return (
    <div className='overflow-scroll bg-white scrollbar-corner-slate-400 scrollbar-thumb-slate-200 scrollbar-track-slate-400 whitespace-nowrap'>
      <Board />
    </div>
  );
};

export default App;