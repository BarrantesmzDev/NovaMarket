const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const dbConfig = require("../db");

// ===============================
// INSERTAR DIRECCIÓN
// ===============================
router.post("/", async (req, res) => {
  try {
    const { idDireccion, detalle, codigoPostal, idDistrito, idEstado } = req.body;

    const conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_DIRECCIONES_INSERTAR_SP(
          :P_ID_DIRECCION,
          :P_DETALLE,
          :P_CODIGO_POSTAL,
          :P_ID_DISTRITO_FK,
          :P_ID_ESTADO_FK
        );
      END;
      `,
      {
        P_ID_DIRECCION: idDireccion,
        P_DETALLE: detalle,
        P_CODIGO_POSTAL: codigoPostal,
        P_ID_DISTRITO_FK: idDistrito,
        P_ID_ESTADO_FK: idEstado
      }
    );

    await conn.commit();
    await conn.close();

    res.json({ success: true, message: "Dirección creada correctamente" });

  } catch (err) {
    console.error("ERROR insert dirección:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;