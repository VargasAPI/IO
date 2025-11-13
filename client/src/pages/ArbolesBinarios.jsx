

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ArbolesBinarios.css';
import '../css/Main.css'; // Para usar estilos de botones y layout generales

const MAX_KEYS = 10; // Límite de llaves para el ejemplo de la tabla

function ArbolesBinarios() {
  const navigate = useNavigate();
  const [keysInput, setKeysInput] = useState('');
  const [probabilitiesInput, setProbabilitiesInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Función para volver al menú principal
  const handleBack = () => {
    navigate('/');
  };

  // Función principal del algoritmo de Árboles Binarios de Búsqueda Óptimos
  const calculateOBST = (keys, p) => {
    const n = keys.length;
    // La suma de probabilidades debe ser 1 (o cercana a 1 por errores de punto flotante)
    const sumP = p.reduce((sum, current) => sum + current, 0);
    if (Math.abs(sumP - 1) > 1e-6) {
        throw new Error("La suma de las probabilidades debe ser 1.0.");
    }

    // Inicializar las tablas A (Costo) y R (Raíz)
   
    const A = Array(n + 2).fill(0).map(() => Array(n + 2).fill(0));
    const R = Array(n + 2).fill(0).map(() => Array(n + 2).fill(0));
    const P = Array(n + 1).fill(0); 

    // casos triviales 
    for (let i = 1; i <= n; i++) {
        A[i][i - 1] = 0; 
        R[i][i - 1] = 0; 
        P[i] = P[i-1] + p[i-1]; 
    }
    A[n+1][n] = 0; 

    // Inicializar caso trivial (Tamaño 1)
    for (let i = 1; i <= n; i++) {
        A[i][i] = p[i-1];
        R[i][i] = i; 
    }

    
    for (let l = 2; l <= n; l++) { 
        for (let i = 1; i <= n - l + 1; i++) {
            const j = i + l - 1; 
            A[i][j] = Infinity;
            
            
            const sumProb = P[j] - P[i-1];
            
            
            for (let k = i; k <= j; k++) {
                
                const cost = A[i][k - 1] + A[k + 1][j] + sumProb; 

                if (cost < A[i][j]) {
                    A[i][j] = cost;
                    R[i][j] = k; 
                }
            }
        }
    }

    // Reconstruir el árbol óptimo a partir de la tabla R
    const buildTree = (i, j) => {
        if (i > j) return null;
        const k = R[i][j];
        if (k === 0) return null; 

        return {
            key: keys[k - 1], 
            cost: A[i][j].toFixed(4),
            rootIndex: k,
            left: buildTree(i, k - 1),
            right: buildTree(k + 1, j),
        };
    };

    const tree = buildTree(1, n);

    return { 
      minCost: A[1][n].toFixed(4), 
      optimalTree: tree,
      A, R, n
    };
  };

  // Función de manejo del cálculo al presionar el botón
  const handleCalculate = () => {
    try {
      setError('');
      // 1. Procesar la entrada de llaves
      const keys = keysInput.split(',').map(s => s.trim()).filter(s => s !== '');
      if (keys.length === 0) {
        throw new Error('Debe ingresar al menos una llave (ej: A, B, C).');
      }

      // 2. Procesar la entrada de probabilidades
      const probabilities = probabilitiesInput.split(',').map(s => s.trim()).filter(s => s !== '');
      if (probabilities.length === 0) {
        throw new Error('Debe ingresar al menos una probabilidad (ej: 0.1, 0.5, 0.4).');
      }
      
      // 3. Convertir probabilidades a números y validar
      const p = probabilities.map(s => {
          const num = parseFloat(s);
          if (isNaN(num) || num < 0 || num > 1) {
              throw new Error('Todas las probabilidades deben ser números entre 0 y 1.');
          }
          return num;
      });

      // 4. Validar que la cantidad de llaves y probabilidades sea la misma
      if (keys.length !== p.length) {
        throw new Error(`El número de llaves (${keys.length}) no coincide con el número de probabilidades (${p.length}).`);
      }

      // 5. Ejecutar el algoritmo
      const res = calculateOBST(keys, p);
      setResult(res);

    } catch (e) {
      setError(e.message);
      setResult(null);
    }
  };

  // --- Renderizado de Tablas y Árbol ---

  const renderTable = (table, title, keys, isRootTable = false) => {
    if (!table || table.length <= 1) return null;
    const n = keys.length;
    
    return (
      <div className="table-container">
        <h4>{title}</h4>
        <table className="result-table">
          <thead>
            <tr>
              <th>i\j</th>
              {keys.map((_, index) => <th key={index + 1}>{index + 1}</th>)}
              {isRootTable && <th>LLAVE</th>}
            </tr>
          </thead>
          <tbody>
            {keys.map((key, i) => (
              <tr key={i + 1}>
                <th>{i + 1} ({key})</th>
                {table[i + 1].slice(1, n + 1).map((val, j) => (
                  <td key={j + 1}>{isRootTable ? val : val.toFixed(4)}</td>
                ))}
                {isRootTable && <td>{key}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Función para renderizar el árbol de forma recursiva (visualización simple en texto)
  const renderTree = (node, level = 0, side = 'Raíz') => {
    if (!node) return null;
    const indent = '–'.repeat(level * 4);
    return (
      <div className="tree-node">
        <div>{indent} ({side}) **{node.key}** (Costo Subárbol: {node.cost})</div>
        {node.left && renderTree(node.left, level + 1, 'Izquierda')}
        {node.right && renderTree(node.right, level + 1, 'Derecha')}
      </div>
    );
  };
  
  // Datos de ejemplo basados en el PDF (Harrison, Lennon, McCarthey, Starr)
  const exampleKeys = ['Harrison', 'Lennon', 'McCarthey', 'Starr'].join(', '); 
  const exampleProbabilities = ['0.18', '0.32', '0.39', '0.11'].join(', '); 

  const loadExample = () => {
    setKeysInput(exampleKeys);
    setProbabilitiesInput(exampleProbabilities);
  }

  // --- Estructura JSX ---
  return (
    <div className="container">
      <h1>Árboles Binarios de Búsqueda Óptimos 🌳</h1>
      <h3>Algoritmo de Programación Dinámica</h3>
      
      <div className="input-group">
        <label htmlFor="keys-input">Llaves (separadas por coma):</label>
        <input
          id="keys-input"
          type="text"
          value={keysInput}
          onChange={(e) => setKeysInput(e.target.value)}
          placeholder="Ej: A, B, C, D"
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="prob-input">Probabilidades (separadas por coma, deben sumar 1.0):</label>
        <input
          id="prob-input"
          type="text"
          value={probabilitiesInput}
          onChange={(e) => setProbabilitiesInput(e.target.value)}
          placeholder="Ej: 0.1, 0.5, 0.4"
        />
      </div>
      
      <div className="action-buttons">
        <button className="main-button" onClick={handleCalculate}>
          Calcular Árbol Óptimo
        </button>
        <button className="secondary-button" onClick={loadExample}>
          Cargar Ejemplo (PDF)
        </button>
        <button className="exit-button" onClick={handleBack}>
          Volver al Menú
        </button>
      </div>
      
      {error && <div className="error-message">❌ Error: {error}</div>}
      
      {result && (
        <div className="results-section">
          <h2>✅ Resultado Óptimo</h2>
          <p>El **Costo Promedio Óptimo** de Búsqueda es: **{result.minCost}** [cite: 390]</p>

          <hr/>
          
          <div className="tree-visualization">
            <h3>Visualización del Árbol Óptimo (Estructura)</h3>
            <div className="tree-structure">
              {renderTree(result.optimalTree)}
            </div>
                        <p className="note-message">
              *Nota: Este es un diagrama textual simplificado de la estructura del árbol. La raíz es la llave que minimiza el costo total, y los subárboles izquierdo y derecho son construidos recursivamente buscando su propia raíz óptima.*
            </p>
          </div>

          <hr/>

          <div className="tables-output">
            <h3>Matrices de Programación Dinámica</h3>
            
            <div className="table-row">
              {renderTable(result.A, 'Tabla A (Costo Mínimo A[i][j])', keysInput.split(',').map(s => s.trim()).filter(s => s !== ''))}
            </div>
            <div className="table-row">
              {renderTable(result.R, 'Tabla R (Raíz Óptima R[i][j])', keysInput.split(',').map(s => s.trim()).filter(s => s !== ''), true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArbolesBinarios;