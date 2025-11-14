import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Tree from 'react-d3-tree';
import '../css/ArbolesBinarios.css';
import '../css/Main.css';

function ArbolesBinarios() {
  const navigate = useNavigate();
  const [keysInput, setKeysInput] = useState('');
  const [probabilitiesInput, setProbabilitiesInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleBack = () => {
    navigate('/');
  };

  /**
   * Calcula el Árbol Binario de Búsqueda Óptimo usando Programación Dinámica.
   */
  const calculateOBST = (keys, p) => {
    const n = keys.length;
    
    const sumP = p.reduce((sum, current) => sum + current, 0);
    if (Math.abs(sumP - 1) > 1e-6) {
        throw new Error("La suma de las probabilidades debe ser 1.0 o muy cercana.");
    }

    const A = Array(n + 2).fill(0).map(() => Array(n + 2).fill(0));
    const R = Array(n + 2).fill(0).map(() => Array(n + 2).fill(0));
    const P = Array(n + 1).fill(0); 

    for (let i = 1; i <= n; i++) {
        A[i][i - 1] = 0; 
        R[i][i - 1] = 0; 
        P[i] = P[i-1] + p[i-1]; 
    }
    A[n+1][n] = 0; 

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

  const handleCalculate = () => {
    try {
      setError('');
      
      const keys = keysInput.split(',').map(s => s.trim()).filter(s => s !== '');
      if (keys.length === 0) {
        throw new Error('Debe ingresar al menos una llave (ej: A, B, C).');
      }

      const probabilities = probabilitiesInput.split(',').map(s => s.trim()).filter(s => s !== '');
      if (probabilities.length === 0) {
        throw new Error('Debe ingresar al menos una probabilidad (ej: 0.1, 0.5, 0.4).');
      }
      
      const p = probabilities.map(s => {
          const num = parseFloat(s);
          if (isNaN(num) || num < 0) {
              throw new Error('Todas las probabilidades deben ser números positivos.');
          }
          return num;
      });

      if (keys.length !== p.length) {
        throw new Error(`El número de llaves (${keys.length}) no coincide con el número de probabilidades (${p.length}).`);
      }
      
      const res = calculateOBST(keys, p);
      setResult(res);

    } catch (e) {
      setError(e.message);
      setResult(null);
    }
  };

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
            </tr>
          </thead>
          <tbody>
            {keys.map((key, i) => (
              <tr key={i + 1}>
                <th>{i + 1} ({key})</th>
                {table[i + 1].slice(1, n + 1).map((val, j) => (
                  <td key={j + 1}>{isRootTable ? val : val.toFixed(4)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  



  const handleFileLoad = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        
        const lines = content.trim().split('\n');

        if (lines.length < 2) {
          throw new Error("El archivo debe contener al menos dos líneas: Llaves y Probabilidades.");
        }

        const keys = lines[0].trim();
        const probabilities = lines[1].trim();

        setError('');
        setKeysInput(keys);
        setProbabilitiesInput(probabilities);
        
      } catch (err) {
        setError(`❌ Error al procesar el archivo: ${err.message}`);
        setKeysInput('');
        setProbabilitiesInput('');
        setResult(null);
      }
    };

    reader.onerror = () => {
      setError("❌ Error leyendo el archivo.");
    };

    reader.readAsText(file);
  };


 
  const prepareTreeData = (treeNode) => {
    if (!treeNode) return null;

    const data = {
        name: treeNode.key,
        attributes: {
            Costo: treeNode.cost,
            Índice: treeNode.rootIndex,
        },
        children: []
    };

    if (treeNode.left) {
        data.children.push(prepareTreeData(treeNode.left));
    }
    if (treeNode.right) {
        data.children.push(prepareTreeData(treeNode.right));
    }
    
    // Ajuste visual para nodos binarios vacíos
    if (!treeNode.left || !treeNode.right) {
        if (!treeNode.left) {
            data.children.unshift({ name: '∅', attributes: { empty: true } });
        }
        if (!treeNode.right) {
            data.children.push({ name: '∅', attributes: { empty: true } });
        }
    }
    data.children = data.children.filter(child => child !== null);
    
    return data;
  };

  const treeData = useMemo(() => {
    if (result && result.optimalTree) {
      return [prepareTreeData(result.optimalTree)];
    }
    return [];
  }, [result]);

  const nodeSvgShape = {
    shape: 'circle',
    shapeProps: {
      r: 15,
      fill: '#E67E22',
      stroke: '#D35400', 
      strokeWidth: 2,
    },
  };
  
  return (
    <div className="container">
      <h1>Árboles Binarios de Búsqueda Óptimos 🌳</h1>
      <h3>Algoritmo de Programación Dinámica</h3>
      
      <div className="input-group">
        <label htmlFor="keys-input">Llaves (separadas por coma, ordenadas alfabéticamente/numéricamente):</label>
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
        
        {/* BOTÓN DE CARGA DE ARCHIVO */}
        <label htmlFor="file-upload" className="file-upload-button secondary-button">
          Cargar Archivo (.txt)
        </label>
        <input 
          id="file-upload" 
          type="file" 
          accept=".txt" 
          onChange={handleFileLoad} 
          style={{ display: 'none' }} 
        />
        

        <button className="exit-button" onClick={handleBack}>
          Volver al Menú
        </button>
      </div>
      
      {error && <div className="error-message">❌ Error: {error}</div>}
      
      {result && (
        <div className="results-section">
          <h2>✅ Resultado Óptimo</h2>
          <p>El **Costo Promedio Óptimo** de Búsqueda (Costo esperado de acceso) es: **{result.minCost}**</p>

          <hr/>
          
          <div className="tree-visualization-graph" style={{ height: '500px' }}>
            <h3>Visualización Gráfica del Árbol Óptimo</h3>
            
            <Tree
              data={treeData}
              orientation="top-to-bottom"
              separation={{ siblings: 1.5, nonSiblings: 1.5 }}
              translate={{ x: 400, y: 50 }}
              nodeSvgShape={nodeSvgShape}
              nodeLabelComponent={{
                render: <CustomNodeLabel />,
                foreignObjectWidth: 100,
                foreignObjectHeight: 50,
                style: { fontWeight: 'bold' },
              }}
              pathFunc="diagonal" 
              pathClassFunc={() => 'node-path'}
            />

            <p className="note-message">
              *El diagrama usa D3-Tree para visualizar el árbol. Las líneas representan las conexiones jerárquicas óptimas.*
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

// Componente para renderizar la etiqueta del nodo con el nombre
const CustomNodeLabel = ({ nodeData }) => (
  <g>
    <text 
      fill="black" 
      strokeWidth="0.5" 
      x="0" 
      y="25" 
      style={{ fontSize: "12px", fontWeight: "bold" }}
      textAnchor="middle"
    >
      {nodeData.name === '∅' ? '' : nodeData.name}
    </text>
  </g>
);

export default ArbolesBinarios;