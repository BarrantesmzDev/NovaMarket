const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

const dbConfig = {
  user: "NOVAMARKET_",
  password: "12345",
  connectionString: "localhost/XEPDB1"
};

// ===================== LOGIN =====================
router.post("/", async (req, res) => {
  try {
    const { usuario } = req.body; // <<< YA NO VIENE ROL

    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
      DECLARE
        SALIDA VARCHAR2(500);
      BEGIN
        FIDE_NOVAMARKET_PKG.FIDE_USUARIOS_LOGIN_USUARIO_SP(:P_USUARIO, SALIDA);
        :P_RESULT := SALIDA;
      END;
      `,
      {
        P_USUARIO: usuario,
        P_RESULT: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      }
    );

    await conn.close();

    const output = result.outBinds.P_RESULT;

    // MANEJO DE ERROR DESDE ORACLE
    if (output.startsWith("ERROR")) {
      return res.status(400).json({ success: false, error: output });
    }

    // CONVERTIR JSON → OBJETO
    const userData = JSON.parse(output);

    return res.json({
      success: true,
      usuario: userData
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      error: "ERROR INTERNO",
      detalle: err.message
    });
  }
});

module.exports = router;