-- Migración para remover turnos del sistema
-- Ejecutar este script para remover las columnas de turno y registros relacionados

-- Verificar estructura actual
-- SELECT * FROM pragma_table_info('produccion');

-- Para SQLite, necesitamos recrear las tablas sin la columna turno
-- Primero hacemos backup de los datos

-- Crear tabla temporal para produccion sin turno
CREATE TABLE produccion_temp AS 
SELECT id, lote_id, fecha, empleado, observaciones, created_at, updated_at 
FROM produccion;

-- Crear tabla temporal para produccion_items sin turno  
CREATE TABLE produccion_items_temp AS
SELECT id, lote_id, producto, cantidad_producida, fecha, empleado, created_at, updated_at
FROM produccion_items;

-- Eliminar tablas originales
DROP TABLE produccion;
DROP TABLE produccion_items;

-- Recrear tablas con nueva estructura
CREATE TABLE produccion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lote_id INTEGER NOT NULL,
    fecha DATETIME NOT NULL,
    empleado VARCHAR(255),
    observaciones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produccion_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lote_id INTEGER NOT NULL,
    producto VARCHAR(255) NOT NULL,
    cantidad_producida INTEGER NOT NULL,
    fecha DATETIME NOT NULL,
    empleado VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Restaurar datos
INSERT INTO produccion SELECT * FROM produccion_temp;
INSERT INTO produccion_items SELECT * FROM produccion_items_temp;

-- Eliminar tablas temporales
DROP TABLE produccion_temp;
DROP TABLE produccion_items_temp;

-- Remover maestros de tipo turno
DELETE FROM maestros WHERE tipo = 'turno';
