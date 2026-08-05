const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const dbConfig = require("../db");

// ======================================================
//  LISTAR DISTRITOS POR CANTÓN (para filtro)
// ======================================================
router.get("/canton/:idCanton", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_DISTRITOS_LISTAR_POR_CANTON_SP(
          :P_ID_CANTON,
          :OUT_CURSOR
        );
      END;
      `,
      {
        P_ID_CANTON: req.params.idCanton,
        OUT_CURSOR: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
      }
    );

    const cursor = result.outBinds.OUT_CURSOR;
    const rows = await cursor.getRows();

    await cursor.close();
    await conn.close();

    res.json({ distritos: rows });

  } catch (err) {
    console.error("ERROR filtro distritos:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
//  LISTAR TODOS (igual que cantones)
// ======================================================
router.get("/", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_DISTRITOS_LISTAR_POR_CANTON_SP(
          0,
          :OUT_CURSOR
        );
      END;
      `,
      {
        OUT_CURSOR: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
      }
    );

    const cursor = result.outBinds.OUT_CURSOR;
    const rows = await cursor.getRows();

    await cursor.close();
    await conn.close();

    res.json({ distritos: rows });

  } catch (err) {
    console.error("ERROR listar distritos:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
//  INSERTAR DISTRITO
// ======================================================
router.post("/", async (req, res) => {
  try {
    const { nombre, canton, estado } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_DISTRITOS_INSERTARSEQ_SP(
          :P_NOMBRE,
          :P_CANTON,
          :P_ESTADO
        );
      END;
      `,
      {
        
        P_NOMBRE: nombre,
        P_CANTON: canton,
        P_ESTADO: estado
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Distrito insertado correctamente" });

  } catch (err) {
    console.error("ERROR insert distrito:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
//  ACTUALIZAR DISTRITO
// ======================================================
router.put("/:id", async (req, res) => {
  try {
    const { nombre, canton, estado } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_DISTRITOS_ACTUALIZAR_SP(
          :P_ID,
          :P_NOMBRE,
          :P_CANTON,
          :P_ESTADO
        );
      END;
      `,
      {
        P_ID: req.params.id,
        P_NOMBRE: nombre,
        P_CANTON: canton,
        P_ESTADO: estado
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Distrito actualizado correctamente" });

  } catch (err) {
    console.error("ERROR update distrito:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
//  ELIMINAR (lógico) Distrito
// ======================================================
router.delete("/:id", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_DISTRITOS_ELIMINAR_SP(:P_ID);
      END;
      `,
      { P_ID: req.params.id }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Distrito inactivado correctamente" });

  } catch (err) {
    console.error("ERROR eliminar distrito:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;