import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/MultiplicarMatrices.css";

function MultiplicacionMatrices() {
  const navigate = useNavigate();
  const [numMatrices, setNumMatrices] = useState('');
  const [dimensiones, setDimensiones] = useState('');
  const [resultado, setResultado] = useState(null);
  const [tablaM, setTablaM] = useState(null);
  const [tablaP, setTablaP] = useState(null);

  // Algoritmo de multiplicación de matrices
  const matrizCadena = (dims) => {
    const n = dims.length - 1;
    const M = Array(n + 1).fill(0).map(() => Array(n + 1).fill(0));
    const P = Array(n + 1).fill(0).map(() => Array(n + 1).fill(0));

    // M[i][i] = 0 (una matriz no tiene costo)
    for (let i = 1; i <= n; i++) {
      M[i][i] = 0;
    }

    // Llenar las tablas por longitud de cadena
    for (let longitud = 2; longitud <= n; longitud++) {
      for (let i = 1; i <= n - longitud + 1; i++) {
        const j = i + longitud - 1;
        M[i][j] = Infinity;

        for (let k = i; k < j; k++) {
          const costo = M[i][k] + M[k + 1][j] + dims[i - 1] * dims[k] * dims[j];
          
          if (costo < M[i][j]) {
            M[i][j] = costo;
            P[i][j] = k;
          }
        }
      }
    }

    return { M, P, n };
  };

  // Reconstruir el orden óptimo
  const reconstruirParentesis = (P, i, j) => {
    if (i === j) {
      return `A${i}`;
    } else {
      const k = P[i][j];
      const izq = reconstruirParentesis(P, i, k);
      const der = reconstruirParentesis(P, k + 1, j);
      return `(${izq}${der})`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Parsear las dimensiones
      const dims = dimensiones.split(',').map(d => parseInt(d.trim()));
      
      // Validar entrada
      if (dims.some(isNaN)) {
        alert('Por favor ingrese solo números separados por comas');
        return;
      }

      const n = parseInt(numMatrices);
      if (dims.length !== n + 1) {
        alert(`Debe ingresar ${n + 1} dimensiones para ${n} matrices`);
        return;
      }

      // Ejecutar el algoritmo
      const { M, P, n: numMat } = matrizCadena(dims);
      const ordenOptimo = reconstruirParentesis(P, 1, numMat);
      const costoMinimo = M[1][numMat];

      setTablaM(M);
      setTablaP(P);
      setResultado({
        ordenOptimo,
        costoMinimo,
        n: numMat
      });

    } catch (error) {
      alert('Error al procesar los datos: ' + error.message);
    }
  };

  const handleGuardar = () => {
    if (!resultado) {
      alert('Primero debe calcular el resultado');
      return;
    }

    const datos = {
      numMatrices: parseInt(numMatrices),
      dimensiones: dimensiones,
      resultado: resultado
    };

    const dataStr = JSON.stringify(datos, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'multiplicacion_matrices.json';
    link.click();
  };

  const handleCargar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const datos = JSON.parse(event.target.result);
        setNumMatrices(datos.numMatrices.toString());
        setDimensiones(datos.dimensiones);
        
        // Recalcular automáticamente
        const dims = datos.dimensiones.split(',').map(d => parseInt(d.trim()));
        const { M, P, n } = matrizCadena(dims);
        const ordenOptimo = reconstruirParentesis(P, 1, n);
        const costoMinimo = M[1][n];

        setTablaM(M);
        setTablaP(P);
        setResultado({
          ordenOptimo,
          costoMinimo,
          n
        });
      } catch (error) {
        alert('Error al cargar el archivo: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleLimpiar = () => {
    setNumMatrices('');
    setDimensiones('');
    setResultado(null);
    setTablaM(null);
    setTablaP(null);
  };

  return (
    <div className="algorithm-container">
      <h1>Multiplicación de Matrices en Cadena</h1>
      <p className="description">
        Encuentra el orden óptimo para multiplicar una cadena de matrices minimizando operaciones.
      </p>

      <form onSubmit={handleSubmit} className="algorithm-form">
        <div className="form-group">
          <label htmlFor="numMatrices">Número de matrices (n):</label>
          <input
            type="number"
            id="numMatrices"
            min="2"
            max="10"
            value={numMatrices}
            onChange={(e) => setNumMatrices(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dimensiones">Dimensiones (d₀, d₁, d₂, ..., dₙ):</label>
          <input
            type="text"
            id="dimensiones"
            value={dimensiones}
            onChange={(e) => setDimensiones(e.target.value)}
            placeholder="Ejemplo: 20, 2, 30, 12, 8"
            required
          />
          <small>Ingrese {numMatrices ? parseInt(numMatrices) + 1 : 'n+1'} dimensiones separadas por comas</small>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-submit">Calcular</button>
          <button type="button" className="btn-secondary" onClick={handleGuardar} disabled={!resultado}>
            Guardar
          </button>
          <label className="btn-secondary file-label">
            Cargar
            <input 
              type="file" 
              accept=".json" 
              onChange={handleCargar}
              style={{ display: 'none' }}
            />
          </label>
          <button type="button" className="btn-secondary" onClick={handleLimpiar}>
            Limpiar
          </button>
          <button type="button" className="btn-back" onClick={() => navigate('/')}>
            Volver
          </button>
        </div>
      </form>

      {resultado && (
        <div className="resultado">
          <h3>Resultados:</h3>
          
          <div className="result-item">
            <strong>Costo mínimo de multiplicaciones:</strong> {resultado.costoMinimo}
          </div>
          
          <div className="result-item">
            <strong>Orden óptimo:</strong> <code>{resultado.ordenOptimo}</code>
          </div>

          {tablaM && (
            <div className="tabla-container">
              <h4>Tabla M (Costos):</h4>
              <table className="tabla-resultado">
                <thead>
                  <tr>
                    <th></th>
                    {Array.from({ length: resultado.n }, (_, i) => (
                      <th key={i}>{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: resultado.n }, (_, i) => (
                    <tr key={i}>
                      <th>{i + 1}</th>
                      {Array.from({ length: resultado.n }, (_, j) => (
                        <td key={j} className={i > j ? 'empty' : ''}>
                          {i <= j ? tablaM[i + 1][j + 1] : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tablaP && (
            <div className="tabla-container">
              <h4>Tabla P (Puntos de división):</h4>
              <table className="tabla-resultado">
                <thead>
                  <tr>
                    <th></th>
                    {Array.from({ length: resultado.n }, (_, i) => (
                      <th key={i}>{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: resultado.n }, (_, i) => (
                    <tr key={i}>
                      <th>{i + 1}</th>
                      {Array.from({ length: resultado.n }, (_, j) => (
                        <td key={j} className={i >= j ? 'empty' : ''}>
                          {i < j ? tablaP[i + 1][j + 1] : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiplicacionMatrices;