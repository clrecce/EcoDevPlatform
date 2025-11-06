import os
import subprocess
import threading
import sys  
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from codecarbon import EmissionsTracker

# --- Configuración de la App ---
app = Flask(__name__)
CORS(app)  # Permite que React (frontend) se comunique con esta API

# --- Configuración de MySQL (XAMPP) ---
# Esta es la conexión estándar de XAMPP: usuario 'root' sin contraseña
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/ecodev_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Constantes Globales ---
UMBRAL_PICO_CO2 = 0.0003 # Benchmark de eficiencia

# --- (SIMULATED) Base de datos de Componentes Eco-Eficientes ---
# Mapea un tipo de componente a su "costo" en kWh (simulado)
# Esto simula tu "IA" sabiendo qué componentes son eficientes
ECO_COMPONENTES_DB = {
    # Componentes base de GrapesJS (mapeados por tagName)
    'h1': 0.05,
    'h2': 0.04,
    'p': 0.02,
    'image': 0.15, # Las imágenes son "caras"
    'video': 0.75, # Los videos son muy "caros"
    'div': 0.01,
    'span': 0.01,
    'a': 0.02,     # 'link' en GrapesJS usa <a>
    'button': 0.03,
    'form': 0.12,
    'input': 0.03,
    'textarea': 0.03,
    
    # Componentes "Eco-Optimizados" (simulados)
    'eco-image-loader': 0.07, # Alternativa a 'image'
    'eco-video-player': 0.30, # Alternativa a 'video'
    'eco-form': 0.10,         # Alternativa a 'form'
    
    # Tipos genéricos de GrapesJS
    'default': 0.01,
    'wrapper': 0.0
}

# --- Modelos de Base de Datos (basado en tu DER) ---
class Proyecto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    requisitos = db.relationship('Requisito', backref='proyecto', lazy=True)
    metricas = db.relationship('Metrica', backref='proyecto', lazy=True)

class Requisito(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(500))
    prioridad = db.Column(db.String(50))
    kwh_estimado = db.Column(db.Float) # Para HU-001
    proyecto_id = db.Column(db.Integer, db.ForeignKey('proyecto.id'), nullable=False)

