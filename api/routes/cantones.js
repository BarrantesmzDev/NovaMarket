const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const dbConfig = require("../db");

// ======================= LISTAR TODOS =======================
// Necesario para dropdowns de Distrito
router.get("/", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(`
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_CANTONES_LISTAR_SP(:OUT_CURSOR);
      END;
    `, { OUT_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } });

    const cursor = result.outBinds.OUT_CURSOR;
    const rows = await cursor.getRows();

    await cursor.close();
    await conn.close();

    res.json({ cantones: rows });

  } catch (err) {
    console.error("ERROR listar todos cantones:", err);
    res.status(500).json({ error: err.message });
  }
});
//------------------------------------------------
router.get("/provincia/:idProvincia", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_CANTONES_LISTAR_POR_PROVINCIA_SP(
          :P_ID_PROVINCIA,
          :OUT_CURSOR
        );
      END;
      `,
      {
        P_ID_PROVINCIA: req.params.idProvincia,
        OUT_CURSOR: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
      }
    );

    const cursor = result.outBinds.OUT_CURSOR;
    const rows = await cursor.getRows();

    await cursor.close();
    await conn.close();

    res.json({ cantones: rows });

  } catch (err) {
    console.error("ERROR filtro cantones:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================= INSERTAR =======================
router.post("/", async (req, res) => {
  try {
    const { nombre, provincia, estado } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_CANTONES_INSERTARSEQ_SP(
          :P_NOMBRE,
          :P_PROVINCIA,
          :P_ESTADO
        );
      END;
      `,
      {
        
        P_NOMBRE: nombre,
        P_PROVINCIA: provincia,
        P_ESTADO: estado
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Cantón insertado correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================= ACTUALIZAR =======================
router.put("/:id", async (req, res) => {
  try {
    const { nombre, provincia, estado } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_CANTONES_ACTUALIZAR_SP(
          :P_ID,
          :P_NOMBRE,
          :P_PROVINCIA,
          :P_ESTADO
        );
      END;
      `,
      {
        P_ID: req.params.id,
        P_NOMBRE: nombre,
        P_PROVINCIA: provincia,
        P_ESTADO: estado
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Cantón actualizado correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================= ELIMINAR (lógico) =======================
router.delete("/:id", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_CANTONES_ELIMINAR_SP(:P_ID);
      END;
      `,
      { P_ID: req.params.id }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Cantón inactivado correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;