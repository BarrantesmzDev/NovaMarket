const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const dbConfig = require("../db");

// ===============================
// TOTAL USUARIOS ACTIVOS
// ===============================
router.get("/total", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute(
      "SELECT COUNT(*) FROM FIDE_USUARIOS_TB WHERE FIDE_USUARIOS_ID_ESTADO_FK = 1"
    );
    await conn.close();
    res.json({ total: result.rows[0][0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// LISTAR USUARIOS
// ===============================
router.get("/", async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_USUARIOS_LISTAR_TABLA_SP(:OUT_CURSOR);
      END;
      `,
      { OUT_CURSOR: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT } }
    );

    const cursor = result.outBinds.OUT_CURSOR;
    const rows = await cursor.getRows();
    await cursor.close();

    res.json({ usuarios: rows });

  } catch (err) {
    console.error("ERROR LISTANDO USUARIOS:", err);
    res.status(500).json({ error: err.message });

  } finally {
    if (conn) await conn.close();
  }
});

// ===============================
// OBTENER USUARIO POR ID
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_USUARIOS_OBTENER_SP(
          :idUsuario,
          :OUT_CURSOR
        );
      END;
      `,
      {
        idUsuario: req.params.id,
        OUT_CURSOR: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
      }
    );

    const cursor = result.outBinds.OUT_CURSOR;
    const rows = await cursor.getRows(1);
    await cursor.close();
    await conn.close();

    if (!rows.length) {
      return res.json({ success: false });
    }

    res.json({ success: true, usuario: rows[0] });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===============================
// INSERTAR USUARIO
// ===============================
router.post("/", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_USUARIOS_INSERTAR_APP_SP(
          :cedula,
          :nombre,
          :apPat,
          :apMat,
          :fechaNac,
          :pass,
          :idCorreo,
          :idTelefono,
          :idDireccion,
          :idPuesto,
          :idSucursal,
          :idEstado,
          :tipoUsuario,
          :salario,
          :fechaContrato,
          :puntos,
          :creadoPor
        );
      END;
      `,
      {
        ...req.body,
        apPat: req.body.apellidoPaterno,
        apMat: req.body.apellidoMaterno
      },
      { autoCommit: true }
    );

    await conn.close();
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===============================
// MODIFICAR USUARIO
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_USUARIOS_MODIFICAR_APP_SP(
          :idUsuario,
          :cedula,
          :nombre,
          :apPat,
          :apMat,
          :fechaNac,
          :pass,
          :idCorreo,
          :idTelefono,
          :idDireccion,
          :idPuesto,
          :idSucursal,
          :idEstado,
          :tipoUsuario,
          :salario,
          :fechaContrato,
          :puntos,
          :modificadoPor
        );
      END;
      `,
      {
        idUsuario: req.params.id,
        ...req.body,
        apPat: req.body.apellidoPaterno,
        apMat: req.body.apellidoMaterno,
        modificadoPor: "APP"
      },
      { autoCommit: true }
    );

    await conn.close();
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===============================
// ELIMINAR USUARIO (LÓGICO)
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_USUARIOS_ELIMINAR_APP_SP(
          :idUsuario,
          2,
          'APP'
        );
      END;
      `,
      { idUsuario: req.params.id },
      { autoCommit: true }
    );

    await conn.close();
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;