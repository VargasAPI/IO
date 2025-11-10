import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Algorithm.css';

function ReemplazoEquipos() {
  const navigate = useNavigate();
  
  // Estados para los inputs
  const [costoInicial, setCostoInicial] = useState('20000');
  const [plazoProyecto, setPlazoProyecto] = useState('8'); // N (1 a 30)
  const [vidaUtil, setVidaUtil] = useState('5'); // n (1 a 10)
  const [inflacion, setInflacion] = useState('0.05');// Indice de inflación
  
  // Inputs que dependen de la vidaUtil (n)
  const [costosMantenimiento, setCostosMantenimiento] = useState('2000,2500,3000,4000,5000');
  const [preciosReventa, setPreciosReventa] = useState('15000,10000,8000,5000,2000');

  // Estados para el resultado
  const [resultados, setResultados] = useState(null);// Para G(t) y el plan
  
  // Ref para el input de archivo (para "Cargar")
  const fileInputRef = useRef(null);

  /**
   * Parsea y valida los inputs de texto (costos y reventas).
   * Devuelve un array de números o lanza un error.
   */
  const parseInputArray = (input, expectedLength) => {
    const array = input.split(',').map(s => parseFloat(s.trim()));
    if (array.some(isNaN)) {
      throw new Error("Valores de mantenimiento/reventa contienen datos no numéricos.");
    }
    if (array.length !== expectedLength) {
      throw new Error(`Se esperan ${expectedLength} valores (basado en la vida útil), pero se ingresaron ${array.length}.`);
    }
    return array;
  };

  /**
   * Calcula el plan óptimo de reemplazo usando Programación Dinámica.
   * Resuelve el "problema de reemplazo de equipos".
   */
  const calcularReemplazo = () => {
    // --- 1. Parseo y Validación ---
    const N = parseInt(plazoProyecto, 10);// Plazo
    const n = parseInt(vidaUtil, 10);// Vida útil
    const CI = parseFloat(costoInicial);// Costo Inicial
    const f = parseFloat(inflacion);// Inflación

    if (N <= 0 || N > 30) throw new Error("El plazo del proyecto debe estar entre 1 y 30.");
    if (n <= 0 || n > 10) throw new Error("La vida útil del equipo debe estar entre 1 y 10.");
    if (isNaN(CI) || CI <= 0) throw new Error("El costo inicial debe ser un número positivo.");
    if (isNaN(f) || f < 0) throw new Error("El índice de inflación no puede ser negativo.");

    const M = parseInputArray(costosMantenimiento, n);// Mantenimiento
    const R = parseInputArray(preciosReventa, n);// Reventa
    // --- 2. Calcular C(j): Costo total de comprar y operar por 'j' años ---
    // Cj = CostoInicial + Sum(M[i]/(1+f)^i) - R[j]/(1+f)^j
    const C = [0]; // C[0] no se usa
    for (let j = 1; j <= n; j++) {
      let sumaMantenimiento = 0;
      for (let i = 1; i <= j; i++) {
        // M[i-1] porque el array M es 0-indexed
        sumaMantenimiento += M[i - 1] / Math.pow(1 + f, i);
      }
      // R[j-1] porque el array R es 0-indexed
      const costoJ = CI + sumaMantenimiento - (R[j - 1] / Math.pow(1 + f, j));
      C.push(costoJ);
    }

    // --- 3. Calcular G(t): Costo mínimo para 't' años de proyecto ---
    // G(t) = min[1 <= j <= min(t, n)] { G(t-j) + C(j) / (1+f)^(t-j) }
    const G = Array(N + 1).fill(Infinity);// Costo mínimo acumulado
    const K = Array(N + 1).fill(0);// Almacena la decisión 'j' (duración)
    G[0] = 0;

    for (let t = 1; t <= N; t++) {
      for (let j = 1; j <= Math.min(t, n); j++) {
        // Costo de esta decisión:
        // Costo de los años anteriores (G[t-j]) +
        // Costo de comprar una máquina en (t-j) y usarla 'j' años.
        const costoDecision = G[t - j] + C[j] / Math.pow(1 + f, t - j);
        
        if (costoDecision < G[t]) {
          G[t] = costoDecision;
          K[t] = j; // Guardamos 'j' (cuántos años se usó el equipo)
        }
      }
    }

    // --- 4. Reconstruir el plan óptimo ---
    const plan = [];
    let t = N;
    while (t > 0) {
      const j = K[t]; // Años que duró la última máquina
      const anoCompra = t - j;
      plan.unshift({ anoCompra, duracion: j, costo: G[t] - G[t-j] });
      t = t - j;
    }

    setResultados({
      tablaG: G.map((costo, t) => ({ t, costo: costo.toFixed(2) })),
      planOptimo: plan
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setResultados(null); // Limpiar resultados anteriores
    try {
      calcularReemplazo();
    } catch (error) {
      alert(`Error en la validación: ${error.message}`);
    }
  };

  const handleBack = () => navigate('/');// Volver al menú

  /**
   * Guarda los datos del problema en un archivo .json
   */
  const handleSave = () => {
    const data = { 
      costoInicial, 
      plazoProyecto, 
      vidaUtil, 
      inflacion, 
      costosMantenimiento, 
      preciosReventa 
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `reemplazo_equipos_N${plazoProyecto}_n${vidaUtil}.json`;
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
          // Validar formato
          if (data.costoInicial && data.plazoProyecto && data.vidaUtil && 
              data.inflacion && data.costosMantenimiento && data.preciosReventa) {
            
            setCostoInicial(data.costoInicial);
            setPlazoProyecto(data.plazoProyecto);
            setVidaUtil(data.vidaUtil);
            setInflacion(data.inflacion);
            setCostosMantenimiento(data.costosMantenimiento);
            setPreciosReventa(data.preciosReventa);
            
            // Limpiamos resultados anteriores
            setResultados(null);
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
      <h1>Reemplazo de Equipos</h1>
      <p className="description">
        Calcula el plan óptimo de reemplazo de equipos minimizando
        costos de mantenimiento y depreciación sobre un plazo de proyecto.
      </p>

      <form className="algorithm-form" onSubmit={handleSubmit}>
        
        {/* --- Inputs Principales --- */}
        <div className="form-group">
          <label htmlFor="costoInicial">Costo Inicial del Equipo ($):</label>
          <input
            type="number" id="costoInicial"
            value={costoInicial} onChange={(e) => setCostoInicial(e.target.value)}
            min="0" step="100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="plazoProyecto">Plazo del Proyecto (N, años):</label>
          <input
            type="number" id="plazoProyecto"
            value={plazoProyecto} onChange={(e) => setPlazoProyecto(e.target.value)}
            min="1" max="30" step="1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="vidaUtil">Vida Útil Máxima (n, años):</label>
          <input
            type="number" id="vidaUtil"
            value={vidaUtil} onChange={(e) => setVidaUtil(e.target.value)}
            min="1" max="10" step="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="inflacion">Índice de Inflación (Ej: 0.05):</label>
          <input
            type="number" id="inflacion"
            value={inflacion} onChange={(e) => setInflacion(e.target.value)}
            min="0" step="0.01"
          />
        </div>

        {/* --- Inputs Dependientes (Array) --- */}
        <div className="form-group">
          <label htmlFor="mantenimiento">Costos de Mantenimiento (separados por coma):</label>
          <input
            type="text" id="mantenimiento"
            value={costosMantenimiento} onChange={(e) => setCostosMantenimiento(e.target.value)}
            placeholder="Ej: 2000,2500,3000..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="reventa">Precios de Reventa (separados por coma):</label>
          <input
            type="text" id="reventa"
            value={preciosReventa} onChange={(e) => setPreciosReventa(e.target.value)}
            placeholder="Ej: 15000,10000,8000..."
          />
        </div>

        {/* --- Botones de Acción --- */}
        <div className="button-group">
          <button type="submit" className="btn-submit">
            Calcular Plan Óptimo
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

      {/* --- Sección de Resultados --- */}
      {resultados && (
        <div className="resultado">
          <h3>Resultados del Análisis</h3>
          
          {/* 1. Plan Óptimo */}
          <div className="table-container">
            <h4>Plan Óptimo de Reemplazo</h4>
            <table>
              <thead>
                <tr>
                  <th>Comprar en Año</th>
                  <th>Usar por (Años)</th>
                  <th>Costo descontado de este ciclo</th>
                </tr>
              </thead>
              <tbody>
                {resultados.planOptimo.map((decision, index) => (
                  <tr key={index}>
                    <td>{decision.anoCompra}</td>
                    <td>{decision.duracion}</td>
                    <td>${parseFloat(decision.costo).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2"><strong>Costo Total Mínimo (G(N)):</strong></td>
                  <td>
                    <strong>
                      ${parseFloat(resultados.tablaG[resultados.tablaG.length - 1].costo).toFixed(2)}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 2. Tabla G(t) */}
          <div className="table-container">
            <h4>Tabla de Análisis: Costo Mínimo Acumulado G(t)</h4>
            <table>
              <thead>
                <tr>
                  <th>Año (t)</th>
                  <th>Costo Mínimo G(t)</th>
                </tr>
              </thead>
              <tbody>
                {resultados.tablaG.map((row) => (
                  <tr key={row.t}>
                    <td>{row.t}</td>
                    <td>${row.costo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}

export default ReemplazoEquipos;