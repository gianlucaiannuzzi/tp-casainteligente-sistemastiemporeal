import { useEffect, useState } from "react";
import type { EstadoGlobal } from "../types";
import { toast } from "sonner";
import { Card } from "../components/card/Card";
import { Bell, BellOff, Thermometer, ThermometerSnowflake, Volume2, VolumeX } from "lucide-react";

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
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-blue-600">🏠 Casa Inteligente</h1>
        {/* Ícono de alarma */}
        {estado.alarma ? (
          <Bell className="w-6 h-6 text-red-500" aria-label="Alarma activa" />
        ) : (
          <BellOff className="w-6 h-6 text-gray-400" aria-label="Alarma apagada" />
        )}
        {/* Icono de Sonido / Sonando */}
        {estado.sonando ? (
          <Volume2 className="w-7 h-7 text-yellow-500 animate-bounce" />
        ) : (
          <VolumeX className="w-7 h-7 text-gray-400" />
        )}
        {/* Ícono de termostato */}
        {estado.termostato ? (
          <Thermometer className="text-orange-500 w-8 h-8" aria-label="Termostato encendido" />
        ) : (
          <ThermometerSnowflake className="text-blue-400 w-8 h-8" aria-label="Termostato apagado" />
        )}
      </div>
      {/* Habitaciones */}
      {estado.habitaciones.length === 0 && (
        <span className="text-gray-500">Cargando habitaciones...</span>
      )}
      {estado.habitaciones.length > 0 && (
        <div className="grid grid-cols-3 gap-5">
          {estado.habitaciones.map((habitacion, i) => (
            <Card key={i} habitacion={habitacion} />
          ))}
        </div>
      )}
    </div>
  );
};