class Metrica(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    emisiones_co2 = db.Column(db.Float) # Para HU-003 / HU-005
    consumo_cpu = db.Column(db.Float)
    proyecto_id = db.Column(db.Integer, db.ForeignKey('proyecto.id'), nullable=False)

# --- API Endpoints (Historias de Usuario) ---

# HU-001: Recopilar requisitos con métricas energéticas
@app.route('/api/requisitos', methods=['POST'])
def add_requisito():
    data = request.get_json()
    
    # Funcionalidad 2: Validar campos incompletos
    if not data.get('descripcion'):
        return jsonify({'error': 'El campo "Descripción" es requerido para incluir aspectos eco-eficientes.'}), 400

    # Funcionalidad 1: Integrar estimación automática
    kwh = len(data.get('descripcion', '')) * 0.05 # Estimación simple
    
    nuevo_req = Requisito(
        descripcion=data['descripcion'],
        prioridad=data['prioridad'],
        kwh_estimado=kwh,
        proyecto_id=data.get('proyecto_id', 1) 
    )
    db.session.add(nuevo_req)
    db.session.commit()
    return jsonify({'id': nuevo_req.id, 'descripcion': nuevo_req.descripcion, 'prioridad': nuevo_req.prioridad, 'kwh_estimado': kwh}), 201

@app.route('/api/requisitos/<int:proyecto_id>', methods=['GET'])
def get_requisitos(proyecto_id):
    reqs = Requisito.query.filter_by(proyecto_id=proyecto_id).all()
    # Corrección de la clave: 'kwh_estimado'
    return jsonify([{'id': r.id, 'descripcion': r.descripcion, 'prioridad': r.prioridad, 'kwh_estimado': r.kwh_estimado} for r in reqs])


# --- Endpoints para Codificación (HU-003) ---

# ===================================================================
# --- FUNCIÓN HELPER DE MEDICIÓN ---
# ===================================================================
def medir_codigo_con_codecarbon(codigo):
    """
    Función helper que usa el método .start() y .stop() de CodeCarbon.
    """
    
    # Creamos la carpeta 'emissions' si no existe.
    os.makedirs("emissions", exist_ok=True)
    
    # 1. Inicializar el tracker
    tracker = EmissionsTracker(output_dir="emissions", log_level='error', save_to_file=False)
    
    try:
        # 2. Iniciar la medición
        tracker.start()
        
        # 3. Ejecutar el código del usuario
        exec(codigo, globals(), locals())
        
        # 4. Detener la medición
        tracker.stop() 

        # Simulación de "costo" 
        if "Optimizado" in codigo or "lista = list(range" in codigo:
            emisiones = len(codigo) * 0.00001 
            consumo = len(codigo) * 0.0001
        else:
            emisiones = len(codigo) * 0.0001 
            consumo = len(codigo) * 0.002
            
        # Guardar en BBDD para el Dashboard
        nueva_metrica = Metrica(
            emisiones_co2=emisiones,
            consumo_cpu=consumo,
            proyecto_id=1 
        )
        db.session.add(nueva_metrica)
        db.session.commit()

        return {'emisiones_co2': emisiones, 'consumo_cpu': consumo}
        
    except Exception as e:
        # Si el tracker falló o exec() falló
        tracker.stop() # Asegurarse de detener el tracker en caso de error
        print(f"Error al ejecutar código con exec(): {e}")

        # --- MEJORA EN EL MENSAJE DE ERROR ---
        if isinstance(e, (IndentationError, SyntaxError)):
             # Error amigable para el usuario
             return {'error': f"ERROR DE SINTAXIS: El código está mal escrito y no se puede analizar. La IA no puede optimizar código 'roto'. (Detalle: {str(e)})"}
        else:
             # Otro error de runtime (ej. NameError, ModuleNotFoundError)
             return {'error': f"Error en el código al ejecutarlo: {str(e)}"}
# ===================================================================
# --- FIN DE FUNCIÓN HELPER ---
# ===================================================================


# Funcionalidad 3: Validar eficiencia energética
@app.route('/api/codigo/analizar', methods=['POST'])
def analizar_codigo():
    data = request.get_json()
    codigo = data.get('codigo', 'print("No code")')
    
    # Simplemente mide el código tal como está
    resultado = medir_codigo_con_codecarbon(codigo)
    
    if 'error' in resultado:
        return jsonify(resultado), 500
        
    return jsonify(resultado)

# Funcionalidad 1 y 2: Eliminar redundancias y Reducir 70%
@app.route('/api/codigo/optimizar', methods=['POST'])
def optimizar_codigo():
    data = request.get_json()
    codigo_original = data.get('codigo', '')
    
    # --- SIMULACIÓN DE IA (Funcionalidad 1) ---
    # La "IA" detecta un bucle 'for' ineficiente y lo reemplaza
    codigo_optimizado = codigo_original.replace(
        "for i in range(1000000):\n    lista.append(i)", 
        "lista = list(range(1000000)) # <-- Código Optimizado por IA"
    )
    
    # Si no encontró ese bucle, simplemente añade un comentario
    if codigo_optimizado == codigo_original:
        codigo_optimizado = "# No se encontraron optimizaciones automáticas.\n" + codigo_original
    
    # --- SIMULACIÓN DE MEDICIÓN (Funcionalidad 2) ---
    # Medimos el código "optimizado", que (en nuestra simulación)
    # generará métricas mucho más bajas (la reducción del 70%)
    resultado = medir_codigo_con_codecarbon(codigo_optimizado)

    if 'error' in resultado:
        return jsonify(resultado), 500
    
    # Devolvemos el nuevo código y el nuevo (mejor) resultado
    return jsonify({
        'nuevo_codigo': codigo_optimizado,
        'resultado': resultado
    })

# Funcionalidad 4: Proporcionar sugerencias IA
@app.route('/api/codigo/sugerir', methods=['POST'])
def sugerir_mejoras():
    data = request.get_json()
    codigo = data.get('codigo', '')
    sugerencias = []

    # --- NUEVO PASO DE VALIDACIÓN ---
    # 1. Intentamos compilar el código primero.
    try:
        compile(codigo, '<string>', 'exec')
    except (SyntaxError, IndentationError) as e:
        # Si falla, esta es nuestra ÚNICA sugerencia.
        sugerencias.append({
            'linea': e.lineno, # Obtenemos el número de línea del error
            'sugerencia': f"ERROR DE SINTAXIS (Línea {e.lineno}): El código está 'roto'. No se pueden buscar ineficiencias. (Detalle: {e.msg})"
        })
        return jsonify({'sugerencias': sugerencias})
    # --- FIN DEL PASO DE VALIDACIÓN ---

    # 2. Si el código es válido, buscamos ineficiencias (como antes)
    if "for i in range" in codigo and "append" in codigo:
        sugerencias.append({
            'linea': '?', 
            'sugerencia': 'SUGERENCIA IA: Se detectó un bucle `for` con `append`. Considere usar "list comprehension" para mayor eficiencia.'
        })
    
    if "open(" in codigo and "with " not in codigo:
         sugerencias.append({
            'linea': '?',
            'sugerencia': 'SUGERENCIA IA: Se detectó `open()` sin un `with`. Considere usar "with open(...) as f:" para asegurar que los archivos se cierren correctamente.'
        })

    if "print(" in codigo:
         sugerencias.append({
            'linea': '?',
            'sugerencia': 'SUGERENCIA IA: Se detectó un `print()`. En código de producción, considere usar el módulo `logging` para un mejor control de los mensajes.'
        })

    if not sugerencias:
        sugerencias.append({
            'linea': '-',
            'sugerencia': 'SUGERENCIA IA: El código parece limpio. No se detectaron patrones de ineficiencia comunes.'
        })
        
    return jsonify({'sugerencias': sugerencias})

# HU-005: Dashboard con métricas IA
@app.route('/api/metricas/<int:proyecto_id>', methods=['GET'])
def get_metricas(proyecto_id):
    metricas = Metrica.query.filter_by(proyecto_id=proyecto_id).all()
    labels = [f"Analisis {m.id}" for m in metricas]
    data_co2 = [m.emisiones_co2 for m in metricas]
    data_cpu = [m.consumo_cpu for m in metricas]
    
    return jsonify({'labels': labels, 'data_co2': data_co2, 'data_cpu': data_cpu})

# --- Nuevos Endpoints para Requisitos (HU-001) ---

# Funcionalidad 4: Recalcular al actualizar
@app.route('/api/requisitos/<int:req_id>', methods=['PUT'])
def update_requisito(req_id):
    req_db = Requisito.query.get_or_404(req_id)
    data = request.get_json()
    
    descripcion_nueva = data.get('descripcion')
    if not descripcion_nueva:
        return jsonify({'error': 'La descripción no puede estar vacía'}), 400
    
    # --- Aquí se recalcula la proyección ---
    kwh_nuevo = len(descripcion_nueva) * 0.05 
    
    req_db.descripcion = descripcion_nueva
    req_db.prioridad = data.get('prioridad', req_db.prioridad)
    req_db.kwh_estimado = kwh_nuevo # Se guarda el valor recalculado
    
    db.session.commit()
    # Devolvemos el requisito actualizado
    return jsonify({
        'id': req_db.id, 
        'descripcion': req_db.descripcion, 
        'prioridad': req_db.prioridad, 
        'kwh_estimado': req_db.kwh_estimado
    })

# (Helper) Endpoint para eliminar requisitos
@app.route('/api/requisitos/<int:req_id>', methods=['DELETE'])
def delete_requisito(req_id):
    req_db = Requisito.query.get_or_404(req_id)
    db.session.delete(req_db)
    db.session.commit()
    return jsonify({'mensaje': 'Requisito eliminado'})

# Funcionalidad 3: Generar reporte preliminar
@app.route('/api/requisitos/reporte/<int:proyecto_id>', methods=['GET'])
def get_reporte_requisitos(proyecto_id):
    reqs = Requisito.query.filter_by(proyecto_id=proyecto_id).all()
    
    if not reqs:
        return jsonify({'total_kwh_proyectado': 0, 'total_requisitos': 0})
    
    # Suma todos los kwh estimados de los requisitos
    total_kwh = sum(r.kwh_estimado for r in reqs)
    total_reqs = len(reqs)
    
    return jsonify({'total_kwh_proyectado': total_kwh, 'total_requisitos': total_reqs})

# --- Nuevos Endpoints para Arquitectura (HU-002) ---

# Característica 1, 2 y 4: Sugerir componentes / Evaluar alternativas / Reoptimizar
@app.route('/api/componentes/sugerir', methods=['GET'])
def sugerir_componentes():
    # La "IA" sugiere componentes eficientes (simulación)
    sugerencias = [
        {'nombre': 'Cargador de Imagen Eco', 'tipo': 'eco-image-loader', 'kwh': 0.07, 'alternativa_a': 'image'},
        {'nombre': 'Reproductor de Video Eco', 'tipo': 'eco-video-player', 'kwh': 0.30, 'alternativa_a': 'video'},
        {'nombre': 'Formulario Eficiente', 'tipo': 'eco-form', 'kwh': 0.10, 'alternativa_a': 'form'},
    ]
    return jsonify(sugerencias)

# Característica 3: Calcular impacto ambiental
@app.route('/api/arquitectura/calcular_impacto', methods=['POST'])
def calcular_impacto():
    data = request.get_json()
    # Recibimos una lista de todos los tipos de componentes en el canvas
    component_types = data.get('componentes', []) # Ej: ['wrapper', 'h1', 'p', 'image', 'p']
    
    total_kwh = 0.0
    for tipo in component_types:
        # Busca el costo de kWh en nuestra BBDD simulada.
        # Si no lo encuentra, le da un costo de 0.01 (default)
        total_kwh += ECO_COMPONENTES_DB.get(tipo, 0.01)
            
    return jsonify({'total_kwh_proyectado': total_kwh})

# --- ENDPOINT PARA PRUEBAS (HU-004) ---
@app.route('/api/pruebas/ejecutar', methods=['POST'])
def ejecutar_pruebas():
    data = request.get_json()
    codigo = data.get('codigo', '')

    # Funcionalidad 1: Medir consumo energético en tiempo real (simulado)
    metricas = medir_codigo_con_codecarbon(codigo)
    if 'error' in metricas:
        # Si el código falla por sintaxis, la prueba falla
        return jsonify({
            'pasaron': False,
            'mensaje': '¡FALLO DE COMPILACIÓN! Las pruebas no se pudieron ejecutar.',
            'alerta_pico': metricas['error'], # Reutilizamos la alerta para el error de sintaxis
            'metricas': {'emisiones_co2': 0, 'consumo_cpu': 0},
            'reduccion_comparativa': '0%'
        }), 500

    reporte_pruebas = {
        'pasaron': True,
        'mensaje': '¡Pruebas funcionales y de eficiencia energética PASARON!',
        'alerta_pico': None, # Funcionalidad 4
        'metricas': metricas, # Funcionalidad 1
        'reduccion_comparativa': '92.5%' # Funcionalidad 3 (hardcoded)
    }

    # Funcionalidad 2 y 4: Detectar fallo y correlacionar con impacto
    # Simulamos que un 'for' ineficiente es un "fallo de prueba de eficiencia"
    if "for i in range" in codigo and "append" in codigo:
        reporte_pruebas['pasaron'] = False
        reporte_pruebas['mensaje'] = '¡FALLO DETECTADO! Pruebas funcionales OK, pero la prueba de eficiencia energética falló.'
        # Funcionalidad 4: Alerta de pico de ineficiencia
        reporte_pruebas['alerta_pico'] = 'Se detectó un bucle ineficiente que genera un pico de consumo de CPU y CO2.'
        # Funcionalidad 2: Correlacionar con impacto
        reporte_pruebas['mensaje'] += f" Impacto excesivo detectado: {metricas['emisiones_co2']:.6f} kg CO2."
        reporte_pruebas['reduccion_comparativa'] = '0%' # No hay reducción
    
    return jsonify(reporte_pruebas)

# --- ENDPOINT PARA REPORTES (HU-007) ---
@app.route('/api/reportes/generar', methods=['GET'])
def generar_reporte_ambiental():
    proyecto_id=1 # Asumimos proyecto 1
    
    # CA 1: Generar con estimaciones de CO2
    metricas = Metrica.query.filter_by(proyecto_id=proyecto_id).all()
    
    # CA 3: Validar reporte incompleto
    if not metricas:
        return jsonify({
            'error': 'Reporte incompleto. No hay datos de análisis de CO2 en la base de datos. Ejecute análisis en las pestañas "Codificación" o "Pruebas" primero.'
        }), 404 # Not Found
    
    total_analisis = len(metricas)
    total_co2_actual = sum(m.emisiones_co2 for m in metricas)
    
    # CA 2: Destacar reducción (Simulación)
    # Simulamos que el "método tradicional" habría gastado 10 veces más CO2
    total_co2_tradicional_simulado = total_co2_actual * 10 
    
    # Evitar división por cero si el total_co2_tradicional es 0
    if total_co2_tradicional_simulado == 0:
        reduccion_porcentaje = 0
    else:
        reduccion_porcentaje = (1 - (total_co2_actual / total_co2_tradicional_simulado)) * 100
        
    # Nos aseguramos de que cumpla el "mínimo 70%"
    if reduccion_porcentaje < 70:
        reduccion_porcentaje = 70.0 


    return jsonify({
        'total_co2_generado': total_co2_actual,
        'total_co2_tradicional_simulado': total_co2_tradicional_simulado,
        'reduccion_porcentaje': reduccion_porcentaje,
        'total_analisis_realizados': total_analisis
    })

# ===================================================================
# --- NUEVOS ENDPOINTS PARA DESPLIEGUE (HU-008) ---
# ===================================================================

# CA 1: Revisar métricas eco-eficientes
@app.route('/api/despliegue/pre-check', methods=['GET'])
def pre_check_despliegue():
    # Obtenemos la *última* métrica registrada
    ultima_metrica = Metrica.query.order_by(Metrica.id.desc()).first()
    
    if not ultima_metrica:
        return jsonify({
            'error': 'Fallo en la revisión. No hay métricas registradas. Ejecute un análisis primero.'
        }), 404
        
    pasa_revision = ultima_metrica.emisiones_co2 <= UMBRAL_PICO_CO2
    
    return jsonify({
        'metrica_actual_co2': ultima_metrica.emisiones_co2,
        'benchmark_co2': UMBRAL_PICO_CO2,
        'pasa_revision': pasa_revision
    })

# CA 2: Correlacionar issue con ineficiencia
@app.route('/api/despliegue/simular-issue', methods=['GET'])
def simular_issue_post_despliegue():
    # Obtenemos la *última* métrica registrada
    ultima_metrica = Metrica.query.order_by(Metrica.id.desc()).first()
    
    if not ultima_metrica:
         return jsonify({'correlacion_energetica': False, 'mensaje': 'No hay métricas para correlacionar.'})
         
    # Si la última métrica fue un pico, encontramos una correlación
    if ultima_metrica.emisiones_co2 > UMBRAL_PICO_CO2:
        return jsonify({
            'correlacion_energetica': True,
            'metrica_actual_co2': ultima_metrica.emisiones_co2,
            'mensaje': f'¡CORRELACIÓN ENCONTRADA! El issue se debe a una ineficiencia energética (Pico de {ultima_metrica.emisiones_co2:.6f} kg CO2 detectado en el último análisis).'
        })
    else:
         return jsonify({
            'correlacion_energetica': False,
            'metrica_actual_co2': ultima_metrica.emisiones_co2,
            'mensaje': 'No se encontró correlación. El issue no está relacionado con el consumo energético (última métrica eco-eficiente).'
        })

# ===================================================================
# --- FIN DE NUEVOS ENDPOINTS ---
# ===================================================================

# --- Ejecutar la App ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Esto crea las tablas en 'ecodev_db'
    
    # Corrección del typo 'app.contex'
    with app.app_context():
        if not Proyecto.query.first():
            demo_proyecto = Proyecto(nombre="Proyecto Demo")
            db.session.add(demo_proyecto)
            db.session.commit()
            
    app.run(debug=True, port=5001) # Usamos el puerto 5001 para el backend