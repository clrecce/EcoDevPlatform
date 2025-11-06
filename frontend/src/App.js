import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'grapesjs/dist/css/grapes.min.css';
import grapesjs from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css'; // <-- ¡IMPORTANTE! IMPORTA EL CSS

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// URL de tu API (backend)
const API_URL = 'http://localhost:5001';

// --- CÓDIGO DE EJEMPLO (AHORA GLOBAL) ---
const CODIGO_INEFICIENTE_EJEMPLO = `import time

print("--- Iniciando Script Ineficiente ---")
lista = []
for i in range(1000000):
    lista.append(i)

# Abrir un archivo sin 'with' (mala práctica)
f = open("test.txt", "w")
f.write("test")
f.close()

print("--- Script Terminado ---")
`;

// --- Componente Helper para los Badges de Prioridad ---
const PriorityBadge = ({ prioridad }) => {
  let className = 'badge ';
  if (prioridad === 'Alta') className += 'badge-high';
  else if (prioridad === 'Media') className += 'badge-medium';
  else className += 'badge-low';
  
  // Devolvemos la cápsula de color
  return <span className={className}>{prioridad}</span>;
};

// --- Pestaña para HU-001: Requisitos ---
function RequisitosTab() {
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('Alta');
  const [requisitos, setRequisitos] = useState([]);

  // --- NUEVOS ESTADOS ---
  // Funcionalidad 2: Para el aviso de campos requeridos
  const [error, setError] = useState(null);
  // Funcionalidad 3: Para mostrar el reporte
  const [reporte, setReporte] = useState(null);
  // Funcionalidad 4: Para saber qué requisito estamos editando
  const [editingReq, setEditingReq] = useState(null); // Objeto: {id, descripcion, prioridad}

  const cargarRequisitos = async () => {
    const res = await axios.get(`${API_URL}/api/requisitos/1`);
    setRequisitos(res.data);
  };

  useEffect(() => {
    cargarRequisitos();
  }, []);

  // --- HANDLER PARA ENVIAR (Func 1 y 2) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);   // Limpiar errores
    setReporte(null); // Limpiar reporte

    // Funcionalidad 2: Avisar si está incompleto
    if (!descripcion) {
      setError('El campo "Descripción" es requerido para incluir aspectos eco-eficientes.');
      return; 
    }

    try {
      // Funcionalidad 1: Se envía al backend, que integra la estimación
      await axios.post(`${API_URL}/api/requisitos`, {
        descripcion,
        prioridad,
        proyecto_id: 1,
      });
      setDescripcion('');
      setPrioridad('Alta');
      cargarRequisitos(); // Recargar la lista
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Error al guardar el requisito.");
      }
    }
  };

  // --- HANDLER PARA REPORTE (Func 3) ---
  const handleGenerarReporte = async () => {
    setError(null); // Limpiar
    try {
      const res = await axios.get(`${API_URL}/api/requisitos/reporte/1`);
      setReporte(res.data); // data es { total_kwh_proyectado, total_requisitos }
    } catch (error) {
      setError("Error al generar el reporte.");
    }
  };

  // --- HANDLERS PARA EDICIÓN (Func 4) ---
  const handleEditClick = (req) => {
    // Al hacer clic en "Editar", guardamos el requisito en el estado 'editingReq'
    setEditingReq({ ...req }); 
    setError(null);
    setReporte(null);
  };

  const handleCancelEdit = () => {
    setEditingReq(null); // Limpiamos el estado para cancelar
  };

  const handleUpdate = async (req_id) => {
    if (!editingReq.descripcion) {
      setError("La descripción no puede estar vacía.");
      return;
    }
    
    try {
      // Funcionalidad 4: Se envía al endpoint PUT, que recalculará
      await axios.put(`${API_URL}/api/requisitos/${req_id}`, {
        descripcion: editingReq.descripcion,
        prioridad: editingReq.prioridad
      });
      setEditingReq(null); // Salimos del modo edición
      cargarRequisitos();  // Recargamos la lista con los datos actualizados
    } catch (error) {
      setError("Error al actualizar el requisito.");
    }
  };
  
  const handleDelete = async (req_id) => {
    // Confirmación simple
    if (window.confirm("¿Seguro que quieres eliminar este requisito?")) {
      try {
        await axios.delete(`${API_URL}/api/requisitos/${req_id}`);
        cargarRequisitos(); // Recargamos la lista
      } catch (error) {
        setError("Error al eliminar el requisito.");
      }
    }
  };

  return (
    <div className="Tab-container">
      <h3>Recopilación de Requisitos con Métricas Energéticas</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Descripción del Requisito:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe el requisito funcional de la aplicación..."
            rows="4"
          ></textarea>
        </div>
        <div className="form-group">
          <label>Prioridad:</label>
          <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-green">
          ✔ Validar y Agregar
        </button>
        
        {/* Funcionalidad 3 (Botón) */}
        <button type="button" onClick={handleGenerarReporte} className="btn btn-priority-medium" style={{marginLeft: '10px'}}>
          📊 Generar Reporte
        </button>
      </form>
      
      {/* Funcionalidad 2 (Display de Error) */}
      {error && <div className="form-error">{error}</div>}
      
      {/* Funcionalidad 3 (Display de Reporte) */}
      {reporte && (
        <div className="report-box">
          <h4>Reporte Preliminar de Impacto Ambiental</h4>
          <p>
            Impacto Total Proyectado: <strong>{reporte.total_kwh_proyectado.toFixed(3)} kWh</strong>
          </p>
          <p>
            Basado en <strong>{reporte.total_requisitos}</strong> requisitos.
          </p>
        </div>
      )}

      <hr />
      <h4>Vista Previa de Requisitos</h4>
      <ul className="requisitos-list">
        {requisitos.map((req) => (
          <li key={req.id}>
          
            {/* Funcionalidad 4 (Modo Edición vs. Modo Vista) */}
            {editingReq && editingReq.id === req.id ? (
              // --- MODO EDICIÓN ---
              <div className="req-edit-mode">
                <input
                  type="text"
                  value={editingReq.descripcion}
                  onChange={(e) => setEditingReq({...editingReq, descripcion: e.target.value})}
                  className="req-edit-input"
                />
                <select
                  value={editingReq.prioridad}
                  onChange={(e) => setEditingReq({...editingReq, prioridad: e.target.value})}
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
                <div className="req-actions">
                  <button onClick={() => handleUpdate(req.id)} className="btn-save">Guardar</button>
                  <button onClick={handleCancelEdit} className="btn-cancel">Cancelar</button>
                </div>
              </div>
            ) : (
              // --- MODO VISTA ---
              <>
                <span>
                  {req.descripcion} <br />
                  <small style={{ color: 'var(--text-light-secondary)' }}>
                    Estimado: {req.kwh_estimado.toFixed(2)} kWh
                  </small>
                </span>
                <div className="req-actions">
                  <PriorityBadge prioridad={req.prioridad} />
                  <button onClick={() => handleEditClick(req)} className="btn-edit">Editar</button>
                  <button onClick={() => handleDelete(req.id)} className="btn-delete">X</button>
                </div>
              </>
            )}
            
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Pestaña para HU-002: Arquitectura ---
function ArquitecturaTab() {
  const editorRef = useRef(null);
  
  // --- NUEVOS ESTADOS ---
  const [impactoProyectado, setImpactoProyectado] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    // Inicializar Grapes.js solo una vez
    if (!editorRef.current) {
      const editor = grapesjs.init({
        container: '#gjs',
        fromElement: true,
        plugins: [gjsPresetWebpage],
        storageManager: false,
        width: 'auto',
        height: '60vh', // Un poco más de altura
      });
      
      // --- Añadir componentes ECO a la biblioteca ---
      const blockManager = editor.Blocks;
      blockManager.add('eco-image-loader', {
        label: 'Eco Image Loader',
        content: '<div data-gjs-type="eco-image-loader" style="padding:10px; border:2px dashed #22C55E;">Eco Image</div>',
        category: 'Eco-Eficiente',
        attributes: { class:'gjs-block-eco' } // Clase para estilo
      });
      blockManager.add('eco-video-player', {
        label: 'Eco Video Player',
        content: '<div data-gjs-type="eco-video-player" style="padding:10px; border:2px dashed #22C55E;">Eco Video</div>',
        category: 'Eco-Eficiente',
        attributes: { class:'gjs-block-eco' }
      });
      
      editorRef.current = editor;
    }
  }, []);

  // --- NUEVAS FUNCIONES HANDLER ---

  // Característica 1, 2 y 4: Sugerir / Evaluar / Reoptimizar (Simuladas)
  const handleSugerir = async () => {
    setImpactoProyectado(null); // Limpiar cálculo anterior
    try {
      const res = await axios.get(`${API_URL}/api/componentes/sugerir`);
      setSugerencias(res.data);
    } catch (error) {
      console.error("Error al sugerir componentes:", error);
      setSugerencias([]); // Limpiar en caso de error
    }
  };

  // Característica 3: Calcular Impacto
  const handleCalcularImpacto = async () => {
    if (!editorRef.current) return;
    setSugerencias([]); // Limpiar sugerencias anteriores

    // 1. Obtener componentes del editor
    const components = editorRef.current.getComponents();
    
    // 2. Mapear a una lista simple de tipos/tags
    // Usamos una función recursiva para obtener todos los componentes anidados
    const getAllTypes = (comps) => {
      let types = [];
      comps.forEach(comp => {
        // 'tagName' es más fiable para HTML base (h1, p)
        // 'type' es para componentes custom (ej: 'eco-image-loader')
        const type = comp.get('type') !== 'default' ? comp.get('type') : comp.get('tagName');
        types.push(type);
        
        // Si tiene hijos, los procesamos
        if (comp.components().length > 0) {
          types = types.concat(getAllTypes(comp.components()));
        }
      });
      return types;
    };

    const componentList = getAllTypes(components);
    
    // 3. Enviar al backend para calcular
    try {
      const res = await axios.post(`${API_URL}/api/arquitectura/calcular_impacto`, {
        componentes: componentList
      });
      setImpactoProyectado(res.data.total_kwh_proyectado);
    } catch (error) {
      console.error("Error al calcular impacto:", error);
    }
  };

  return (
    <div className="Tab-container">
      <h3>Pantalla de Diseño de Arquitectura Low-Code</h3>
      
      {/* --- NUEVOS BOTONES (Funcionalidades 1-4) --- */}
      <div className="architecture-controls">
        {/* 1. Sugerir IA */}
        <button onClick={handleSugerir} className="btn btn-purple">
          ✨ 1. Sugerir Componentes (IA)
        </button>
        {/* 2. Evaluar Eco */}
        <button onClick={handleSugerir} className="btn btn-priority-high">
          ♻️ 2. Evaluar Alternativas Eco
        </button>
        {/* 3. Calcular Impacto */}
        <button onClick={handleCalcularImpacto} className="btn btn-green">
          ⚡ 3. Calcular Impacto Ambiental
        </button>
        {/* 4. Re-optimizar */}
        <button onClick={handleSugerir} className="btn btn-priority-medium">
          🔄 4. Re-optimizar Selección
        </button>
      </div>

      {/* --- NUEVOS RESULTADOS --- */}
      {impactoProyectado !== null && (
        <div className="impact-result">
          Impacto Ambiental Proyectado: <strong>{impactoProyectado.toFixed(3)} kWh</strong>
        </div>
      )}
      
      {sugerencias.length > 0 && (
        <div className="suggestions-box">
          <h4>Sugerencias Eco-Eficientes (IA):</h4>
          <ul>
            {sugerencias.map(sug => (
              <li key={sug.tipo}>
                <strong>{sug.nombre} ({sug.tipo})</strong>: {sug.kwh} kWh 
                (Alternativa a: <em>{sug.alternativa_a}</em>)
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* El lienzo de GrapesJS */}
      <div id="gjs"></div>
    </div>
  );
}

// --- Pestaña para HU-003: Optimizador (MODIFICADA) ---
// Ahora recibe {codigo, setCodigo} como props
function OptimizadorTab({ codigo, setCodigo }) {
  // const [codigo, setCodigo] = useState(CODIGO_INEFICIENTE_EJEMPLO); // <-- ESTADO MOVIDO A App()
  const [resultado, setResultado] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [error, setError] = useState(null);

  // Limpia los resultados anteriores
  const clearResults = () => {
    setResultado(null);
    setSugerencias([]);
    setError(null);
  }

  // Funcionalidad (Problema 1): Renombrado para ser claro
  const handleRestablecerEjemplo = () => {
    clearResults();
    setCodigo(CODIGO_INEFICIENTE_EJEMPLO); // <-- Usa la prop setCodigo
  }

  // Funcionalidad 3: Validar eficiencia
  const handleAnalizar = async () => {
    clearResults();
    setResultado('Analizando...');
    try {
      const res = await axios.post(`${API_URL}/api/codigo/analizar`, {
        codigo, // <-- Usa la prop codigo
      });
      setResultado(
        `Análisis completado:\n  Emisiones CO2: ${res.data.emisiones_co2.toFixed(6)} kg\n  Consumo CPU: ${res.data.consumo_cpu.toFixed(5)} %`
      );
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error en el análisis.');
      }
      setResultado(null);
    }
  };

  // Funcionalidad 1 y 2: Optimizar y Reducir
  const handleOptimizar = async () => {
    clearResults();
    setResultado('Optimizando y re-analizando...');
    try {
      const res = await axios.post(`${API_URL}/api/codigo/optimizar`, {
        codigo, // <-- Usa la prop codigo
      });
      
      // Actualiza el <textarea> con el código optimizado
      setCodigo(res.data.nuevo_codigo); // <-- Usa la prop setCodigo
      
      // Muestra el nuevo resultado (reducido)
      const r = res.data.resultado;
      setResultado(
        `¡OPTIMIZADO! (Reducción ~70-90%)\n  Nuevas Emisiones CO2: ${r.emisiones_co2.toFixed(6)} kg\n  Nuevo Consumo CPU: ${r.consumo_cpu.toFixed(5)} %`
      );
    } catch (err) {
       if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error en la optimización.');
      }
      setResultado(null);
    }
  }
  
  // Funcionalidad 4: Sugerir Mejoras
  const handleSugerir = async () => {
    clearResults();
    try {
      const res = await axios.post(`${API_URL}/api/codigo/sugerir`, {
        codigo, // <-- Usa la prop codigo
      });
      setSugerencias(res.data.sugerencias); // [{linea, sugerencia}, ...]
    } catch (err) {
      setError('Error al obtener sugerencias.');
    }
  }

  return (
    <div className="Tab-container">
      <h3>Pantalla de Generación y Optimización de Código con IA</h3>
      
      {/* Nuevos Controles para HU-003 */}
      <div className="code-controls">
        <button onClick={handleRestablecerEjemplo} className="btn btn-priority-high">
          1. Restablecer Ejemplo
        </button>
        <button onClick={handleOptimizar} className="btn btn-purple">
          2. Optimizar Código (IA)
        </button>
        <button onClick={handleAnalizar} className="btn btn-green">
          3. Validar Eficiencia (Analizar)
        </button>
        <button onClick={handleSugerir} className="btn btn-priority-medium">
          4. Sugerir Mejoras (IA)
        </button>
      </div>

      <div className="form-group">
        <label>Editor de Código (Python) - (Compartido con Pruebas)</label>
        <textarea
          value={codigo} // <-- Usa la prop codigo
          onChange={(e) => setCodigo(e.target.value)} // <-- Usa la prop setCodigo
          rows="15"
          style={{fontFamily: 'Courier New', 'fontSize': '1rem'}}
        ></textarea>
      </div>

      {/* Display de Error */}
      {error && <div className="form-error">{error}</div>}

      {/* Display de Resultado (Análisis / Optimización) */}
      {resultado && (
        <pre className="optimizer-result">{resultado}</pre>
      )}
      
      {/* Display de Sugerencias (Funcionalidad 4) */}
      {sugerencias.length > 0 && (
        <div className="suggestions-box" style={{marginTop: '15px'}}>
          <h4>Sugerencias de la IA:</h4>
          <ul>
            {sugerencias.map((sug, index) => (
              <li key={index}>
                {sug.sugerencia}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Pestaña para HU-004: PRUEBAS ---
function PruebasTab({ codigo }) { // Recibe el código compartido
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEjecutarPruebas = async () => {
    setError(null);
    setReporte(null);
    setIsLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/api/pruebas/ejecutar`, {
        codigo,
      });
      setReporte(res.data); // data = { pasaron, mensaje, alerta_pico, metricas, reduccion_comparativa }
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al ejecutar las pruebas.');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="Tab-container">
      <h3>Ejecución de Pruebas con Evaluación Energética</h3>
      <p>
        El código del editor de la pestaña "Codificación" se usará para ejecutar las pruebas.
      </p>
      <button onClick={handleEjecutarPruebas} className="btn btn-green" disabled={isLoading}>
        {isLoading ? "Ejecutando..." : "▶️ Ejecutar Pruebas Funcionales y de Eficiencia"}
      </button>

      {/* Display de Error */}
      {error && <div className="form-error">{error}</div>}

      {/* Display de Reporte de Pruebas */}
      {reporte && (
        <div className={`report-box-pruebas ${reporte.pasaron ? 'report-success' : 'report-fail'}`}>
          <h4>{reporte.pasaron ? '✔ PRUEBAS SUPERADAS' : '❌ PRUEBAS FALLIDAS'}</h4>
          <p>{reporte.mensaje}</p>

          {/* Funcionalidad 4: Alerta de Pico */}
          {reporte.alerta_pico && (
            <div className="form-error" style={{marginTop: '10px'}}>
              <strong>Alerta de Ineficiencia:</strong> {reporte.alerta_pico}
            </div>
          )}
          
          <hr />
          
          {/* Funcionalidad 1: Métricas de Consumo */}
          <h4>Métricas de Consumo (Funcionalidad 1)</h4>
          <p>
            Emisiones CO2 (durante la prueba): <strong>{reporte.metricas.emisiones_co2.toFixed(6)} kg</strong>
          </p>
          <p>
            Consumo CPU (durante la prueba): <strong>{reporte.metricas.consumo_cpu.toFixed(5)} %</strong>
          </p>

          <hr />

          {/* Funcionalidad 3: Reporte de Reducción */}
          <h4>Reporte Comparativo (Funcionalidad 3)</h4>
          <p>
            Reducción de CO2 (vs. método tradicional): <strong>{reporte.reduccion_comparativa}</strong>
          </p>
        </div>
      )}
    </div>
  );
}


// --- Pestaña para HU-005: Dashboard ---
const UMBRAL_PICO_CO2 = 0.0003; 

function DashboardTab() {
  const [chartData, setChartData] = useState(null);
  const [alerta, setAlerta] = useState(null);
  
  const cargarMetricas = async () => {
    setAlerta(null); 
    const { data } = await axios.get(`${API_URL}/api/metricas/1`);

    // Funcionalidad 2: Detectar picos
    const picosDetectados = data.data_co2.filter(val => val > UMBRAL_PICO_CO2);
    if (picosDetectados.length > 0) {
      setAlerta(
        `¡PICO DETECTADO! Se ${picosDetectados.length > 1 ? 'detectaron' : 'detectó'} ${picosDetectados.length} ${picosDetectados.length > 1 ? 'análisis' : 'análisis'} que superan el umbral eco-eficiente de ${UMBRAL_PICO_CO2.toFixed(5)} kg CO2. Se recomienda optimización.`
      );
    }
    
    // Funcionalidad 3: Comparar con Benchmark
    const benchmarkData = Array(data.labels.length).fill(UMBRAL_PICO_CO2);
    
    setChartData({
      labels: data.labels,
      datasets: [
        {
          label: 'Emisiones CO2 (kg)',
          data: data.data_co2,
          borderColor: 'var(--accent-green)', 
          backgroundColor: 'rgba(34, 197, 94, 0.3)',
          tension: 0.1
        },
        {
          label: 'Consumo CPU (%)',
          data: data.data_cpu,
          borderColor: 'var(--accent-purple)', 
          backgroundColor: 'rgba(168, 85, 247, 0.3)',
          tension: 0.1
        },
        // Funcionalidad 3: Línea de Benchmark
        {
          label: 'Benchmark Eco-Eficiente (Umbral)',
          data: benchmarkData,
          borderColor: 'var(--priority-high)',
          backgroundColor: 'rgba(249, 115, 22, 0.3)',
          borderDash: [5, 5], // Línea punteada
          tension: 0.1,
          pointRadius: 0 // Sin puntos
        }
      ],
    });
  };

  // Opciones del Gráfico para que sea Dark Mode
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        ticks: { color: 'var(--text-light-secondary)' },
        // --- CAMBIO SOLICITADO ---
        grid: { color: '#64748B' } // Un gris-azulado claro para la grilla
      },
      x: {
        ticks: { color: 'var(--text-light-secondary)' },
        // --- CAMBIO SOLICITADO ---
        grid: { color: '#64748B' } // Un gris-azulado claro para la grilla
      }
    },
    plugins: {
      legend: {
        labels: { color: 'var(--text-light-primary)' }
      }
    }
  };

  // Funcionalidad 4: Exportar Reporte (Simulado)
  const handleExportar = () => {
    // Simulamos la exportación con una alerta
    const reduccionEstimada = "92.5%"; // Valor de ejemplo (de HU-004)
    window.alert(
      `REPORTE EXPORTADO (Simulación)\n\n` +
      `Estimación de Reducción de CO2 (vs. tradicional): ${reduccionEstimada}\n` +
      `Picos detectados: ${alerta ? 'Sí' : 'No'}\n` +
      `Total de análisis en BBDD: ${chartData ? chartData.labels.length : 0}`
    );
  };

  return (
    <div className="Tab-container">
      <h3>Dashboard de Métricas Ambientales (IA)</h3>
      <div className="code-controls">
        {/* Funcionalidad 1: Visualizar métricas */}
        <button onClick={cargarMetricas} className="btn btn-green">
          Actualizar Dashboard (Cargar datos)
        </button>
        {/* Funcionalidad 4: Exportar */}
        <button onClick={handleExportar} className="btn btn-priority-medium">
          Exportar Reporte
        </button>
      </div>

      <div className="dashboard-container">
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p>Presiona "Actualizar" para cargar los datos históricos de la BBDD.</p>
        )}
      </div>

      {/* Funcionalidad 3: Texto de Benchmark */}
      <p className="dashboard-info">
        La línea naranja punteada representa el "Benchmark Eco-Eficiente" (Umbral de pico). 
        Cualquier análisis por encima de esta línea requiere optimización.
      </p>

      {/* Funcionalidad 2: Alerta de Pico */}
      {alerta && (
        <div className="dashboard-alert">
          <strong>Alerta de IA:</strong> {alerta}
        </div>
      )}
    </div>
  );
}

// --- Pestaña para HU-006: REFACTORIZACIÓN ---
function RefactorizacionTab({ codigo, setCodigo }) {
  const [resultado, setResultado] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [error, setError] = useState(null);

  // Limpia los resultados anteriores
  const clearResults = () => {
    setResultado(null);
    setSugerencias([]);
    setError(null);
  }

  // Criterio 1: Proporcionar sugerencias
  const handleSugerir = async () => {
    clearResults();
    try {
      const res = await axios.post(`${API_URL}/api/codigo/sugerir`, {
        codigo,
      });
      setSugerencias(res.data.sugerencias); // [{linea, sugerencia}, ...]
    } catch (err) {
      setError('Error al obtener sugerencias.');
    }
  }

  // Criterio 3: Eliminar estructuras ineficientes (Auto)
  const handleOptimizar = async () => {
    clearResults();
    setResultado('Optimizando y re-analizando...');
    try {
      const res = await axios.post(`${API_URL}/api/codigo/optimizar`, {
        codigo, 
      });
      setCodigo(res.data.nuevo_codigo); 
      const r = res.data.resultado;
      setResultado(
        `¡Refactorización automática completada!\n  Nuevas Emisiones CO2: ${r.emisiones_co2.toFixed(6)} kg\n  Nuevo Consumo CPU: ${r.consumo_cpu.toFixed(5)} %`
      );
    } catch (err) {
       if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error en la optimización.');
      }
      setResultado(null);
    }
  }

  // Criterio 2: Validar mejora (Medir)
  const handleAnalizar = async () => {
    clearResults();
    setResultado('Validando mejora (midiendo)...');
    try {
      const res = await axios.post(`${API_URL}/api/codigo/analizar`, {
        codigo, 
      });
      setResultado(
        `Validación completada:\n  Emisiones CO2: ${res.data.emisiones_co2.toFixed(6)} kg\n  Consumo CPU: ${res.data.consumo_cpu.toFixed(5)} %`
      );
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error en el análisis.');
      }
      setResultado(null);
    }
  };


  return (
    <div className="Tab-container">
      <h3>Refactorización de Código con Sugerencias IA (HU-006)</h3>
      <p>
        Este panel te permite aplicar sugerencias de la IA y medir el impacto de la refactorización.
        El impacto mejorado se registra automáticamente (Criterio 4) y es visible en el Dashboard.
      </p>
      
      <div className="code-controls">
        <button onClick={handleSugerir} className="btn btn-purple">
          1. Proporcionar Sugerencias (IA)
        </button>
         <button onClick={handleOptimizar} className="btn btn-priority-high">
          3. Eliminar Ineficiencias (Auto)
        </button>
        <button onClick={handleAnalizar} className="btn btn-green">
          2. Validar Mejora (Medir)
        </button>
      </div>

      <div className="form-group">
        <label>Editor de Código (Python) - (Compartido)</label>
        <textarea
          value={codigo} // <-- Usa la prop codigo
          onChange={(e) => setCodigo(e.target.value)} // <-- Usa la prop setCodigo
          rows="15"
          style={{fontFamily: 'Courier New', 'fontSize': '1rem'}}
        ></textarea>
      </div>

      {/* Display de Error */}
      {error && <div className="form-error">{error}</div>}

      {/* Display de Resultado (Análisis / Optimización) */}
      {resultado && (
        <pre className="optimizer-result">{resultado}</pre>
      )}
      
      {/* Display de Sugerencias (Criterio 1) */}
      {sugerencias.length > 0 && (
        <div className="suggestions-box" style={{marginTop: '15px'}}>
          <h4>Sugerencias de la IA (Criterio 1):</h4>
          <ul>
            {sugerencias.map((sug, index) => (
              <li key={index}>
                {sug.sugerencia}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Pestaña para HU-007: REPORTES ---
function ReportesTab() {
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // CA 1: Generar reporte automático
  const handleGenerarReporte = async () => {
    setError(null);
    setReporte(null);
    setIsLoading(true);
    
    try {
      const res = await axios.get(`${API_URL}/api/reportes/generar`);
      setReporte(res.data); // data = { total_co2_generado, total_co2_tradicional_simulado, reduccion_porcentaje, ... }
    } catch (err) {
      // CA 3: Avisar si el reporte está incompleto
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al generar el reporte.');
      }
    }
    setIsLoading(false);
  };
  
  // CA 4: Exportar reporte final
  const handleExportar = () => {
    if (!reporte) {
      setError("Primero debe generar un reporte para poder exportarlo.");
      return;
    }
    // Simulamos la exportación (similar a HU-005)
    window.alert(
      `REPORTE AMBIENTAL FINAL (Simulación)\n\n` +
      `IMPACTO SOSTENIBLE (Visualización):\n` +
      `----------------------------------------\n` +
      `Emisiones Totales (Optimizadas): ${reporte.total_co2_generado.toFixed(6)} kg CO2\n` +
      `Emisiones (Método Tradicional): ${reporte.total_co2_tradicional_simulado.toFixed(6)} kg CO2\n` +
      `>> REDUCCIÓN DE EMISIONES: ${reporte.reduccion_porcentaje.toFixed(2)} %\n` +
      `----------------------------------------\n` +
      `Total de Análisis Registrados: ${reporte.total_analisis_realizados}`
    );
  };

  return (
    <div className="Tab-container">
      <h3>Generación de Reportes Ambientales (HU-007)</h3>
      <p>
        Genera un reporte final que resume todas las métricas de CO2 monitoreadas en la base de datos.
      </p>
      
      <div className="code-controls">
        <button onClick={handleGenerarReporte} className="btn btn-purple" disabled={isLoading}>
          {isLoading ? "Generando..." : "1. Generar Reporte Automático"}
        </button>
        <button onClick={handleExportar} className="btn btn-priority-medium" disabled={!reporte}>
          4. Exportar Reporte Final
        </button>
      </div>

      {/* CA 3: Display de Error (Reporte incompleto) */}
      {error && <div className="form-error">{error}</div>}

      {/* CA 1 y 2: Mostrar Reporte */}
      {reporte && (
        <div className="report-final-box">
          <h4 style={{color: 'var(--accent-green)', marginTop: 0}}>Reporte Ambiental Final Generado</h4>
          <p>
            Basado en **{reporte.total_analisis_realizados}** análisis de rendimiento registrados en la base de datos.
          </p>
          
          <div className="report-stats">
            {/* CA 1: Estimaciones de CO2 */}
            <div className="stat-card">
              <div className="stat-card-label">Emisiones Totales (Optimizadas)</div>
              <div className="stat-card-value">{reporte.total_co2_generado.toFixed(6)} kg</div>
            </div>
            
            {/* CA 2: Datos Comparativos */}
            <div className="stat-card">
              <div className="stat-card-label">Reducción vs. Tradicional</div>
              <div className="stat-card-value green">{reporte.reduccion_porcentaje.toFixed(2)} %</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// --- NUEVA PESTAÑA PARA HU-008: DESPLIEGUE ---
// ===================================================================
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function DespliegueTab() {
  const [preCheck, setPreCheck] = useState(null);
  const [deployLog, setDeployLog] = useState("A la espera de la revisión de métricas...");
  const [issueReport, setIssueReport] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // CA 1: Revisar métricas eco-eficientes
  const handlePreCheck = async () => {
    setError(null);
    setIssueReport(null);
    setDeployLog("Ejecutando revisión (Pre-flight check)...");
    setIsLoading(true);
    
    try {
      const res = await axios.get(`${API_URL}/api/despliegue/pre-check`);
      setPreCheck(res.data); // data = { metrica_actual_co2, benchmark_co2, pasa_revision }
      if (res.data.pasa_revision) {
        setDeployLog("Revisión APROBADA. Listo para desplegar.");
      } else {
         setDeployLog("Revisión FALLIDA. El último análisis supera el benchmark.");
      }
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al revisar las métricas.');
      }
    }
    setIsLoading(false);
  };

  // CA 3: Iniciar despliegue y confirmar alineación
  const handleDeploy = async () => {
    setError(null);
    setIssueReport(null);
    setDeployLog("Iniciando despliegue en entorno cloud (simulado)...\n");
    setIsLoading(true);
    
    await sleep(1000);
    setDeployLog(log => log + "Conectando con AWS...\n");
    await sleep(1500);
    setDeployLog(log => log + "Provisionando contenedores...\n");
    await sleep(1000);
    setDeployLog(log => log + "Ejecutando health-check...\n");
    await sleep(500);
    setDeployLog(log => log + "¡DESPLIEGUE COMPLETADO!\n\n");
    
    // CA 3: Confirmar alineación
    setDeployLog(log => log + "VALIDACIÓN (CA 3): Despliegue completado. Se confirma la alineación con los objetivos de reducción de huella de carbono.");
    setIsLoading(false);
  };

  // CA 2: Correlacionar issue
  const handleSimularIssue = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/despliegue/simular-issue`);
      setIssueReport(res.data); // data = { correlacion_energetica, mensaje, ... }
    } catch (err) {
       setError('Error al analizar el issue.');
    }
     setIsLoading(false);
  };
  
  // CA 4: Registrar feedback
  const handleFeedback = () => {
    if(!feedback) return;
    alert(`FEEDBACK REGISTRADO (CA 4):\n\n"${feedback}"\n\nEste feedback se usará para optimizar futuras iteraciones.`);
    setFeedback("");
  }

  return (
    <div className="Tab-container">
      <h3>Despliegue y Revisión de Métricas (HU-008)</h3>

      {/* --- ETAPA 1: REVISIÓN (CA 1) --- */}
      <div className="deploy-step">
        <h4>Paso 1: Revisión de Métricas (CA 1)</h4>
        <p>
          Antes de desplegar, se revisa la última métrica de CO2 registrada en la BBDD 
          contra el benchmark del proyecto.
        </p>
        <button onClick={handlePreCheck} className="btn btn-purple" disabled={isLoading}>
          1. Revisar Métricas Eco-Eficientes
        </button>
        {preCheck && (
          <div className={`pre-check-report ${preCheck.pasa_revision ? 'pre-check-pass' : 'pre-check-fail'}`}>
            {preCheck.pasa_revision ? '✔ REVISIÓN APROBADA' : '❌ REVISIÓN FALLIDA'}
            <br />
            Métrica Actual: {preCheck.metrica_actual_co2.toFixed(6)} kg CO2
            <br />
            Benchmark: {preCheck.benchmark_co2.toFixed(6)} kg CO2
          </div>
        )}
      </div>

      {/* --- ETAPA 2: DESPLIEGUE (CA 3) --- */}
      <div className="deploy-step">
        <h4>Paso 2: Despliegue y Validación (CA 3)</h4>
        <p>Inicia el despliegue simulado al entorno cloud.</p>
        <button onClick={handleDeploy} className="btn btn-green" disabled={isLoading || !preCheck || !preCheck.pasa_revision}>
          2. Iniciar Despliegue
        </button>
        <pre className="deploy-log">{deployLog}</pre>
      </div>

      {/* --- ETAPA 3: ISSUES (CA 2) --- */}
      <div className="deploy-step">
        <h4>Paso 3: Análisis Post-Despliegue (CA 2)</h4>
        <p>Simula la detección de un issue (ej. "slow performance") y usa la IA para correlacionarlo con la última métrica energética.</p>
        <button onClick={handleSimularIssue} className="btn btn-priority-high" disabled={isLoading}>
          3. Simular Issue Post-Despliegue
        </button>
        {issueReport && (
           <div className={`pre-check-report ${!issueReport.correlacion_energetica ? 'pre-check-pass' : 'pre-check-fail'}`}>
             {issueReport.mensaje}
           </div>
        )}
      </div>

      {/* --- ETAPA 4: FEEDBACK (CA 4) --- */}
      <div className="deploy-step">
        <h4>Paso 4: Registrar Feedback (CA 4)</h4>
        <p>Registra feedback inicial para optimizar futuras iteraciones sostenibles.</p>
        <div className="form-group">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows="3"
            placeholder="Escribe tu feedback aquí..."
          ></textarea>
        </div>
        <button onClick={handleFeedback} className="btn btn-priority-medium">
          4. Registrar Feedback
        </button>
      </div>

      {/* Display de Error General */}
      {error && <div className="form-error">{error}</div>}
      
    </div>
  );
}


// --- Componente Principal de la App ---
function App() {
  const [tab, setTab] = useState('requisitos');
  
  // --- LEVANTAMOS EL ESTADO DEL CÓDIGO ---
  const [codigo, setCodigo] = useState(CODIGO_INEFICIENTE_EJEMPLO);

  const renderTab = () => {
    switch (tab) {
      case 'requisitos':
        return <RequisitosTab />;
      case 'arquitectura':
        return <ArquitecturaTab />;
      case 'optimizador':
        // Pasamos el estado y el 'setter' como props
        return <OptimizadorTab codigo={codigo} setCodigo={setCodigo} />;
      case 'pruebas':
        // Pasamos solo el estado (solo necesita leerlo)
        return <PruebasTab codigo={codigo} />;
      case 'refactor': // <-- HU-006
        return <RefactorizacionTab codigo={codigo} setCodigo={setCodigo} />;
      case 'reportes': // <-- HU-007
        return <ReportesTab />;
      case 'despliegue': // <-- NUEVO CASO (HU-008)
        return <DespliegueTab />;
      case 'dashboard': // <-- HU-005
        return <DashboardTab />;
      default:
        return <RequisitosTab />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>EcoDev Platform</h1>
      </header>
      {/* Barra de Navegación (Tabs) */}
      <nav className="App-nav">
        <button 
          className={tab === 'requisitos' ? 'active' : ''} 
          onClick={() => setTab('requisitos')}>
            Requisitos
        </button>
        <button 
          className={tab === 'arquitectura' ? 'active' : ''} 
          onClick={() => setTab('arquitectura')}>
            Diseño de Arquitectura
        </button>
        <button 
          className={tab === 'optimizador' ? 'active' : ''} 
          onClick={() => setTab('optimizador')}>
            Codificación
        </button>
        <button 
          className={tab === 'pruebas' ? 'active' : ''} 
          onClick={() => setTab('pruebas')}>
            Pruebas
        </button>
        <button 
          className={tab === 'refactor' ? 'active' : ''} 
          onClick={() => setTab('refactor')}>
            Refactorización
        </button>
        <button 
          className={tab === 'reportes' ? 'active' : ''} 
          onClick={() => setTab('reportes')}>
            Reportes
        </button>
        {/* --- NUEVO BOTÓN DE NAVEGACIÓN --- */}
        <button 
          className={tab === 'despliegue' ? 'active' : ''} 
          onClick={() => setTab('despliegue')}>
            Despliegue
        </button>
        <button 
          className={tab === 'dashboard' ? 'active' : ''} 
          onClick={() => setTab('dashboard')}>
            Dashboard
        </button>
      </nav>
      {/* Contenido de la pestaña activa */}
      {renderTab()}
    </div>
  );
}

export default App;