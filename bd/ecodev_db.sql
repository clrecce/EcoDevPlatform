-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 12-11-2025 a las 23:03:50
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ecodev_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `arquitectura`
--

CREATE TABLE `arquitectura` (
  `id_ar` int(11) NOT NULL,
  `componentes` text DEFAULT NULL,
  `impactoAmbientalProyectado` decimal(10,5) DEFAULT NULL,
  `proyecto_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `arquitectura`
--

INSERT INTO `arquitectura` (`id_ar`, `componentes`, `impactoAmbientalProyectado`, `proyecto_id`) VALUES
(1, '[\"\", \"text\", \"textnode\", \"text\", \"textnode\"]', 0.05000, 1),
(2, '[\"\", \"text\", \"textnode\", \"text\", \"textnode\", \"eco-image-loader\", \"textnode\"]', 0.13000, 1),
(3, '[\"link\", \"text\", \"textnode\"]', 0.03000, 1),
(4, '[\"eco-image-loader\", \"textnode\", \"link\"]', 0.09000, 1),
(5, '[\"eco-image-loader\", \"textnode\", \"eco-video-player\", \"textnode\", \"link\"]', 0.40000, 1),
(6, '[\"eco-video-player\", \"textnode\", \"eco-image-loader\", \"textnode\", \"link\"]', 0.40000, 1),
(7, '[]', 0.00000, 1),
(8, '[\"link\", \"eco-image-loader\", \"textnode\", \"eco-video-player\", \"textnode\"]', 0.40000, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `codigo`
--

CREATE TABLE `codigo` (
  `id_co` int(11) NOT NULL,
  `lenguaje` varchar(50) DEFAULT NULL,
  `script` text DEFAULT NULL,
  `arquitectura_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `codigo`
--

INSERT INTO `codigo` (`id_co`, `lenguaje`, `script`, `arquitectura_id`) VALUES
(1, 'HTML/CSS', '\n<style>\n* { box-sizing: border-box; } body {margin: 0;}#ih3o{padding:10px;border:2px dashed #22C55E;}\n</style>\n<body id=\"i1yu\"><section class=\"bdg-sect\"><h1 class=\"heading\">Insert title here</h1><p class=\"paragraph\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p></section><div id=\"ih3o\">Eco Image</div></body>', 2),
(2, 'HTML/CSS', '\n<style>\n* { box-sizing: border-box; } body {margin: 0;}#i5gc{display:inline-block;padding:5px;min-height:50px;min-width:50px;}\n</style>\n<body><a id=\"i5gc\"></a><blockquote class=\"quote\">\n        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit\n      </blockquote></body>', 3),
(3, 'HTML/CSS', '\n<style>\n* { box-sizing: border-box; } body {margin: 0;}#i45c{padding:10px;border:2px dashed #22C55E;}#i5sv{display:inline-block;padding:5px;min-height:50px;min-width:50px;}\n</style>\n<body><div id=\"i45c\">Eco Image</div><a id=\"i5sv\"></a></body>', 4),
(4, 'HTML/CSS', 'body { margin: 0; }\n#ir2i, #i225, #i1qv { display: inline-block; padding: 5px; min-height: 50px; min-width: 50px; border: 2px dashed #22C55E; }\n#ir2i, #i225 { width: 50%; display: inline-block; }\n#i1qv { display: inline-block; padding: 5px; min-height: 50px; min-width: 50px; border: 2px dashed #22C55E; }\n</style>\n<body>\n<div id=\"ir2i\">Eco Image</div>\n<div id=\"i225\">Eco Video</div>\n<a id=\"i1qv\"></a>\n</body>', 5),
(5, 'HTML/CSS', '\n<style>\n* { box-sizing: border-box; } body {margin: 0;}#iz3v{padding:10px;border:2px dashed #22C55E;}#iycl{padding:10px;border:2px dashed #22C55E;}#ilir{display:inline-block;padding:5px;min-height:50px;min-width:50px;}\n</style>\n<body><div id=\"iz3v\">Eco Video</div><div id=\"iycl\">Eco Image</div><a id=\"ilir\"></a></body>', 6),
(6, 'HTML/CSS', '<body id=\"is6l\"><a id=\"il6w\"></a><div id=\"i1in\">Eco Image</div><div id=\"i3zv\">Eco Video</div></body>', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `despliegue`
--

CREATE TABLE `despliegue` (
  `id_de` int(11) NOT NULL,
  `fechaDespliegue` datetime DEFAULT current_timestamp(),
  `estado` varchar(100) DEFAULT NULL,
  `proyecto_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metrica`
--

CREATE TABLE `metrica` (
  `id_me` int(11) NOT NULL,
  `consumoCPU` decimal(10,5) DEFAULT NULL,
  `emisionesCO2` decimal(10,6) DEFAULT NULL,
  `tiempoEjecucion` float DEFAULT NULL,
  `prueba_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `metrica`
--

INSERT INTO `metrica` (`id_me`, `consumoCPU`, `emisionesCO2`, `tiempoEjecucion`, `prueba_id`) VALUES
(1, 0.01055, 0.000006, NULL, 2),
(2, 0.01055, 0.000005, NULL, 3),
(3, 0.01055, 0.000005, NULL, 4),
(4, 0.01055, 0.000006, NULL, 5),
(5, 0.01055, 0.000005, NULL, 6),
(6, 0.01055, 0.000006, NULL, 7),
(7, 0.01055, 0.000006, NULL, 8),
(8, 0.01055, 0.000005, NULL, 9),
(9, 0.01055, 0.000005, NULL, 10),
(10, 0.01055, 0.000005, NULL, 11),
(11, 0.01055, 0.000006, NULL, 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecto`
--

CREATE TABLE `proyecto` (
  `id_pr` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proyecto`
--

INSERT INTO `proyecto` (`id_pr`, `nombre`, `estado`, `usuario_id`) VALUES
(1, 'Proyecto Demo', 'Activo', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pruebas`
--

CREATE TABLE `pruebas` (
  `id_pu` int(11) NOT NULL,
  `tipoPrueba` varchar(100) DEFAULT NULL,
  `eficienciaEnergetica` decimal(10,5) DEFAULT NULL,
  `codigo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pruebas`
--

INSERT INTO `pruebas` (`id_pu`, `tipoPrueba`, `eficienciaEnergetica`, `codigo_id`) VALUES
(1, 'Análisis de Eficiencia', NULL, 3),
(2, 'Optimización IA', NULL, 4),
(3, 'Análisis de Eficiencia', NULL, 4),
(4, 'Prueba Funcional/Eficiencia', NULL, 4),
(5, 'Optimización IA', NULL, 4),
(6, 'Análisis de Eficiencia', NULL, 4),
(7, 'Análisis de Eficiencia', NULL, 5),
(8, 'Prueba Funcional/Eficiencia', NULL, 5),
(9, 'Optimización IA', NULL, 6),
(10, 'Análisis de Eficiencia', NULL, 6),
(11, 'Prueba Funcional/Eficiencia', NULL, 6),
(12, 'Análisis de Eficiencia', NULL, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte`
--

CREATE TABLE `reporte` (
  `id_rep` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `contenido` text DEFAULT NULL,
  `metrica_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `requisito`
--

CREATE TABLE `requisito` (
  `id_re` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  `prioridad` varchar(50) DEFAULT NULL,
  `kwh_estimado` decimal(10,5) DEFAULT NULL,
  `proyecto_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `requisito`
--

INSERT INTO `requisito` (`id_re`, `descripcion`, `prioridad`, `kwh_estimado`, `proyecto_id`) VALUES
(1, 'Prueba 1', 'Alta', 0.40000, 1),
(2, 'Pruebaaaaaaaaaaaaaaa 2', 'Media', 1.10000, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_us` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contrasena` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_us`, `nombre`, `email`, `contrasena`) VALUES
(1, 'Usuario Demo', 'demo@ecodev.com', '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `arquitectura`
--
ALTER TABLE `arquitectura`
  ADD PRIMARY KEY (`id_ar`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `codigo`
--
ALTER TABLE `codigo`
  ADD PRIMARY KEY (`id_co`),
  ADD KEY `arquitectura_id` (`arquitectura_id`);

--
-- Indices de la tabla `despliegue`
--
ALTER TABLE `despliegue`
  ADD PRIMARY KEY (`id_de`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `metrica`
--
ALTER TABLE `metrica`
  ADD PRIMARY KEY (`id_me`),
  ADD KEY `prueba_id` (`prueba_id`);

--
-- Indices de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  ADD PRIMARY KEY (`id_pr`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `pruebas`
--
ALTER TABLE `pruebas`
  ADD PRIMARY KEY (`id_pu`),
  ADD KEY `codigo_id` (`codigo_id`);

--
-- Indices de la tabla `reporte`
--
ALTER TABLE `reporte`
  ADD PRIMARY KEY (`id_rep`),
  ADD KEY `metrica_id` (`metrica_id`);

--
-- Indices de la tabla `requisito`
--
ALTER TABLE `requisito`
  ADD PRIMARY KEY (`id_re`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_us`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `arquitectura`
--
ALTER TABLE `arquitectura`
  MODIFY `id_ar` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `codigo`
--
ALTER TABLE `codigo`
  MODIFY `id_co` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `despliegue`
--
ALTER TABLE `despliegue`
  MODIFY `id_de` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metrica`
--
ALTER TABLE `metrica`
  MODIFY `id_me` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  MODIFY `id_pr` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `pruebas`
--
ALTER TABLE `pruebas`
  MODIFY `id_pu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `reporte`
--
ALTER TABLE `reporte`
  MODIFY `id_rep` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `requisito`
--
ALTER TABLE `requisito`
  MODIFY `id_re` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_us` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `arquitectura`
--
ALTER TABLE `arquitectura`
  ADD CONSTRAINT `arquitectura_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyecto` (`id_pr`) ON DELETE CASCADE;

--
-- Filtros para la tabla `codigo`
--
ALTER TABLE `codigo`
  ADD CONSTRAINT `codigo_ibfk_1` FOREIGN KEY (`arquitectura_id`) REFERENCES `arquitectura` (`id_ar`) ON DELETE CASCADE;

--
-- Filtros para la tabla `despliegue`
--
ALTER TABLE `despliegue`
  ADD CONSTRAINT `despliegue_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyecto` (`id_pr`) ON DELETE CASCADE;

--
-- Filtros para la tabla `metrica`
--
ALTER TABLE `metrica`
  ADD CONSTRAINT `metrica_ibfk_1` FOREIGN KEY (`prueba_id`) REFERENCES `pruebas` (`id_pu`) ON DELETE CASCADE;

--
-- Filtros para la tabla `proyecto`
--
ALTER TABLE `proyecto`
  ADD CONSTRAINT `proyecto_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id_us`) ON DELETE SET NULL;

--
-- Filtros para la tabla `pruebas`
--
ALTER TABLE `pruebas`
  ADD CONSTRAINT `pruebas_ibfk_1` FOREIGN KEY (`codigo_id`) REFERENCES `codigo` (`id_co`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reporte`
--
ALTER TABLE `reporte`
  ADD CONSTRAINT `reporte_ibfk_1` FOREIGN KEY (`metrica_id`) REFERENCES `metrica` (`id_me`) ON DELETE CASCADE;

--
-- Filtros para la tabla `requisito`
--
ALTER TABLE `requisito`
  ADD CONSTRAINT `requisito_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyecto` (`id_pr`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
