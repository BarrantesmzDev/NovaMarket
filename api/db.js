require("dotenv").config();

// Conexión centralizada a Oracle: todas las rutas importan este archivo.
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionString: process.env.DB_CONNECTIONSTRING
};

module.exports = dbConfig;
