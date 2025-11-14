import { motion } from "framer-motion";

type PanelEventosProps = {
    eventos: string[];
};

export function PanelEventos({ eventos }: PanelEventosProps) {

    const eventosKey = eventos.join("|");

    return (
        <motion.div
            className="w-3/4 bg-white shadow-md rounded-2xl p-4 mt-8 mb-8 border border-gray-200"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <h2 className="text-xl font-semibold mb-3 text-gray-700">📜 Registro de eventos</h2>
            <motion.div
                key={eventosKey}
                className="flex flex-col gap-2 max-h-60 overflow-y-auto"
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {eventos.slice().reverse().map((evento, index) => (
                    <div
                        key={index}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                    >
                        {evento}
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
};