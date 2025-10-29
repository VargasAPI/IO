import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from "./pages/Main.jsx";
// import ReemplazoEquipos from './pages/ReemplazoEquipos.jsx';
// import ArbolesBinarios from './pages/ArbolesBinarios.jsx';
import SeriesDeportivas from './pages/SeriesDeportivas.jsx';
// import MultiplicacionMatrices from './pages/MultiplicacionMatrices.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Main />} />
          {/* <Route path="/reemplazo-equipos" element={<ReemplazoEquipos />} /> */}
          {/* <Route path="/arboles-binarios" element={<ArbolesBinarios />} /> */} 
          <Route path="/series-deportivas" element={<SeriesDeportivas />} />
           {/* <Route path="/multiplicacion-matrices" element={<MultiplicacionMatrices />} />*/} 
        </Routes>
      </div>
    </Router>
  );
}

export default App;