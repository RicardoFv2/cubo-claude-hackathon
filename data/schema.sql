-- ==============================================================================
-- LA PUPUSERÍA ALQUIMISTA - DATABASE SCHEMA (SQLite)
-- Table: dataset_nemotron_completo
-- ==============================================================================

-- 1. Create table structure
CREATE TABLE IF NOT EXISTS dataset_nemotron_completo (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    age                 INTEGER NOT NULL,
    gender              TEXT NOT NULL,
    department          TEXT NOT NULL,
    municipality        TEXT NOT NULL,
    region              TEXT NOT NULL CHECK(region IN ('Central','Occidental','Paracentral','Oriental')),
    occupation          TEXT NOT NULL,
    education           TEXT NOT NULL,
    monthly_income_usd  REAL NOT NULL,
    ocean_openness      INTEGER NOT NULL CHECK(ocean_openness BETWEEN 1 AND 100),
    ocean_neuroticism   INTEGER NOT NULL CHECK(ocean_neuroticism BETWEEN 1 AND 100),
    profile_summary     TEXT NOT NULL
);

-- 2. Performance indexes for core queries
CREATE INDEX IF NOT EXISTS idx_region_income
    ON dataset_nemotron_completo (region, monthly_income_usd);

CREATE INDEX IF NOT EXISTS idx_age
    ON dataset_nemotron_completo (age);

-- 3. Seed data matching demographic macro-regions
INSERT OR IGNORE INTO dataset_nemotron_completo (
    id, name, age, gender, department, municipality, region, 
    occupation, education, monthly_income_usd, ocean_openness, ocean_neuroticism, profile_summary
) VALUES 
(
    'NES-ORI-001',
    'José "Don Chepe" Amaya Portillo',
    54,
    'Masculino',
    'San Miguel',
    'San Miguel',
    'Oriental',
    'Vendedor de mercado / Agricultor de temporada',
    'Bachillerato incompleto',
    365.00,
    42,
    61,
    'Don Chepe es un vendedor de mediana edad oriundo del mercado central de San Miguel. Administra un puesto de granos básicos heredado de su padre y complementa ingresos con trabajo agrícola estacional en cultivos de maíz y frijol. Altamente sensible al precio — cualquier alza de más del 5% en un producto básico lo hace cambiar de proveedor de inmediato. Usa expresiones propias del oriente: "bróder", "qué chilero", "no me jale". Desconfía de marcas nuevas y prioriza la relación personal con los vendedores de confianza. Compra pupusas en el mercado 4-5 veces por semana como almuerzo de trabajo; su precio tope es $0.50 por unidad.'
),
(
    'NES-CEN-002',
    'Nayely Guadalupe Hernández Rivas',
    29,
    'Femenino',
    'San Salvador',
    'San Salvador',
    'Central',
    'Asistente administrativa en empresa de logística',
    'Técnico universitario en Administración de Empresas',
    850.00,
    73,
    38,
    'Nayely es una profesional joven que vive en la colonia Escalón y trabaja en zona Rosa. Representa al consumidor urbano aspiracional del Gran San Salvador: está dispuesta a pagar precios premium si el producto tiene buena presentación, historia detrás o valor diferencial claro. Frecuenta pupuserías de la Zona Rosa y el food court de Multiplaza. Acepta pupusas gourmet a $2.00-$2.50 si incluyen ingredientes especiales como loroco importado o queso de cabra. Usa lenguaje neutro capitalino con ocasionales anglicismos. Valora la limpieza, el empaque y la experiencia del lugar tanto como el sabor.'
),
(
    'NES-OCC-003',
    'Carlos Ernesto Molina Gutiérrez',
    41,
    'Masculino',
    'Santa Ana',
    'Santa Ana',
    'Occidental',
    'Supervisor de producción en fábrica textil',
    'Bachillerato técnico vocacional',
    520.00,
    55,
    47,
    'Carlos trabaja en el corredor industrial de Santa Ana y representa al consumidor obrero-formal de la zona occidental. Con una familia de cuatro personas, gestiona el presupuesto familiar con disciplina y compara precios antes de cada compra significativa. Acepta variaciones de precio de hasta 15% antes de reconsiderar una compra habitual. Compra pupusas como cena familiar los fines de semana; prefiere paquetes de 6 o más unidades a precio de mayoreo. Usa expresiones del occidente como "cipote", "está bien chivo" o "no se puede". Tiene lealtad moderada a marcas locales reconocidas y desconfía de productos sin procedencia clara.'
),
(
    'NES-PAR-004',
    'María Concepción "Conchita" Velásquez Torres',
    36,
    'Femenino',
    'La Paz',
    'Zacatecoluca',
    'Paracentral',
    'Maestra de educación primaria / Pupusera los fines de semana',
    'Licenciatura en Ciencias de la Educación',
    680.00,
    68,
    44,
    'Conchita combina su rol de docente con la venta de pupusas artesanales los sábados en el parque central de Zacatecoluca, lo que le da una perspectiva única: es simultáneamente productora y consumidora frecuente del mercado pupusero. Conoce los costos de producción por dentro y tiene un umbral de precio justo muy calibrado — detecta inmediatamente si una pupusa está sobrevaluada respecto a sus ingredientes. Región Paracentral mezcla influencias del habla capitalina con giros rurales: dice "chivo", "bien hecho" y usa diminutivos afectivos. Acepta precios de $0.75 a $1.25 por pupusa si la calidad de la masa y el relleno lo justifican.'
);
