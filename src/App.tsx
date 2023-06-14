import React from 'react';
import './App.css'; //added line
import Test from './ws'

const App: React.FC = () => {
  return (
    <div>
      <h1 className='text-3xl'>Hello, Redux Toolkit!</h1>
      <Test />
    </div>
  );
};

export default App;