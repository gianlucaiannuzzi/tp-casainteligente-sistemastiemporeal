import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";

export function iniciarServidor() {
  const app = express();
  app.use(cors());

  app.get("/estado.json", (req, res) => {
    try {
      const filePath = path.join(
        "C:",
        "tp-casainteligente-sistemastiemporeal",
        "TP-CasaInteligente",
        "estado.json"
      );

      const data = fs.readFileSync(filePath, "utf8");
      res.json(JSON.parse(data));
    } catch (err) {
      console.error("Error leyendo estado.json:", err.message);
      res.status(404).json({ error: "No se encontró el archivo estado.json." });
    }
  });

  app.listen(8080, () => console.log("Servidor JSON en http://localhost:8080"));
}
