const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const dbConfig = require("../db");

// ======================================================
//  LISTAR SUCURSALES POR PROVINCIA
// ======================================================
router.get("/provincia/:idProvincia", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.SUCURSALES_LISTAR_POR_PROVINCIA_SP(
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

    res.json({ sucursales: rows });

  } catch (err) {
    console.error("ERROR filtro sucursales:", err);
    res.status(500).json({ error: err.message });
  }
});


// ======================================================
//  LISTAR TODAS LAS SUCURSALES
// ======================================================
router.get("/", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_SUCURSALES_LISTAR_SP(
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

    res.json({ sucursales: rows });

  } catch (err) {
    console.error("ERROR listar sucursales:", err);
    res.status(500).json({ error: err.message });
  }
});


// ======================================================
// CRUD  (Insert, Update, Delete)
// ======================================================

router.post("/", async (req, res) => {
  let conn;

  try {
    const {
      nombreSucursal,
      telefono,
      fechaApertura,
      detalleDireccion,
      codigoPostal,
      idDistrito,
      idEstado
    } = req.body;

    conn = await oracledb.getConnection(dbConfig);

    // 1️⃣ INSERTAR DIRECCIÓN (usa NEXTVAL internamente)
    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_DIRECCIONES_INSERTARSEQ_SP(
          :DETALLE,
          :CODIGO_POSTAL,
          :ID_DISTRITO,
          :ID_ESTADO
        );
      END;
      `,
      {
        DETALLE: detalleDireccion,
        CODIGO_POSTAL: codigoPostal,
        ID_DISTRITO: Number(idDistrito),
        ID_ESTADO: Number(idEstado)
      }
    );

    // 2️⃣ OBTENER EL ID GENERADO CON CURRVAL
    const resultId = await conn.execute(
      `SELECT FIDE_DIRECCIONES_SEQ.CURRVAL FROM DUAL`
    );

    const idDireccion = resultId.rows[0][0];

    // 3️⃣ INSERTAR SUCURSAL
    await conn.execute(
      `
  BEGIN
    FIDE_NOVAMARKET_PKG.FIDE_SUCURSALES_INSERTARSEQ_SP(
      :NOMBRE,
      :TELEFONO,
      TO_DATE(:FECHA_APERTURA, 'YYYY-MM-DD'),
      :ID_DIRECCION,
      :ID_ESTADO
    );
  END;
  `,
      {
        NOMBRE: nombreSucursal,
        TELEFONO: telefono,
        FECHA_APERTURA: fechaApertura, // string YYYY-MM-DD
        ID_DIRECCION: idDireccion,
        ID_ESTADO: Number(idEstado)
      }
    );

    await conn.commit();
    res.json({ success: true, message: "Sucursal creada correctamente" });

  } catch (err) {
    console.error("ERROR SUCURSAL:", err);
    res.status(500).json({ error: err.message });

  } finally {
    if (conn) await conn.close();
  }
});

// ======================================================
//  ACTUALIZAR SUCURSAL (incluye dirección)
// ======================================================
router.put("/:id", async (req, res) => {
  try {
    const {
      idDireccion,
      nombreSucursal,
      telefono,
      fechaApertura,

      detalleDireccion,
      codigoPostal,
      idDistrito,

      idEstado
    } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    // 🔹 Primero actualizar la dirección
    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_DIRECCIONES_ACTUALIZAR_SP(
          :P_ID_DIRECCION,
          :P_DETALLE,
          :P_CODIGO_POSTAL,
          :P_ID_DISTRITO_FK,
          1
        );
      END;
    `,
      {
        P_ID_DIRECCION: idDireccion,
        P_DETALLE: detalleDireccion,
        P_CODIGO_POSTAL: codigoPostal,
        P_ID_DISTRITO_FK: idDistrito
      }
    );

    // 🔹 Luego actualizar la sucursal
    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_SUCURSALES_ACTUALIZAR_SP(
          :P_ID_SUCURSAL,
          :P_NOMBRE_SUCURSAL,
          :P_TELEFONO,
          :P_FECHA_APERTURA,
          :P_ID_DIRECCION_FK,
          :P_ID_ESTADO_FK
        );
      END;
      `,
      {
        P_ID_SUCURSAL: req.params.id,
        P_NOMBRE_SUCURSAL: nombreSucursal,
        P_TELEFONO: telefono,
        P_FECHA_APERTURA: fechaApertura,
        P_ID_DIRECCION_FK: idDireccion,
        P_ID_ESTADO_FK: idEstado
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Sucursal actualizada correctamente" });

  } catch (err) {
    console.error("ERROR update sucursal:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
//  ELIMINAR (lógico) SUCURSAL
// ======================================================
router.delete("/:id", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_SUCURSALES_ELIMINAR_SP(:P_ID_SUCURSAL);
      END;
      `,
      {
        P_ID_SUCURSAL: req.params.id
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Sucursal inactivada correctamente" });

  } catch (err) {
    console.error("ERROR eliminar sucursal:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

