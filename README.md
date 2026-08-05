# 🛒 NovaMarket

Sistema de gestión comercial construido sobre **Oracle SQL** y una **API REST en Node.js**. La integridad de los datos vive en la base de datos — triggers, secuencias, vistas materializadas y packages PL/SQL actúan como garantías del motor, no como validaciones opcionales del lado del cliente.

![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)
![Oracle](https://img.shields.io/badge/Oracle-PL%2FSQL-red)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 Qué resuelve este proyecto

Un negocio de retail necesita responder preguntas operativas básicas de forma confiable y consistente:

- ¿Cuánto inventario queda de cada producto en este momento?
- ¿Qué se vendió hoy, a qué cliente y por cuánto?
- ¿Cómo garantizo que los IDs y los totales nunca queden inconsistentes, incluso si dos operaciones ocurren al mismo tiempo?

NovaMarket resuelve esto con un modelo relacional normalizado en Oracle, donde la integridad de los datos vive en la base de datos — los triggers, secuencias y packages actúan como garantías del motor, no como validaciones opcionales del lado de la aplicación.

---

## 🏗️ Arquitectura

```
Cliente (navegador/app)
        │
        │  HTTP (REST)
        ▼
   API Express (Node.js)
        │
        │  routes/ → productos, usuarios, sucursales,
        │            puestos, dashboard, ubicación (CR)...
        ▼
   Oracle Database
        ├── Tablas normalizadas   (productos, inventarios, facturas, clientes...)
        ├── Secuencias            (generación de PKs)
        ├── Triggers              (integridad y consistencia transaccional)
        ├── Vistas materializadas (reportes precalculados, ej. inventario crítico)
        └── Packages PL/SQL       (lógica de negocio encapsulada en el motor)
```

---

## 🧠 Decisiones de diseño — el por qué detrás del código

### ¿Por qué la lógica de negocio vive en la base de datos y no solo en la API?

En un sistema comercial, dos operaciones pueden intentar modificar el mismo inventario al mismo tiempo. Confiar esa integridad únicamente a la capa de aplicación abre la puerta a condiciones de carrera. Al mover triggers, secuencias y packages a Oracle, la consistencia se garantiza en el mismo lugar donde ocurre la escritura — no depende de que cada desarrollador recuerde validar correctamente desde Node.js.

### ¿Por qué vistas materializadas en lugar de calcular todo en tiempo real?

Reportes como el estado de inventario crítico se consultan con mucha frecuencia pero cambian con menor frecuencia que cada request. Una vista materializada (`REFRESH COMPLETE START WITH SYSDATE NEXT SYSDATE + 1`) precalcula ese resultado, evitando recorrer y unir varias tablas grandes en cada consulta del dashboard.

### ¿Por qué las tablas de ubicación (provincias, cantones, distritos) están separadas?

Costa Rica tiene una división administrativa jerárquica oficial (provincia → cantón → distrito). Normalizar esa jerarquía en tablas propias, en lugar de guardar texto libre, evita inconsistencias de nombres y permite generar reportes geográficos confiables por sucursal.

### ¿Por qué packages PL/SQL en lugar de solo procedimientos sueltos?

Agrupar procedimientos y funciones relacionadas dentro de un package permite compartir estado y lógica común sin exponerla como tablas o rutas separadas, y facilita mantener versionado el contrato de la lógica de negocio de forma independiente a la API.

---

## 📂 Estructura del proyecto

```
NovaMarket/
├── api/
│   ├── public/
│   │   ├── js/
│   │   └── index.html
│   ├── routes/
│   │   ├── login.js
│   │   ├── productos.js
│   │   ├── usuarios.js
│   │   ├── sucursales.js
│   │   ├── puestos.js
│   │   ├── dashboard.js
│   │   ├── direccion.js
│   │   ├── provincias.js
│   │   ├── cantones.js
│   │   ├── distritos.js
│   │   └── estados.js
│   ├── db.js
│   ├── server.js
│   └── .env.example
├── sql/
│   ├── NovaMarketCreacionDeTablas.sql
│   ├── NovaMarketSecuenciasTriggers.sql
│   ├── NovaMarketInserts.sql
│   ├── NovaMarketVistas.sql
│   ├── PACKAGE_FIDE_NOVAMARKET.sql
│   └── PACKAGE_BODY_NOVAMARKET.sql
├── .gitignore
└── README.md
```

---

## 🔌 Recursos principales de la API

| Recurso | Ruta base | Descripción |
|---|---|---|
| Autenticación | `/login` | Inicio de sesión de usuarios del sistema |
| Productos | `/productos` | CRUD de catálogo e inventario |
| Usuarios | `/usuarios` | Gestión de usuarios internos |
| Sucursales | `/sucursales` | Puntos de venta registrados |
| Puestos | `/puestos` | Roles/puestos de empleados |
| Dashboard | `/dashboard` | Métricas operativas (ventas, inventario crítico) |
| Provincias / Cantones / Distritos | `/provincias`, `/cantones`, `/distritos` | Catálogo de división administrativa de Costa Rica |
| Estados | `/estados` | Catálogos de estado (activo/inactivo, etc.) |

> Ajusta esta tabla con los métodos HTTP y parámetros exactos de cada ruta a medida que el proyecto se estabiliza.

---

## 🚀 Cómo correrlo localmente

```bash
git clone https://github.com/BarrantesmzDev/NovaMarket.git
cd NovaMarket/api
npm install
cp .env.example .env   # agregar tus credenciales de conexión a Oracle
```

Ejecuta los scripts SQL en este orden contra tu instancia de Oracle:

```sql
-- 1. Estructura
@sql/NovaMarketCreacionDeTablas.sql

-- 2. Secuencias y triggers
@sql/NovaMarketSecuenciasTriggers.sql

-- 3. Datos de ejemplo
@sql/NovaMarketInserts.sql

-- 4. Vistas y reportes
@sql/NovaMarketVistas.sql

-- 5. Packages de lógica de negocio
@sql/PACKAGE_FIDE_NOVAMARKET.sql
@sql/PACKAGE_BODY_NOVAMARKET.sql
```

Luego levanta la API:

```bash
node server.js
```

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Base de datos | Oracle SQL (PL/SQL, triggers, secuencias, vistas materializadas, packages) |
| Backend | Node.js + Express |
| Frontend de referencia | HTML/JS servido desde `api/public` |
| Control de versiones | Git / GitHub |

---

## 🔭 Roadmap

- [x] Modelo relacional normalizado en Oracle
- [x] Triggers y secuencias para integridad transaccional
- [x] Vistas materializadas para reportes operativos
- [x] Packages PL/SQL para lógica de negocio
- [x] API REST en Express conectada a Oracle
- [ ] Documentación de endpoints con ejemplos de request/response
- [ ] Autenticación con tokens (JWT)
- [ ] Pruebas automatizadas de la API
- [ ] Deploy de la API en un entorno cloud

---

## 👤 Autor

**Jose Andres Barrantes Muñoz**
Estudiante de Ingeniería en Sistemas — Universidad Fidélitas
[GitHub](https://github.com/BarrantesmzDev) · [LinkedIn](https://linkedin.com/in/josebarrantesmz)
