<?php // Inicio del script PHP del servidor backend
// ============================================================================
// CONECTOR MYSQL PARA XAMPP (phpMyAdmin) E INFINITYFREE
// ============================================================================

header('Content-Type: application/json; charset=utf-8'); // Define que la respuesta siempre será JSON en formato UTF-8
header('Access-Control-Allow-Origin: *'); // Permite peticiones desde cualquier dominio (CORS)
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); // Define los métodos HTTP permitidos
header('Access-Control-Allow-Headers: Content-Type'); // Permite el encabezado Content-Type en las peticiones

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { // Verifica si el navegador envió una petición preliminar OPTIONS
    http_response_code(204); // Responde con código 204 (Sin contenido)
    exit; // Detiene la ejecución porque OPTIONS no requiere procesar datos
} // Fin de la validación OPTIONS

// ----------------------------------------------------------------------------
// 1. CONFIGURACIÓN DE CONEXIÓN A MYSQL (XAMPP O INFINITYFREE)
// ----------------------------------------------------------------------------
$DB_HOST = getenv('MYSQL_HOST') ?: '127.0.0.1'; // Servidor MySQL (en InfinityFree pon sqlXXX.infinityfree.com)
$DB_PORT = getenv('MYSQL_PORT') ?: '3306'; // Puerto estándar de MySQL (3306)
$DB_NAME = getenv('MYSQL_DATABASE') ?: 'date_app'; // Nombre de tu base de datos en phpMyAdmin
$DB_USER = getenv('MYSQL_USER') ?: 'root'; // Usuario de MySQL ('root' en XAMPP)
$DB_PASS = getenv('MYSQL_PASSWORD') !== false ? getenv('MYSQL_PASSWORD') : ''; // Contraseña de MySQL (vacía en XAMPP)

function send_json($status, $data) { // Función auxiliar para enviar respuestas JSON al navegador y salir
    http_response_code($status); // Establece el código de estado HTTP (200, 201, 400, 404, 500)
    echo json_encode($data, JSON_UNESCAPED_UNICODE); // Convierte el arreglo PHP a texto JSON conservando tildes y emojis
    exit; // Termina la ejecución del script tras responder
} // Fin de la función send_json

try { // Primer intento: conectar a MySQL y crear la base de datos si estamos en XAMPP local
    $dsnServer = "mysql:host={$DB_HOST};port={$DB_PORT};charset=utf8mb4"; // Cadena de conexión sin especificar base de datos
    $pdo = new PDO($dsnServer, $DB_USER, $DB_PASS, [ // Crea la instancia PDO para conectarse a MySQL
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // Configura PDO para lanzar excepciones si ocurre un error SQL
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC // Configura PDO para devolver filas como arreglos asociativos
    ]); // Fin de creación del objeto PDO
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"); // Crea la base de datos en XAMPP si no existe
    $pdo->exec("USE `{$DB_NAME}`"); // Selecciona la base de datos recién creada o existente
} catch (Exception $e) { // Si el hosting (ej. InfinityFree) no permite CREATE DATABASE, conecta directo a la BD existente
    try { // Segundo intento: conexión directa especificando el nombre de la base de datos
        $dsnDb = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4"; // Cadena de conexión directa a la BD
        $pdo = new PDO($dsnDb, $DB_USER, $DB_PASS, [ // Crea la conexión PDO directa
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // Activa errores por excepción
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC // Devuelve resultados como arreglo asociativo
        ]); // Fin de conexión directa PDO
    } catch (Exception $ex) { // Si falla también la conexión directa, devuelve error en JSON
        send_json(500, [ // Envía error HTTP 500 al frontend
            'ok' => false, // Indica que la operación falló
            'error' => 'Error de conexión MySQL: ' . $ex->getMessage() // Muestra el detalle del error de conexión
        ]); // Fin de respuesta de error
    } // Fin del bloque catch interno
} // Fin del bloque try-catch de conexión

