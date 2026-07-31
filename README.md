# 🛒 NovaMarket

Sistema de gestión comercial con base de datos relacional en **Oracle SQL** — inventario, ventas, clientes y reportes operacionales, con una **API REST en Node.js** para exponer los datos a cualquier frontend.

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

NovaMarket resuelve esto con un modelo relacional normalizado en Oracle, donde la **integridad de los datos vive en la base de datos, no en la aplicación** — los triggers, secuencias y packages actúan como garantías del motor, no como validaciones opcionales del lado del cliente.

---

## 🏗️ Arquitectura

```
Cliente (navegador/app)
        │
        │  HTTP requests
        ▼
   API Express (Node.js)
        │
        │  OracleDB driver
        ▼
   Oracle Database
     ├── Tablas (clientes, productos, ventas, detalle_ventas...)
     ├── Secuencias (generación de IDs)
     ├── Triggers (auditoría y reglas de negocio)
     ├── Vistas (reportes precalculados)
     └── Packages (lógica de negocio agrupada)
```

---

## 🧠 Decisiones de diseño — el por qué detrás del proyecto

### ¿Por qué triggers en lugar de validar solo desde la API?

Si la validación de reglas de negocio (por ejemplo, no permitir stock negativo) solo vive en Node.js, cualquier inserción directa a la base de datos — o un futuro segundo cliente de la API — podría romper la integridad. Los triggers garantizan la regla **a nivel de motor**, sin importar quién escriba los datos.

### ¿Por qué secuencias en vez de un ID autoincremental nativo?

Oracle no maneja `AUTO_INCREMENT` como MySQL. Las secuencias (`NEXTVAL`) dan control explícito sobre la generación de IDs, evitan colisiones en escenarios concurrentes y son reutilizables entre tablas cuando aplica.

### ¿Por qué vistas para los reportes en lugar de repetir queries en la API?

Las vistas encapsulan la lógica de agregación una sola vez, dentro de la base de datos. Esto evita duplicar JOINs complejos en cada endpoint de Node.js y asegura que todos los consumidores del reporte vean exactamente la misma lógica de negocio.

### ¿Por qué agrupar lógica en packages de PL/SQL?

Los packages permiten organizar procedimientos y funciones relacionados bajo un mismo espacio de nombres, separando la **especificación** (qué expone el package) de la **implementación** (cómo lo hace), lo que facilita mantener la lógica de negocio sin exponer detalles internos a quien la consume.

---

## 📂 Estructura del proyecto

```
NovaMarket/
├── sql/
│   ├── NovaMarketCreacionDeTablas.sql      — DDL: tablas y relaciones
│   ├── NovaMarketSecuenciasTriggers.sql    — Secuencias e integridad automática
│   ├── NovaMarketVistas.sql                — Vistas para reportes
│   ├── NovaMarketInserts.sql               — Datos de prueba
│   ├── PACKAGE_FIDE_NOVAMARKET.sql         — Especificación del package
│   └── PACKAGE_BODY_NOVAMARKET.sql         — Implementación del package
├── api/
│   ├── public/
│   │   ├── js/
│   │   │   └── app.js                      — Lógica del frontend
│   │   └── index.html                      — Vista principal
│   ├── routes/                             — Endpoints REST, uno por recurso
│   │   ├── cantones.js
│   │   ├── dashboard.js
│   │   ├── direccion.js
│   │   ├── distritos.js
│   │   ├── estados.js
│   │   ├── login.js
│   │   ├── productos.js
│   │   ├── provincias.js
│   │   ├── puestos.js
│   │   ├── sucursales.js
│   │   └── usuarios.js
│   ├── server.js                           — Entry point de la API
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
├── .gitignore
└── README.md
```

---

## 🔌 Endpoints

La API expone un router por recurso dentro de `api/routes/`:

| Recurso | Archivo | Descripción |
|---|---|---|
| Ubicaciones — provincias | `provincias.js` | Consulta de provincias (división territorial CR) |
| Ubicaciones — cantones | `cantones.js` | Consulta de cantones |
| Ubicaciones — distritos | `distritos.js` | Consulta de distritos |
| Direcciones | `direccion.js` | Gestión de direcciones asociadas a clientes/sucursales |
| Productos | `productos.js` | Catálogo e inventario de productos |
| Sucursales | `sucursales.js` | Gestión de puntos de venta |
| Puestos | `puestos.js` | Catálogo de puestos/roles de empleados |
| Estados | `estados.js` | Catálogo de estados (activo/inactivo, pedido, etc.) |
| Usuarios | `usuarios.js` | Gestión de usuarios del sistema |
| Login | `login.js` | Autenticación de usuarios |
| Dashboard | `dashboard.js` | Métricas y datos agregados para el panel principal |

> ⚠️ **Pendiente:** documentar el método HTTP, parámetros y forma de la respuesta de cada endpoint. Cuando quieras, comparte el contenido de estos archivos y actualizo esta tabla con ejemplos reales de request/response — por ahora se deja a nivel de recurso para no inventar contratos que no coincidan con el código real.

---

## ⚙️ Cómo correrlo localmente

### Base de datos (Oracle SQL Developer)

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/BarrantesmzDev/NovaMarket.git
   cd NovaMarket/sql
   ```
2. Ejecutar los scripts **en este orden exacto**:
   ```
   1. NovaMarketCreacionDeTablas.sql
   2. NovaMarketSecuenciasTriggers.sql
   3. NovaMarketVistas.sql
   4. NovaMarketInserts.sql
   5. PACKAGE_FIDE_NOVAMARKET.sql
   6. PACKAGE_BODY_NOVAMARKET.sql
   ```

### API (Node.js)

3. Instalar dependencias y correr el servidor:
   ```bash
   cd ../api
   npm install
   cp .env.example .env   # agregar credenciales de tu instancia Oracle
   node server.js
   ```

> ⚠️ Asegúrate de tener el driver de Oracle (`node-oracledb`) configurado correctamente y de completar el `.env` con las credenciales de tu instancia antes de levantar el servidor.

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Base de datos | Oracle SQL + PL/SQL |
| Lógica de negocio | Triggers, secuencias, vistas, packages |
| API | Node.js + Express |

---

## 🔭 Roadmap

- [x] Modelado relacional normalizado
- [x] Triggers de integridad y auditoría
- [x] Vistas de reportes
- [x] API REST estructurada en `api/`
- [ ] Documentar variables de entorno (`.env.example`)
- [ ] Tests de integración para la API
- [ ] Deploy de la API

---

## 👤 Autor

**Jose Andres Barrantes Muñoz**
Estudiante de Ingeniería en Sistemas — Universidad Fidélitas
[GitHub](https://github.com/BarrantesmzDev) · [LinkedIn](https://linkedin.com/in/josebarrantesmz)
