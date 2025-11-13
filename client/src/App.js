import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from "./pages/Main.jsx";

 import ArbolesBinarios from './pages/ArbolesBinarios.jsx';


function App() {
return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Main />} />
       
          <Route path="/arboles-binarios" element={<ArbolesBinarios />} />
         
           
        </Routes>
      </div>
    </Router>
  );
}

export default App;