// ----------------------------------------------------------------------------
// 2. CREAR TABLAS AUTOMÁTICAMENTE SI NO EXISTEN EN MYSQL
// ----------------------------------------------------------------------------
$pdo->exec("CREATE TABLE IF NOT EXISTS planes_sugeridos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(180) NOT NULL,
    categoria VARCHAR(50) NOT NULL DEFAULT 'Romántico',
    descripcion TEXT NOT NULL,
    icono VARCHAR(32) NOT NULL,
    duracion_estimada VARCHAR(80) NOT NULL,
    presupuesto VARCHAR(80) NOT NULL,
    lugar_sugerido VARCHAR(180) NOT NULL,
    tips_romanticos TEXT NOT NULL,
    color_acento VARCHAR(20) NOT NULL DEFAULT '#f43f5e',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"); // Crea la tabla de planes si no existe

$pdo->exec("CREATE TABLE IF NOT EXISTS citas_programadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    titulo_cita VARCHAR(180) NOT NULL,
    fecha DATE NOT NULL,
    hora VARCHAR(10) NOT NULL,
    lugar VARCHAR(180) NOT NULL,
    notas_previas TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'Programada',
    calificacion TINYINT DEFAULT 5,
    bitacora_recuerdo TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_citas_plan_id (plan_id),
    CONSTRAINT fk_citas_plan FOREIGN KEY (plan_id) REFERENCES planes_sugeridos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"); // Crea la tabla de citas agendadas si no existe

$pdo->exec("CREATE TABLE IF NOT EXISTS fotos_cita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cita_id INT NOT NULL,
    slot_numero TINYINT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_url VARCHAR(500) NOT NULL,
    datos_imagen LONGTEXT DEFAULT NULL,
    pie_foto VARCHAR(255) DEFAULT '',
    fecha_captura DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cita_slot (cita_id, slot_numero),
    CONSTRAINT fk_fotos_cita FOREIGN KEY (cita_id) REFERENCES citas_programadas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"); // Crea la tabla de fotos (máximo 10 slots únicos por cita)

// Insertar los 10 planes iniciales si la tabla planes_sugeridos está vacía
$countPlanes = (int)$pdo->query("SELECT COUNT(*) FROM planes_sugeridos")->fetchColumn(); // Cuenta cuántos planes hay en la tabla
if ($countPlanes === 0) { // Si no hay ningún plan registrado todavía
    $planesIniciales = [ // Define el arreglo con los 10 planes base
        [1, 'Tarde de Bolos, Retos y Malteadas', 'Divertido', 'Compitan en las pistas de bolos, hagan apuestas tiernas por cada chuza y cierren compartiendo malteadas.', '🎳', '2.5 a 3 horas', '$$ Moderado', 'Bolera favorita de la ciudad', 'El que gane cada ronda pide un deseo o un beso.'], // Plan 1
        [2, 'Carrera de Karts a Toda Velocidad', 'Aventura', 'Adrenalina pura compitiendo juntos en la pista de Go-Karts y fotos en el podio.', '🏎️', '2 horas', '$$ Moderado', 'Pista de Karts', 'Tómense una foto con los cascos puestos antes de arrancar.'], // Plan 2
        [3, 'Parque de Diversiones y Rueda de la Fortuna', 'Aventura', 'Montañas rusas, carros chocones, algodón de azúcar y atardecer en la rueda de la fortuna.', '🎡', '4 a 5 horas', '$$$ Especial', 'Parque de diversiones', 'Intenten ganar un peluche en los juegos de feria.'], // Plan 3
        [4, 'Cita de Cine, Palomitas y Cena Romántica', 'Romántico', 'Elijan una película que ambos quieran ver, compartan palomitas y salgan a cenar.', '🍿', '3.5 horas', '$$ Moderado', 'Cine favorito', 'Guarden las entradas como recuerdo de la función.'], // Plan 4
        [5, 'Picnic Romántico al Atardecer', 'Romántico', 'Escapada al aire libre con manta, fresas con chocolate, tabla de quesos y música.', '🌅', '3 horas', '$$ Moderado', 'Parque o jardín tranquilo', 'Lleven una carta escrita a mano para leerla al caer el sol.'], // Plan 5
        [6, 'Mirador Nocturno bajo las Estrellas', 'Romántico', 'Subir al mirador para ver las luces de la ciudad abrazados con chocolate caliente.', '🌌', '2.5 horas', '$ Económico', 'Mirador panorámico', 'Lleven una cobija abrigadora para compartir.'], // Plan 6
        [7, 'Noche de Chef en Pareja: Pizzas y Vino', 'Gastronómico', 'Preparen juntos sus propias pizzas artesanales desde la masa con música y vino.', '🍕', '2.5 horas', '$$ Moderado', 'En casa', 'Denle forma de corazón a las pizzas y saquen fotos cocinando.'], // Plan 7
        [8, 'Glamping o Fogata con Masmelos', 'Romántico', 'Noche mágica rodeados de naturaleza, luces cálidas y fogata bajo las estrellas.', '🏕️', 'Noche completa', '$$$ Especial', 'Glamping o cabaña', 'Preparen una lista de canciones especiales para la fogata.'], // Plan 8
        [9, 'Ruta de Postres, Helados y Café', 'Gastronómico', 'Paseo dulce probando café especial, waffles o crepes y cerrando con helado artesanal.', '🍨', '2.5 horas', '$$ Moderado', 'Zona gastronómica', 'Pidan sabores distintos en cada parada para probar ambos.'], // Plan 9
        [10, 'Tarde de Pintura, Cerámica o Arcade', 'Creativo', 'Pintar dos cuadros, moldear tazas de cerámica o retarse en las máquinas de Arcade.', '🎨', '2.5 horas', '$$ Moderado', 'Café creativo o Arcade', 'Intercambien sus creaciones al final como recuerdo.'] // Plan 10
    ]; // Fin del arreglo de planes iniciales
    $stmtInsertPlan = $pdo->prepare("INSERT INTO planes_sugeridos (id, titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"); // Prepara la consulta SQL de inserción
    foreach ($planesIniciales as $p) { // Recorre cada uno de los 10 planes iniciales
        $stmtInsertPlan->execute($p); // Inserta el plan en la base de datos MySQL
    } // Fin del ciclo foreach
} // Fin de la carga inicial de planes

// ----------------------------------------------------------------------------
// 3. FUNCIÓN PARA OBTENER TODAS LAS CITAS CON SUS FOTOS
// ----------------------------------------------------------------------------
function obtenerCitasConFotos($pdo) { // Consulta todas las citas y les adjunta su arreglo de fotos
    $citas = $pdo->query("
        SELECT c.*, p.titulo AS plan_titulo, p.categoria AS plan_categoria, p.icono AS plan_icono, p.tips_romanticos AS plan_tips
        FROM citas_programadas c
        JOIN planes_sugeridos p ON p.id = c.plan_id
        ORDER BY c.fecha DESC, c.hora DESC, c.id DESC
    ")->fetchAll(); // Ejecuta la consulta uniendo citas con su plan correspondiente

    $fotos = $pdo->query("
        SELECT id, cita_id, slot_numero, nombre_archivo, ruta_url, datos_imagen, pie_foto
        FROM fotos_cita
        ORDER BY cita_id ASC, slot_numero ASC
    ")->fetchAll(); // Obtiene todas las fotos ordenadas por cita y número de casilla (1 al 10)

    $fotosPorCita = []; // Inicializa un arreglo para agrupar las fotos según el ID de la cita
    foreach ($fotos as $f) { // Recorre cada foto obtenida de la base de datos
        $cid = (int)$f['cita_id']; // Convierte el ID de la cita a número entero
        $fotosPorCita[$cid][] = [ // Agrega la foto al grupo de su cita correspondiente
            'id' => (int)$f['id'], // ID único de la foto
            'cita_id' => $cid, // ID de la cita a la que pertenece
            'slot_numero' => (int)$f['slot_numero'], // Número de casilla (1 a 10)
            'ruta_url' => !empty($f['datos_imagen']) ? $f['datos_imagen'] : $f['ruta_url'], // Usa la imagen en Base64 guardada en MySQL
            'pie_foto' => $f['pie_foto'] // Nota o dedicatoria de la foto
        ]; // Fin del arreglo de la foto
    } // Fin del recorrido de fotos

    foreach ($citas as &$c) { // Recorre cada cita por referencia para agregar sus datos formateados
        $cid = (int)$c['id']; // Convierte el ID de la cita a entero
        $c['id'] = $cid; // Guarda el ID como entero
        $c['plan_id'] = (int)$c['plan_id']; // Guarda el ID del plan como entero
        $c['calificacion'] = (int)$c['calificacion']; // Guarda la calificación (1 a 5) como entero
        $c['hora'] = substr($c['hora'], 0, 5); // Recorta la hora al formato HH:MM
        $c['fotos'] = $fotosPorCita[$cid] ?? []; // Asigna las fotos de esta cita o un arreglo vacío
        $c['total_fotos'] = count($c['fotos']); // Calcula cuántas fotos tiene subidas la cita
    } // Fin del recorrido de citas

    return $citas; // Devuelve la lista completa de citas con sus fotos
} // Fin de la función obtenerCitasConFotos

// ----------------------------------------------------------------------------
// 4. LECTURA DE LA PETICIÓN ENTRTE Y ENRUTADOR DE ENDPOINTS
// ----------------------------------------------------------------------------
$endpoint = $_GET['endpoint'] ?? '/'; // Lee qué ruta solicita el frontend (ej. /api/planes o /api/citas)
$method = $_SERVER['REQUEST_METHOD']; // Obtiene el método HTTP usado (GET, POST, PUT, DELETE)
if ($method === 'POST' && isset($_GET['_method'])) { // Permite simular PUT y DELETE usando POST en hostings que los bloquean
    $method = strtoupper($_GET['_method']); // Reemplaza el método por el indicado en _method
} // Fin de conversión de método HTTP

$rawBody = file_get_contents('php://input'); // Lee el cuerpo JSON enviado por fetch desde JavaScript
$body = $rawBody ? json_decode($rawBody, true) : []; // Decodifica el texto JSON a un arreglo asociativo de PHP
if (!is_array($body)) $body = []; // Asegura que $body sea siempre un arreglo válido

// RUTA 1: GET /api/planes -> Listar todos los planes disponibles
if ($method === 'GET' && $endpoint === '/api/planes') { // Si piden la lista de planes
    $planes = $pdo->query("
        SELECT p.*, (SELECT COUNT(*) FROM citas_programadas c WHERE c.plan_id = p.id) AS veces_agendado
        FROM planes_sugeridos p
        ORDER BY p.id ASC
    ")->fetchAll(); // Consulta todos los planes y cuántas veces se ha agendado cada uno
    foreach ($planes as &$p) { // Recorre cada plan para convertir tipos numéricos
        $p['id'] = (int)$p['id']; // Convierte el ID a entero
        $p['veces_agendado'] = (int)$p['veces_agendado']; // Convierte el contador a entero
    } // Fin del formateo de planes
    send_json(200, ['ok' => true, 'planes' => $planes]); // Responde con código 200 y la lista de planes
} // Fin de GET /api/planes

// RUTA 2: POST /api/planes -> Crear un plan personalizado nuevo
if ($method === 'POST' && $endpoint === '/api/planes') { // Si envían el formulario de crear plan propio
    $titulo = trim($body['titulo'] ?? ''); // Limpia espacios del título enviado
    $categoria = $body['categoria'] ?? 'Romántico'; // Obtiene la categoría o usa 'Romántico' por defecto
    $descripcion = trim($body['descripcion'] ?? ''); // Limpia espacios de la descripción
    $icono = trim($body['icono'] ?? '💖'); // Obtiene el emoji elegido
    $duracion = trim($body['duracion_estimada'] ?? '2 a 3 horas'); // Obtiene la duración estimada
    $presupuesto = trim($body['presupuesto'] ?? '$$ Especial'); // Obtiene el presupuesto o estilo
    $lugar = trim($body['lugar_sugerido'] ?? 'Nuestro lugar especial'); // Obtiene el lugar sugerido
    $tips = trim($body['tips_romanticos'] ?? 'Disfrutar juntos y tomar nuestras fotos.'); // Obtiene el tip romántico

    if ($titulo === '' || $descripcion === '') { // Valida que título y descripción no estén vacíos
        send_json(400, ['ok' => false, 'error' => 'Escribe el título y la descripción de tu plan.']); // Devuelve error 400
    } // Fin de validación

    $stmt = $pdo->prepare("INSERT INTO planes_sugeridos (titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"); // Prepara el INSERT del plan
    $stmt->execute([$titulo, $categoria, $descripcion, $icono, $duracion, $presupuesto, $lugar, $tips]); // Ejecuta el guardado en MySQL
    $nuevoPlanId = (int)$pdo->lastInsertId(); // Obtiene el ID autogenerado del nuevo plan

    if (!empty($body['agendar_ahora']) && !empty($body['fecha']) && !empty($body['hora'])) { // Si marcó agendar de una vez con fecha y hora
        $stmtCita = $pdo->prepare("INSERT INTO citas_programadas (plan_id, titulo_cita, fecha, hora, lugar, notas_previas) VALUES (?, ?, ?, ?, ?, ?)"); // Prepara la inserción de la cita
        $stmtCita->execute([$nuevoPlanId, $titulo, $body['fecha'], $body['hora'], $lugar, $tips]); // Inserta la cita programada
    } // Fin de agendar inmediatamente

    send_json(201, ['ok' => true, 'plan_id' => $nuevoPlanId]); // Responde con éxito (201 Created)
} // Fin de POST /api/planes

// RUTA 3: DELETE /api/planes/:id -> Eliminar un plan personalizado (ID mayor a 10)
if ($method === 'DELETE' && preg_match('#^/api/planes/(\d+)$#', $endpoint, $m)) { // Si solicitan borrar un plan por su ID
    $planId = (int)$m[1]; // Extrae el ID numérico del plan desde la URL
    if ($planId <= 10) { // Protege los 10 planes base para que no se borren
        send_json(400, ['ok' => false, 'error' => 'Los 10 planes principales vienen incluidos por defecto.']); // Devuelve aviso
    } // Fin de validación de plan base
    $stmtUso = $pdo->prepare("SELECT COUNT(*) FROM citas_programadas WHERE plan_id = ?"); // Consulta si el plan tiene citas agendadas
    $stmtUso->execute([$planId]); // Ejecuta el conteo
    if ((int)$stmtUso->fetchColumn() > 0) { // Si ya está en uso en alguna cita
        send_json(400, ['ok' => false, 'error' => 'Este plan ya tiene citas agendadas.']); // Impide borrarlo para no romper la clave foránea
    } // Fin de validación de uso
    $stmtDel = $pdo->prepare("DELETE FROM planes_sugeridos WHERE id = ?"); // Prepara el borrado del plan personalizado
    $stmtDel->execute([$planId]); // Ejecuta el borrado en MySQL
    send_json(200, ['ok' => true]); // Confirma la eliminación
} // Fin de DELETE /api/planes/:id

// RUTA 4: GET /api/citas -> Obtener todas las citas agendadas y sus fotos
if ($method === 'GET' && $endpoint === '/api/citas') { // Si el frontend pide todas las citas
    send_json(200, ['ok' => true, 'citas' => obtenerCitasConFotos($pdo)]); // Devuelve el arreglo de citas con sus fotos
} // Fin de GET /api/citas

// RUTA 5: POST /api/citas -> Agendar una nueva cita con fecha, hora y hasta 10 fotos
if ($method === 'POST' && $endpoint === '/api/citas') { // Si envían el formulario de agendar cita
    $planId = (int)($body['plan_id'] ?? 0); // Lee el ID del plan seleccionado

    if (!empty($body['es_plan_libre']) && !empty($body['plan_libre_datos'])) { // Si el usuario escribió un plan libre nuevo desde la pestaña de agendar
        $pl = $body['plan_libre_datos']; // Obtiene los datos del plan libre
        $tituloLibre = trim($pl['titulo'] ?? $body['titulo_cita'] ?? ''); // Obtiene el título del plan libre
        if ($tituloLibre === '') { // Verifica que tenga nombre
            send_json(400, ['ok' => false, 'error' => 'Escribe el nombre de tu plan personalizado.']); // Devuelve error si está vacío
        } // Fin de verificación
        $stmtLibre = $pdo->prepare("INSERT INTO planes_sugeridos (titulo, categoria, descripcion, icono, duracion_estimada, presupuesto, lugar_sugerido, tips_romanticos) VALUES (?, ?, ?, '💑', 'Libre', '$$ Especial', ?, ?)"); // Prepara creación del plan libre
        $stmtLibre->execute([ // Ejecuta la inserción del plan libre
            $tituloLibre, // Título del plan
            $pl['categoria'] ?? 'Romántico', // Categoría elegida
            trim($pl['descripcion'] ?? 'Plan especial creado por nosotros.'), // Descripción del plan
            trim($body['lugar'] ?? 'Nuestro lugar especial'), // Lugar elegido
            trim($body['notas_previas'] ?? 'Guardar nuestras fotos de recuerdo.') // Notas o tips
        ]); // Fin de inserción del plan libre
        $planId = (int)$pdo->lastInsertId(); // Usa el ID del nuevo plan recién creado
    } // Fin de creación de plan libre

    $fecha = $body['fecha'] ?? ''; // Obtiene la fecha (YYYY-MM-DD)
    $hora = $body['hora'] ?? ''; // Obtiene la hora (HH:MM)
    $lugar = trim($body['lugar'] ?? ''); // Obtiene el lugar de la cita
    if (!$planId || !$fecha || !$hora || !$lugar) { // Verifica que estén todos los datos obligatorios
        send_json(400, ['ok' => false, 'error' => 'Selecciona un plan, fecha, hora y lugar.']); // Devuelve error si falta alguno
    } // Fin de validación de campos obligatorios

    $stmtPlan = $pdo->prepare("SELECT titulo FROM planes_sugeridos WHERE id = ?"); // Busca el título del plan en la BD
    $stmtPlan->execute([$planId]); // Ejecuta la búsqueda por ID
    $plan = $stmtPlan->fetch(); // Obtiene la fila del plan
    if (!$plan) { // Si el plan no existe en la base de datos
        send_json(404, ['ok' => false, 'error' => 'El plan seleccionado no existe.']); // Devuelve error 404
    } // Fin de comprobación de existencia del plan

    $tituloFinal = trim($body['titulo_cita'] ?? '') ?: $plan['titulo']; // Usa el título escrito o el nombre del plan por defecto
    $stmtCita = $pdo->prepare("INSERT INTO citas_programadas (plan_id, titulo_cita, fecha, hora, lugar, notas_previas, estado, calificacion, bitacora_recuerdo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '')"); // Prepara el INSERT de la cita
    $stmtCita->execute([ // Ejecuta la inserción de la cita en MySQL
        $planId, // ID del plan asociado
        $tituloFinal, // Nombre de la cita
        $fecha, // Fecha de la cita
        $hora, // Hora de la cita
        $lugar, // Lugar de encuentro
        $body['notas_previas'] ?? '', // Notas previas
        $body['estado'] ?? 'Programada', // Estado inicial ('Programada' o 'Completada')
        (int)($body['calificacion'] ?? 5) // Calificación de 1 a 5 corazones
    ]); // Fin de inserción de la cita
    $nuevaCitaId = (int)$pdo->lastInsertId(); // Guarda el ID de la cita recién creada

    if (!empty($body['fotos']) && is_array($body['fotos'])) { // Si el usuario adjuntó fotos al crear la cita
        $stmtFoto = $pdo->prepare("
            INSERT INTO fotos_cita (cita_id, slot_numero, nombre_archivo, ruta_url, datos_imagen, pie_foto)
            VALUES (?, ?, ?, 'db_base64', ?, ?)
            ON DUPLICATE KEY UPDATE datos_imagen = VALUES(datos_imagen), pie_foto = VALUES(pie_foto)
        "); // Prepara la consulta para insertar o actualizar cada foto en Base64 dentro de MySQL
        foreach (array_slice($body['fotos'], 0, 10) as $idx => $f) { // Recorre máximo 10 fotos
            $slot = (int)($f['slot_numero'] ?? ($idx + 1)); // Determina el número de casilla (del 1 al 10)
            if ($slot >= 1 && $slot <= 10 && !empty($f['dataUrl'])) { // Valida que el slot esté entre 1 y 10 y tenga imagen
                $stmtFoto->execute([ // Guarda la foto directamente en la tabla fotos_cita
                    $nuevaCitaId, // ID de la cita
                    $slot, // Casilla 1..10
                    $f['nombre_archivo'] ?? "foto_{$slot}.jpg", // Nombre referencial del archivo
                    $f['dataUrl'], // Imagen codificada en Base64 (LONGTEXT)
                    $f['pie_foto'] ?? "Recuerdo #{$slot}" // Pie de foto o dedicatoria
                ]); // Fin de inserción de foto
            } // Fin de validación de slot
        } // Fin del ciclo de fotos
    } // Fin del bloque de fotos iniciales

    send_json(201, ['ok' => true, 'cita_id' => $nuevaCitaId]); // Responde con éxito al navegador
} // Fin de POST /api/citas

// RUTA 6: PUT /api/citas/:id -> Actualizar fecha, hora, lugar, estado o bitácora de una cita
if ($method === 'PUT' && preg_match('#^/api/citas/(\d+)$#', $endpoint, $m)) { // Si editan una cita existente
    $citaId = (int)$m[1]; // Obtiene el ID de la cita desde la URL
    $stmtActual = $pdo->prepare("SELECT * FROM citas_programadas WHERE id = ?"); // Busca los datos actuales de la cita
    $stmtActual->execute([$citaId]); // Ejecuta la consulta
    $actual = $stmtActual->fetch(); // Obtiene el registro actual
    if (!$actual) { // Si no existe la cita
        send_json(404, ['ok' => false, 'error' => 'Cita no encontrada.']); // Devuelve error 404
    } // Fin de validación

    $stmtUpd = $pdo->prepare("UPDATE citas_programadas SET titulo_cita = ?, fecha = ?, hora = ?, lugar = ?, notas_previas = ?, estado = ?, calificacion = ?, bitacora_recuerdo = ? WHERE id = ?"); // Prepara la actualización
    $stmtUpd->execute([ // Ejecuta el UPDATE conservando los valores actuales si algún campo no fue enviado
        $body['titulo_cita'] ?? $actual['titulo_cita'], // Nuevo título o el actual
        $body['fecha'] ?? $actual['fecha'], // Nueva fecha o la actual
        $body['hora'] ?? $actual['hora'], // Nueva hora o la actual
        $body['lugar'] ?? $actual['lugar'], // Nuevo lugar o el actual
        $body['notas_previas'] ?? $actual['notas_previas'], // Nuevas notas o las actuales
        $body['estado'] ?? $actual['estado'], // Nuevo estado o el actual
        isset($body['calificacion']) ? (int)$body['calificacion'] : (int)$actual['calificacion'], // Calificación
        $body['bitacora_recuerdo'] ?? $actual['bitacora_recuerdo'], // Historia del recuerdo
        $citaId // ID de la cita que se actualiza
    ]); // Fin del UPDATE
    send_json(200, ['ok' => true]); // Confirma la actualización
} // Fin de PUT /api/citas/:id

// RUTA 7: DELETE /api/citas/:id -> Eliminar una cita agendada (y sus fotos por ON DELETE CASCADE)
if ($method === 'DELETE' && preg_match('#^/api/citas/(\d+)$#', $endpoint, $m)) { // Si solicitan borrar una cita
    $stmtDel = $pdo->prepare("DELETE FROM citas_programadas WHERE id = ?"); // Prepara el DELETE
    $stmtDel->execute([(int)$m[1]]); // Borra la cita según su ID
    send_json(200, ['ok' => true]); // Responde con éxito
} // Fin de DELETE /api/citas/:id

// RUTA 8: POST /api/citas/:id/fotos -> Subir o reemplazar fotos (casillas 1 a 10) de una cita
if ($method === 'POST' && preg_match('#^/api/citas/(\d+)/fotos$#', $endpoint, $m)) { // Si suben fotos a una cita existente
    $citaId = (int)$m[1]; // ID de la cita donde se subirán las fotos
    $fotos = isset($body['fotos']) && is_array($body['fotos']) ? $body['fotos'] : []; // Arreglo de fotos enviadas
    if (empty($fotos)) { // Si no llegó ninguna foto
        send_json(400, ['ok' => false, 'error' => 'No se enviaron fotos.']); // Devuelve error 400
    } // Fin de validación

    $stmtSlots = $pdo->prepare("SELECT slot_numero FROM fotos_cita WHERE cita_id = ?"); // Consulta qué casillas (1..10) ya están ocupadas
    $stmtSlots->execute([$citaId]); // Ejecuta la consulta
    $ocupados = array_map('intval', $stmtSlots->fetchAll(PDO::FETCH_COLUMN)); // Arreglo con los números de casilla ocupados

    $stmtUpsert = $pdo->prepare("
        INSERT INTO fotos_cita (cita_id, slot_numero, nombre_archivo, ruta_url, datos_imagen, pie_foto)
        VALUES (?, ?, ?, 'db_base64', ?, ?)
        ON DUPLICATE KEY UPDATE nombre_archivo = VALUES(nombre_archivo), datos_imagen = VALUES(datos_imagen), pie_foto = VALUES(pie_foto)
    "); // Prepara el INSERT o reemplazo automático si la casilla ya tenía foto

    foreach ($fotos as $item) { // Recorre cada foto subida por el usuario
        $targetSlot = (int)($item['slot_numero'] ?? 0); // Verifica si el usuario eligió una casilla específica (1..10)
        if ($targetSlot < 1 || $targetSlot > 10) { // Si subió varias fotos juntas sin casilla fija, busca la primera libre
            $targetSlot = 0; // Reinicia el buscador de casilla
            for ($s = 1; $s <= 10; $s++) { // Busca del 1 al 10
                if (!in_array($s, $ocupados, true)) { // Si la casilla $s no está ocupada
                    $targetSlot = $s; // Asigna esa casilla libre
                    break; // Sale del ciclo for
                } // Fin del if
            } // Fin del ciclo for
        } // Fin de búsqueda de casilla libre

        if ($targetSlot < 1 || $targetSlot > 10) { // Si ya están ocupadas las 10 casillas
            send_json(400, ['ok' => false, 'error' => 'Esta cita ya tiene sus 10 fotos completas.']); // Informa que llegó al límite de 10
        } // Fin de validación de límite

        if (!empty($item['dataUrl'])) { // Verifica que venga el contenido Base64 de la imagen
            $stmtUpsert->execute([ // Guarda o reemplaza la foto en MySQL
                $citaId, // ID de la cita
                $targetSlot, // Número de casilla (1 a 10)
                $item['nombre_archivo'] ?? "recuerdo_{$targetSlot}.jpg", // Nombre del archivo
                $item['dataUrl'], // Datos de la imagen en Base64
                $item['pie_foto'] ?? "Recuerdo #{$targetSlot}" // Dedicatoria de la foto
            ]); // Fin de ejecución SQL
            if (!in_array($targetSlot, $ocupados, true)) { // Si la casilla era nueva
                $ocupados[] = $targetSlot; // La marca como ocupada para las siguientes fotos del mismo envío
            } // Fin de registro de casilla ocupada
        } // Fin de guardado de imagen
    } // Fin del recorrido de fotos enviadas

    $citas = obtenerCitasConFotos($pdo); // Obtiene las citas actualizadas para devolver el conteo exacto
    $citaActualizada = null; // Variable para guardar la cita modificada
    foreach ($citas as $c) { // Busca la cita actual
        if ($c['id'] === $citaId) { // Cuando coincide el ID
            $citaActualizada = $c; // La asigna
            break; // Termina la búsqueda
        } // Fin del if
    } // Fin del foreach
    send_json(200, ['ok' => true, 'cita' => $citaActualizada]); // Devuelve la cita actualizada con sus fotos
} // Fin de POST /api/citas/:id/fotos

// RUTA 9: PUT /api/fotos/:fotoId -> Editar la dedicatoria (pie de foto) de una imagen
if ($method === 'PUT' && preg_match('#^/api/fotos/(\d+)$#', $endpoint, $m)) { // Si editan el texto de una foto
    $stmtUpd = $pdo->prepare("UPDATE fotos_cita SET pie_foto = ? WHERE id = ?"); // Prepara el UPDATE del pie de foto
    $stmtUpd->execute([$body['pie_foto'] ?? '', (int)$m[1]]); // Actualiza el texto en MySQL
    send_json(200, ['ok' => true]); // Confirma el cambio
} // Fin de PUT /api/fotos/:fotoId

// RUTA 10: DELETE /api/fotos/:fotoId -> Borrar una foto individual de una casilla
if ($method === 'DELETE' && preg_match('#^/api/fotos/(\d+)$#', $endpoint, $m)) { // Si borran una foto específica
    $stmtDel = $pdo->prepare("DELETE FROM fotos_cita WHERE id = ?"); // Prepara el borrado de la foto
    $stmtDel->execute([(int)$m[1]]); // Elimina la fila en MySQL
    send_json(200, ['ok' => true]); // Confirma que se eliminó
} // Fin de DELETE /api/fotos/:fotoId

send_json(404, ['ok' => false, 'error' => 'Ruta API no encontrada: ' . $endpoint]); // Si ninguna ruta coincidió, devuelve 404
