<div align="center">

# 🛒 NovaMarket

**Sistema de gestión comercial con base de datos relacional en Oracle SQL**

![Oracle SQL](https://img.shields.io/badge/Oracle_SQL-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![PL/SQL](https://img.shields.io/badge/PL%2FSQL-336791?style=for-the-badge&logo=oracle&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Uso](#-instalación-y-uso)
- [Autor](#-autor)

---

## 📌 Descripción

**NovaMarket** es un sistema de gestión comercial completo, diseñado con una arquitectura de base de datos relacional robusta en **Oracle SQL**. El sistema gestiona inventario, ventas, clientes y reportes operacionales, e incluye una **API REST en Node.js** para el consumo externo de datos.

Este proyecto aplica buenas prácticas en diseño de bases de datos: normalización, integridad referencial, automatización mediante triggers y optimización de consultas mediante vistas.

---

## ✨ Características

- ✅ Diseño relacional con tablas, claves primarias y foráneas bien definidas
- ✅ **Triggers** automáticos para auditoría y aplicación de reglas de negocio
- ✅ **Secuencias** para generación automática y consistente de IDs
- ✅ **Vistas optimizadas** para reportes y consultas frecuentes
- ✅ Scripts de datos de prueba listos para usar
- ✅ **API REST** (Node.js) para integración con cualquier frontend

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| Oracle SQL Developer | Motor de base de datos principal |
| PL/SQL | Triggers, secuencias y lógica de negocio |
| Node.js | API REST para consumo de datos |

---

## 🗂️ Estructura del Proyecto

```
📁 NovaMarket/
├── 📄 NovaMarketCreacionDeTablas.sql       — DDL: creación de tablas y relaciones
├── 📄 NovaMarketSecuenciasTriggers.sql     — Secuencias y triggers automáticos
├── 📄 NovaMarketVistas.sql                 — Vistas optimizadas para reportes
├── 📄 NovaMarketInserts.sql                — Datos de prueba (INSERT)
├── 📦 NovaAPI.zip                          — API REST en Node.js
└── 📄 README.md
```

---

## ⚙️ Instalación y Uso

### Base de datos (Oracle SQL Developer)

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/BarrantesmzDev/NovaMarket.git
   ```

2. Ejecutar los scripts en Oracle SQL Developer **en este orden**:
   ```
   1. NovaMarketCreacionDeTablas.sql
   2. NovaMarketSecuenciasTriggers.sql
   3. NovaMarketVistas.sql
   4. NovaMarketInserts.sql
   ```

### API REST (Node.js)

3. Descomprimir `NovaAPI.zip` e instalar dependencias:
   ```bash
   cd NovaAPI
   npm install
   node index.js
   ```

> ⚠️ Asegúrate de configurar las credenciales de conexión a tu instancia de Oracle en el archivo de configuración de la API.

---

## 👤 Autor

**Jose Andres Barrantes Muñoz**  
Systems Engineering Student · Alajuela, Costa Rica

[![GitHub](https://img.shields.io/badge/GitHub-BarrantesmzDev-181717?style=flat&logo=github)](https://github.com/BarrantesmzDev)
[![Email](https://img.shields.io/badge/Email-jbarrantes.dev%40gmail.com-D14836?style=flat&logo=gmail&logoColor=white)](mailto:jbarrantes.dev@gmail.com)

---

<div align="center">
<sub>⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub</sub>
</div>
