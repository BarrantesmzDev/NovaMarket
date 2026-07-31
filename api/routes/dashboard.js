const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

const dbConfig = {
  user: "NOVAMARKET_",
  password: "12345",
  connectionString: "localhost/XEPDB1"
};

// ========================= DASHBOARD =========================


// ---- TOTAL USUARIOS ----
router.get("/total-clientes", async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `BEGIN FIDE_NOVAMARKET_PKG.FIDE_USUARIOS_TOTAL_CLIENTES_SP(:C); END;`,
      { C: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const cursor = result.outBinds.C;
    const rows = await cursor.getRows();
    await cursor.close();

    res.json({ TOTAL_CLIENTES: rows[0][0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

//--- productos----------
router.get("/total-productos", async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `BEGIN FIDE_NOVAMARKET_PKG.FIDE_PRODUCTOS_TOTAL_PRODUCTOS_SP(:C); END;`,
      { C: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const cursor = result.outBinds.C;
    const rows = await cursor.getRows();
    await cursor.close();

    res.json({ TOTAL_PRODUCTOS: rows[0][0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});
// ---- TOTAL VENTAS POR  ----
router.get("/total-ventas", async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `BEGIN FIDE_NOVAMARKET_PKG.FIDE_VENTAS_TOTAL_VENTAS_SP(:C); END;`,
      { C: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const cursor = result.outBinds.C;
    const rows = await cursor.getRows();
    await cursor.close();

    res.json({ TOTAL_VENTAS: rows[0][0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

// ---- ÚLTIMAS FACTURAS DEL EMPLEADO ----
router.get("/facturas/:idEmpleado", async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      DECLARE
        C SYS_REFCURSOR;
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_FACTURAS_POR_EMPLEADO_SP(
          :P_ID_EMPLEADO,
          C
        );
        :P_CURSOR := C;
      END;
      `,
      {
        P_ID_EMPLEADO: req.params.idEmpleado,
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;
    const rows = await cursor.getRows();
    await cursor.close();

    res.json({ facturas: rows });

  } catch (err) {
    console.error("DASHBOARD EMPLEADO ERROR:", err);
    res.status(500).json({ error: err.message });

  } finally {
    if (conn) {
      try { await conn.close(); } catch (_) {}
    }
  }
});


module.exports = router;