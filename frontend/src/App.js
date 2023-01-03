import './App.css';
import { io } from "socket.io-client";
import {useEffect} from 'react';

function App() {
  
  useEffect(() => {
    console.log("connecting");
    const socket = io('http://localhost:3001/');

    return () => {
      socket.close();
    }
  }, []);

  return (
    <div className="App">
      <h1>Hello World</h1>
    </div>
  );
}

export default App;
