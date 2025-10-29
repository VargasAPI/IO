import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Algorithm.css';

function SeriesDeportivas() {
  const navigate = useNavigate();
  
  const [probA, setProbA] = useState('0.55');
  const [winsNeeded, setWinsNeeded] = useState('4');
  
  const [probability, setProbability] = useState(null);
  // NUEVO ESTADO: para almacenar la tabla de DP
  const [dpTable, setDpTable] = useState(null);

  /**
   * Calcula la probabilidad de que A gane la serie.
   * @param {number} p - Probabilidad de que A gane un solo juego (constante)
   * @param {number} k - Número de victorias necesarias para ganar la serie
   */
  const calcularProbabilidad = (p, k) => {
    const q = 1.0 - p;
    
    // Crear la tabla de DP de (k+1)x(k+1)
    const dp = Array(k + 1).fill(0).map(() => Array(k + 1).fill(0.0));

    // Casos triviales (o base)
    // Si A necesita 0 victorias (i=0), ya ganó. Prob = 1.0
    for (let j = 1; j <= k; j++) {
      dp[0][j] = 1.0;
    }
    // Si B necesita 0 victorias (j=0), A ya perdió. Prob = 0.0
    for (let i = 1; i <= k; i++) {
      dp[i][0] = 0.0;
    }

    // Llenar la tabla usando la ecuación recursiva
    // Tabla(i,j) = p * Tabla(i-1, j) + q * Tabla(i, j-1)
    for (let i = 1; i <= k; i++) {
      for (let j = 1; j <= k; j++) {
        dp[i][j] = p * dp[i - 1][j] + q * dp[i][j - 1];
      }
    }

    // El resultado es la probabilidad en el estado inicial (k, k)
    setProbability(dp[k][k]);
    // Guardamos la tabla completa para mostrarla
    setDpTable(dp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Reseteamos la tabla anterior al hacer un nuevo cálculo
    setDpTable(null); 
    setProbability(null);

    const p = parseFloat(probA);
    const k = parseInt(winsNeeded, 10);

    if (isNaN(p) || p < 0 || p > 1 || isNaN(k) || k <= 0) {
      alert("Por favor, ingrese valores válidos.");
      return;
    }

    calcularProbabilidad(p, k);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="algorithm-container">
      <h1>Series Deportivas</h1>
      <p className="description">
        Calcula la probabilidad de que un equipo A gane una serie al "mejor de 2k-1" juegos.
      </p>

      <form className="algorithm-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="probA">Probabilidad de A de ganar un juego (p):</label>
          <input
            type="number"
            id="probA"
            value={probA}
            onChange={(e) => setProbA(e.target.value)}
            step="0.01"
            min="0"
            max="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="winsNeeded">Victorias necesarias para ganar la serie (k):</label>
          <input
            type="number"
            id="winsNeeded"
            value={winsNeeded}
            onChange={(e) => setWinsNeeded(e.target.value)}
            step="1"
            min="1"
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
      </form>

      {/* Mostrar el resultado principal */}
      {probability !== null && (
        <div className="resultado">
          <h3>Resultado</h3>
          <p>
            La probabilidad de que el Equipo A gane la serie (estado [{winsNeeded}, {winsNeeded}]) es:
            <strong> {probability.toFixed(6)}</strong> (o {(probability * 100).toFixed(4)}%)
          </p>
        </div>
      )}
      {dpTable && (
        <div className="table-container">
          <h3>Tabla de Programación Dinámica (Prob. de A)</h3>
          <table>
            <thead>
              <tr>
                {/* Encabezado: i = victorias para A, j = victorias para B */}
                <th>i \ j</th> 
                {dpTable[0].map((_, j) => (
                  <th key={j}>{j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dpTable.map((row, i) => (
                <tr key={i}>
                  {/* Encabezado de fila */}
                  <th>{i}</th>
                  {/* Celdas de datos */}
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