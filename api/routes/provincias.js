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
        FIDE_NOVAMARKET_PKG.FIDE_PROVINCIAS_LISTAR_SP(:OUT_CURSOR);
      END;
      `,
      { OUT_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const cursor = result.outBinds.OUT_CURSOR;
    const rows = await cursor.getRows();
    await cursor.close();
    await conn.close();

    res.json({ provincias: rows });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================= INSERTAR =========================
router.post("/", async (req, res) => {
  try {
    const { nombre, estado } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(`
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_PROVINCIAS_INSERTARSEQ_SP(:P_NOMBRE, :P_ESTADO);
      END;`,
      {
        
        P_NOMBRE: nombre,
        P_ESTADO: estado
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Provincia insertada correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================= ACTUALIZAR =========================
router.put("/:id", async (req, res) => {
  try {
    const { nombre, estado } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(`
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_PROVINCIAS_ACTUALIZAR_SP(:P_ID, :P_NOMBRE, :P_ESTADO);
      END;`,
      {
        P_ID: req.params.id,
        P_NOMBRE: nombre,
        P_ESTADO: estado
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Provincia actualizada correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================= DELETE LÓGICO =========================
router.delete("/:id", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(`
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_PROVINCIAS_ELIMINAR_SP(:P_ID);
      END;`,
      {
        P_ID: req.params.id
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Provincia inactivada correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;