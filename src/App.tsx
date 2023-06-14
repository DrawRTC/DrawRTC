import React from 'react';
import './App.css'; //added line
import Board from './Board'

const App: React.FC = () => {
  return (
    <div>
      <h1 className='text-3xl'>Welcome to DrawRTC</h1>
      <Board></Board>
      {/* Add your components and logic here */}
    </div>
  );
};

export default App;