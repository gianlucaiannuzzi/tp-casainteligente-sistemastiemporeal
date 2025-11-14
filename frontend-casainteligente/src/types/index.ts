export type EstadoHabitacion = {
    nombre: string;
    temperatura: number;
    lux: number;
    luz: boolean;
    movimiento: boolean;
};

export type BlinkEstadoHabitacion = {
    temperatura: boolean;
    lux: boolean;
    luz: boolean;
    movimiento: boolean;
};

export type EstadoGlobal = {
    alarma: boolean;
    sonando: boolean;
    termostato: boolean;
    habitaciones: EstadoHabitacion[];
    eventos: string[];
};