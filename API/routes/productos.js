const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

const dbConfig = {
  user: "NOVAMARKET_",
  password: "12345",
  connectionString: "localhost/XEPDB1"
};

router.get("/total", async (req, res) => {
  try {
    const conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      "SELECT COUNT(*) AS TOTAL FROM FIDE_PRODUCTOS_TB WHERE FIDE_PRODUCTOS_ID_ESTADO_FK = 1"
    );

    await conn.close();

    res.json({ total: result.rows[0][0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;