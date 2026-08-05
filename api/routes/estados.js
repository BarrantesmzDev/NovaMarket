const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const dbConfig = require("../db");

// ========================= LISTAR =========================
router.get("/", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
  BEGIN
    FIDE_NOVAMARKET_PKG.FIDE_ESTADOS_LISTAR_SP(:OUT_CURSOR);
  END;
  `,
      {
        OUT_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.OUT_CURSOR;
    const rows = await cursor.getRows();
    await cursor.close();
    await conn.close();

    res.json({ estados: rows });

  } catch (err) {
    console.error("ERROR EN LISTAR ESTADOS:", err);
    res.status(500).json({ error: err.message });
  }
});

// ========================= INSERTAR =========================
router.post("/", async (req, res) => {
  try {
    const { nombre } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(`
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_ESTADOS_INSERTARSEQ_SP(:P_NOMBRE);
      END;`,
      { P_NOMBRE: nombre }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Estado insertado correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================= ACTUALIZAR =========================
router.put("/:id", async (req, res) => {
  try {
    const { nombre } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(`
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_ESTADOS_ACTUALIZAR_SP(:P_ID, :P_NOMBRE);
      END;`,
      { P_ID: req.params.id, P_NOMBRE: nombre }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Estado actualizado correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;