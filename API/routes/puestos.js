const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

const dbConfig = {
  user: "NOVAMARKET_",
  password: "12345",
  connectionString: "localhost/XEPDB1"
};

// ========================= LISTAR =========================
router.get("/", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_PUESTOS_LISTAR_SP(:OUT_CURSOR);
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

    res.json({ puestos: rows });

  } catch (err) {
    console.error("ERROR en listar puestos:", err);
    res.status(500).json({ error: err.message });
  }
});


// ========================= INSERTAR =========================
router.post("/", async (req, res) => {
  try {
    const { id, nombre, salario, descripcion, estado } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_PUESTOS_INSERTARSEQ_SP(
          :P_NOMBRE,
          :P_SALARIO,
          :P_DESCRIPCION,
          :P_ESTADO
        );
      END;
      `,
      {
        P_ID: id,
        P_NOMBRE: nombre,
        P_SALARIO: salario,
        P_DESCRIPCION: descripcion,
        P_ESTADO: estado
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Puesto insertado correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================= ACTUALIZAR =========================
router.put("/:id", async (req, res) => {
  try {
    const { nombre, salario, descripcion, estado } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_PUESTOS_ACTUALIZAR_SP(
          :P_ID,
          :P_NOMBRE,
          :P_SALARIO,
          :P_DESCRIPCION,
          :P_ESTADO
        );
      END;
      `,
      {
        P_ID: req.params.id,
        P_NOMBRE: nombre,
        P_SALARIO: salario,
        P_DESCRIPCION: descripcion,
        P_ESTADO: estado
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Puesto actualizado correctamente" });

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
        FIDE_NOVAMARKET_PKG.FIDE_PUESTOS_ELIMINAR_SP(:P_ID);
      END;`,
      {
        P_ID: req.params.id
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Puesto inactivado correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;