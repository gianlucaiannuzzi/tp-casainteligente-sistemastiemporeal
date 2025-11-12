import { useEffect, useState } from "react";
import type { EstadoGlobal } from "../types";
import { toast } from "sonner";
import { Card, Skeleton } from "../components";
import { Bell, BellOff, Thermometer, ThermometerSnowflake, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

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
    }, 500);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-5 justify-center h-screen bg-gray-100">
      <div className="flex items-center gap-5">
        <h1 className="text-3xl font-bold text-blue-600">🏠 Casa Inteligente</h1>
        {estado.habitaciones && estado.habitaciones.length > 0 && (
          <>
            {estado.alarma ? (
              <motion.div
                key="alarma-on"
                initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -30, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                <Bell className="w-7 h-7 text-red-500" aria-label="Alarma activa" />
              </motion.div>
            ) : (
              <motion.div
                key="alarma-off"
                initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                <BellOff className="w-7 h-7 text-gray-400" aria-label="Alarma apagada" />
              </motion.div>
            )}
            {estado.sonando ? (
              <motion.div
                key="sonando-on"
                initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -30, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                <Volume2 className="w-7 h-7 text-yellow-500 animate-bounce" aria-label="Alarma sonando" />
              </motion.div>
            ) : (
              <motion.div
                key="sonando-off"
                initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                <VolumeX className="w-7 h-7 text-gray-400" aria-label="Alarma inactiva" />
              </motion.div>
            )}
            {estado.termostato ? (
              <motion.div
                key="termostato-on"
                initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -30, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                <Thermometer className="text-orange-500 w-7 h-7" aria-label="Termostato encendido" />
              </motion.div>
            ) : (
              <motion.div
                key="termostato-off"
                initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              >
                <ThermometerSnowflake className="text-blue-500 w-7 h-7" aria-label="Termostato apagado" />
              </motion.div>
            )}
          </>
        )}
      </div>
      <div className="grid grid-cols-3 gap-5">
        {estado.habitaciones && estado.habitaciones.length === 0 && Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} />
        ))}
        {estado.habitaciones && estado.habitaciones.length > 0 && estado.habitaciones.map((habitacion, i) => (
          <Card key={i} habitacion={habitacion} />
        ))}
      </div>
    </div>
  );
};