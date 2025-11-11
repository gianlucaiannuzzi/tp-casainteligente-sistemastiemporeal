import express from "express";
import fs from "fs";
import cors from "cors";

export function iniciarServidor() {
  const app = express();
  const path = "../TP-CasaInteligente";
  app.use(cors());
  app.get("/estado.json", (req, res) => {
    try {
      const data = fs.readFileSync(`${path}/estado.json`, "utf8");
      res.json(JSON.parse(data));
    } catch {
      res.status(404).json({ error: "No se encontró el archivo." });
    }
  });
  app.listen(8080, () => console.log("Servidor JSON en http://localhost:8080"));
};