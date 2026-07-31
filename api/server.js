const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// STATIC
app.use(express.static(path.join(__dirname, "public")));

// RUTAS
app.use("/api/login", require("./routes/login"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/productos", require("./routes/productos"));
app.use("/api/estados", require("./routes/estados"));
app.use("/api/puestos", require("./routes/puestos"));
app.use("/api/provincias", require("./routes/provincias"));
app.use("/api/cantones", require("./routes/cantones"));
app.use("/api/distritos", require("./routes/distritos"));
app.use("/api/sucursales", require("./routes/sucursales"));
// FRONTEND (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(5000, () => {
  console.log("API running on http://localhost:5000");
});