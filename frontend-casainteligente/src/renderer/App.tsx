import { useEffect, useState } from "react";
import type { EstadoGlobal } from "../types";
import { toast } from "sonner";
import { Card } from "../components/card/Card";

export default function App() {

  const [estado, setEstado] = useState<EstadoGlobal>({
    alarma: false,
    sonando: false,
    termostato: false,
    habitaciones: []
  });

  useEffect(() => {
    const intervalo = setInterval(() => {
      fetch("http://localhost:8080/estado.json")
        .then(res => res.json())
        .then(data => setEstado(data))
        .catch(() => toast.message("Esperando datos..."));
    }, 2000);

    return () => clearInterval(intervalo);
  }, []);

  console.log(estado)

  return (
    <div className="flex flex-col items-center space-y-5 justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">🏠 Casa Inteligente</h1>
      {estado.habitaciones.length === 0 && <span>Cargando habitaciones...</span>}
      {estado.habitaciones.length > 0 && (
        <div className="grid grid-cols-3 gap-5">
          <Card habitacion={estado.habitaciones[0]} />
          <Card habitacion={estado.habitaciones[1]} />
          <Card habitacion={estado.habitaciones[2]} />
        </div>
      )}
    </div>
  );
};