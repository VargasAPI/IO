import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/Main.css"

function Main() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);
// Definición de los algoritmos disponibles
const algorithms = [
    {
      id: 1,
      name: "Reemplazo de Equipos",
      description: "Determina el momento óptimo para reemplazar equipos basándose en costos de mantenimiento y depreciación.",
      path: "/reemplazo-equipos"
    },
    {
      id: 2,
      name: "Árboles Binarios de Búsqueda Óptimos",
      description: "Construye árboles de búsqueda que minimizan el costo promedio de búsqueda según frecuencias de acceso.",
      path: "/arboles-binarios" 
    },
    {
      id: 3,
      name: "Series Deportivas",
      description: "Calcula la probabilidad de ganar una serie deportiva utilizando programación dinámica.",
      path: "/series-deportivas"
    },
    {
      id: 4,
      name: "Multiplicación de Matrices",
      description: "Encuentra el orden óptimo para multiplicar una cadena de matrices minimizando operaciones.",
      path: "/multiplicacion-matrices"
    }
  ];
// Navegación a la página del algoritmo seleccionado
  const handleAlgorithmClick = (path) => {
    navigate(path);
  };
// Salir 
  const handleExit = () => {
    if (window.confirm("¿Está seguro que desea salir?")) {
      window.close();
    }
  };
// estructura jsx -> html
  return (
    <div className="container">
      <h1>Bienvenidos</h1>
      <h3>Seleccione el algoritmo a probar</h3>
      
      <div className="menu-grid">
        {/* Esta seccion  mapea los algo con id y nos da su info*/}
        {algorithms.map((algorithm) => (
          <div 
            key={algorithm.id}
            className="menu-item-wrapper"
            onMouseEnter={() => setHoveredId(algorithm.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div 
              className="menu-item"
              onClick={() => handleAlgorithmClick(algorithm.path)}
            >
              {algorithm.name}
            </div>
            {hoveredId === algorithm.id && (
              <div className="tooltip">
                {algorithm.description}
              </div>
            )}
          </div>
        ))}
        
        <div 
          className="menu-item-wrapper"
          onMouseEnter={() => setHoveredId('exit')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div 
            className="menu-item exit"
            onClick={handleExit}
          >
            Salir del Programa
          </div>
          {hoveredId === 'exit' && (
            <div className="tooltip">
              Cerrar la aplicación
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Main;