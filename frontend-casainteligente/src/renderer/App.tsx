import { useEffect, useState } from "react";
import type { EstadoGlobal } from "../types";
import { toast } from "sonner";
import { Card, CardSkeleton, PanelEventos } from "../components";
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
        .catch(() => {
          toast.message("Error refrescando los datos.");
        });
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
          Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
        {estado.habitaciones.length > 0 &&
          estado.habitaciones.map((habitacion, i) => (
            <Card key={i} habitacion={habitacion} />
          ))}
      </div>

      {estado.eventos && estado.eventos.length > 0 && (
        <PanelEventos eventos={estado.eventos} />
      )}
    </div >
  );
};