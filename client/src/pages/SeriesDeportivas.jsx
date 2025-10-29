import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Algorithm.css'; // Usamos los mismos estilos

function SeriesDeportivas() {
  const navigate = useNavigate();
  
  // Estados para los inputs (ahora según las especificaciones)
  const [n, setN] = useState('7'); // Máximo de juegos (n <= 11)
  const [ph, setPh] = useState('0.57'); // Prob. A en casa
  const [pr, setPr] = useState('0.49'); // Prob. A de visita
  const [formato, setFormato] = useState('H-H-A-A-A-H-H'); // Formato de la serie (H=Home, A=Away)

  // Estados para el resultado
  const [probability, setProbability] = useState(null);
  const [dpTable, setDpTable] = useState(null);
  
  // Ref para el input de archivo (para "Cargar")
  const fileInputRef = useRef(null);

  /**
   * Calcula la probabilidad de que A gane la serie, considerando la ventaja de localía.
   */
  const calcularProbabilidad = () => {
    const k = Math.floor(parseInt(n, 10) / 2) + 1; // Victorias necesarias
    const phNum = parseFloat(ph);
    const prNum = parseFloat(pr);
    
    // Validación del formato
    const formatoArray = formato.split('-').map(s => s.trim().toUpperCase());
    if (formatoArray.length !== parseInt(n, 10)) {
      alert(`El formato debe tener exactamente ${n} juegos (ej. H-H-A-A-H...).`);
      return;
    }
    
    // Crear la tabla de DP de (k+1)x(k+1)
    const dp = Array(k + 1).fill(0).map(() => Array(k + 1).fill(0.0));

    // Casos triviales
    for (let j = 1; j <= k; j++) dp[0][j] = 1.0; // A ya ganó
    for (let i = 1; i <= k; i++) dp[i][0] = 0.0; // A ya perdió

    // Llenar la tabla (lógica de DP con ventaja de localía)
    for (let i = 1; i <= k; i++) {
      for (let j = 1; j <= k; j++) {
        // Determinamos qué juego se está jugando en este estado
        // (k-i) juegos ganados por A + (k-j) juegos ganados por B
        const juegosJugados = (k - i) + (k - j);
        const juegoActual = juegosJugados; // Índice 0-based
        
        // Determinar la probabilidad 'p' para ESTE juego
        let p, q;
        if (formatoArray[juegoActual] === 'H') {
          p = phNum; // A está en casa
        } else {
          p = prNum; // A está de visita
        }
        q = 1.0 - p;

        // Ecuación recursiva
        dp[i][j] = p * dp[i - 1][j] + q * dp[i][j - 1];
      }
    }

    setProbability(dp[k][k]);
    setDpTable(dp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDpTable(null); 
    setProbability(null);

    const nNum = parseInt(n, 10);
    if (isNaN(nNum) || nNum <= 0 || nNum > 11) {
      alert("El número de juegos (n) debe ser un entero positivo <= 11.");
      return;
    }
    
    // Validaciones de probabilidad
    const phNum = parseFloat(ph);
    const prNum = parseFloat(pr);
    if (isNaN(phNum) || phNum < 0 || phNum > 1 || isNaN(prNum) || prNum < 0 || prNum > 1) {
      alert("Las probabilidades deben ser números entre 0 y 1.");
      return;
    }

    calcularProbabilidad();
  };

  const handleBack = () => navigate('/');

  /**
   * Guarda los datos del problema en un archivo .json 
   */
  const handleSave = () => {
    const data = { n, ph, pr, formato };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `serie_deportiva-${n}-juegos.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Maneja la selección de un archivo para cargar 
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.n && data.ph && data.pr && data.formato) {
            setN(data.n);
            setPh(data.ph);
            setPr(data.pr);
            setFormato(data.formato);
            // Limpiamos resultados anteriores
            setProbability(null);
            setDpTable(null);
          } else {
            alert("Archivo JSON no tiene el formato esperado.");
          }
        } catch (error) {
          alert("Error al leer el archivo. Asegúrese que sea un JSON válido.");
        }
      };
      reader.readAsText(file);
    }
    // Resetea el input para poder cargar el mismo archivo de nuevo
    e.target.value = null;
  };

  return (
    <div className="algorithm-container">
      <h1>Series Deportivas</h1>
      <p className="description">
        Calcula la probabilidad de que un equipo A gane una serie, 
        considerando ventaja de localía.
      </p>

      <form className="algorithm-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nJuegos">Número máximo de juegos (n):</label>
          <input
            type="number" id="nJuegos"
            value={n} onChange={(e) => setN(e.target.value)}
            max="11" min="1" step="2" // Series suelen ser impares
          />
        </div>

        <div className="form-group">
          <label htmlFor="ph">Probabilidad de A en Casa (ph):</label>
          <input
            type="number" id="ph"
            value={ph} onChange={(e) => setPh(e.target.value)}
            step="0.01" min="0" max="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pr">Probabilidad de A de Visita (pr):</label>
          <input
            type="number" id="pr"
            value={pr} onChange={(e) => setPr(e.target.value)}
            step="0.01" min="0" max="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="formato">Formato (H=A en Casa, A=A de Visita):</label>
          <input
            type="text" id="formato"
            value={formato} onChange={(e) => setFormato(e.target.value)}
            placeholder="Ej: H-H-A-A-H"
          />
        </div>

        <div className="button-group">
          <button type="submit" className="btn-submit">
            Calcular Probabilidad
          </button>
          <button type="button" className="btn-back" onClick={handleBack}>
            Volver al Menú
          </button>
        </div>
        
        {/* Botones de Guardar y Cargar */}
        <div className="button-group io-buttons">
          <button type="button" className="btn-save" onClick={handleSave}>
            Guardar Problema
          </button>
          <button type="button" className="btn-load" onClick={() => fileInputRef.current.click()}>
            Cargar Problema
          </button>
        </div>
      </form>

      {/* Input oculto para cargar archivos */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }} 
      />

      {/* Resultado (Probabilidad) */}
      {probability !== null && (
        <div className="resultado">
          <h3>Resultado</h3>
          <p>
            Victorias necesarias (k): <strong>{Math.floor(n / 2) + 1}</strong>
            <br />
            Probabilidad de A de ganar la serie (estado [{Math.floor(n / 2) + 1}, {Math.floor(n / 2) + 1}]):
            <strong> {probability.toFixed(6)}</strong> (o {(probability * 100).toFixed(4)}%)
          </p>
        </div>
      )}

      {/* Resultado (Tabla DP) */}
      {dpTable && (
        <div className="table-container">
          <h3>Tabla de Programación Dinámica (Prob. de A)</h3>
          <table>
            <thead>
              <tr>
                <th>i \ j</th> 
                {dpTable[0].map((_, j) => (
                  <th key={j}>{j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dpTable.map((row, i) => (
                <tr key={i}>
                  <th>{i}</th>
                  {row.map((prob, j) => (
                    <td key={j}>
                      {i === 0 && j === 0 ? '-' : prob.toFixed(4)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SeriesDeportivas;