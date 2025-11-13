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
    habitaciones: [],
    eventos: []
  });

  useEffect(() => {
    const intervalo = setInterval(() => {
      fetch("http://localhost:8080/estado.json")
        .then(res => res.json())
        .then(data => {
          setEstado(prev => ({
            ...prev,          
            ...data,          
            eventos: data.eventos ?? prev.eventos
          }));
        })
        .catch(() => toast.message("Esperando datos..."));
    }, 500);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-5 min-h-screen bg-gray-100">
      <div className="flex items-center gap-5 mt-5">
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
              <BellOff className="w-7 h-7 text-gray-400" aria-label="Alarma apagada" />
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
              <VolumeX className="w-7 h-7 text-gray-400" aria-label="Alarma inactiva" />
            )}

            {estado.termostato ? (
              <Thermometer className="text-orange-500 w-7 h-7" aria-label="Termostato encendido" />
            ) : (
              <ThermometerSnowflake className="text-blue-500 w-7 h-7" aria-label="Termostato apagado" />
            )}
          </>
        )}
      </div>

      {/* Grid de habitaciones */}
      <div className="grid grid-cols-3 gap-5">
        {estado.habitaciones.length === 0 &&
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} />)}
        {estado.habitaciones.length > 0 &&
          estado.habitaciones.map((habitacion, i) => (
            <Card key={i} habitacion={habitacion} />
          ))}
      </div>

      {/* Panel de eventos */}
      {estado.eventos && estado.eventos.length > 0 && (
        <motion.div
          className="w-3/4 bg-white shadow-md rounded-2xl p-4 mt-8 mb-8 border border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl font-semibold mb-3 text-gray-700">📜 Registro de eventos</h2>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {estado.eventos.slice().reverse().map((evento, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {evento}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};