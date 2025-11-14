import express from "express";
import fs from "fs";
import cors from "cors";

export function iniciarServidor() {
  const app = express();
  app.use(cors());

  app.get("/estado.json", (req, res) => {
    try {
      const data = fs.readFileSync("estado.json", "utf8");
      res.json(JSON.parse(data));
    } catch (err) {
      console.error("Error leyendo estado.json:", err.message);
      res.status(404).json({ error: "No se encontró el archivo estado.json." });
    }
  });

  app.listen(8080, () => console.log("Servidor JSON en http://localhost:8080"));
}
