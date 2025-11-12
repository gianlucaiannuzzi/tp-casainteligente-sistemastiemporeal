import type { EstadoHabitacion } from "../../types";

type CardProps = {
    habitacion: EstadoHabitacion;
};

export function Card({ habitacion }: CardProps) {
    return (
        <div className="rounded-lg border shadow-sm overflow-hidden w-60 overflow-y-auto">
            <div className="h-10 p-2 flex justify-center bg-blue-600 text-white">
                <span>{habitacion.nombre}</span>
            </div>
            <div className="h-10 flex justify-between p-2 border-b text-slate-600">
                <label className="font-bold">
                    Temperatura
                </label>
                <span>
                    {habitacion.temperatura + " C°"}
                </span>
            </div>
            <div className="h-10 flex justify-between p-2 border-b text-slate-600">
                <label className="font-bold">
                    Lux
                </label>
                <span>
                    {habitacion.lux + " lumen/m²"}
                </span>
            </div>
            <div className="h-10 flex justify-between p-2 border-b text-slate-600">
                <label className="font-bold">
                    Luz
                </label>
                <span>
                    {habitacion.luz ? "Encendida" : "Apagada"}
                </span>
            </div>
            <div className="h-10 flex justify-between p-2 border-b text-slate-600">
                <label className="font-bold">
                    Movimiento
                </label>
                <span>
                    {habitacion.movimiento ? "Si" : "No"}
                </span>
            </div>
        </div>
    );
};