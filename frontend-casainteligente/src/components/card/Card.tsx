import { useEffect, useRef, useState } from "react";
import type { BlinkEstadoHabitacion, EstadoHabitacion } from "../../types";

type CardProps = {
    habitacion: EstadoHabitacion;
};

export function Card({ habitacion }: CardProps) {

    const prev = useRef<EstadoHabitacion | null>(null);
    const [blink, setBlink] = useState<BlinkEstadoHabitacion>({
        temperatura: false,
        lux: false,
        luz: false,
        movimiento: false
    });

    useEffect(() => {
        if (prev.current === null) {
            prev.current = habitacion;
            return;
        };

        setBlink({
            temperatura: habitacion.temperatura !== prev.current.temperatura,
            lux: habitacion.lux !== prev.current.lux,
            luz: habitacion.luz !== prev.current.luz,
            movimiento: habitacion.movimiento !== prev.current.movimiento
        })
        prev.current = habitacion;
    }, [habitacion]);

    return (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden w-60 overflow-y-auto" >
            <div className="h-10 p-2 flex justify-center bg-blue-600 text-white">
                <span>{habitacion.nombre}</span>
            </div>
            <div className="h-10 flex justify-between p-2 border-b text-slate-600">
                <label className="font-bold">
                    Temperatura
                </label>
                <span className={blink.temperatura ? "animate-blink" : ""}>
                    {habitacion.temperatura + " °C"}
                </span>
            </div>
            <div className="h-10 flex justify-between p-2 border-b text-slate-600">
                <label className="font-bold">
                    Lux
                </label>
                <span className={blink.lux ? "animate-blink" : ""}>
                    {habitacion.lux + " lm/m²"}
                </span>
            </div>
            <div className="h-10 flex justify-between p-2 border-b text-slate-600">
                <label className="font-bold">
                    Luz
                </label>
                <span className={blink.luz ? "animate-blink" : ""}>
                    {habitacion.luz ? "Encendida" : "Apagada"}
                </span>
            </div>
            <div className="h-10 flex justify-between p-2 border-b text-slate-600">
                <label className="font-bold">
                    Movimiento
                </label>
                <span className={blink.movimiento ? "animate-blink" : ""}>
                    {habitacion.movimiento ? "Si" : "No"}
                </span>
            </div>
        </div>
    );
};