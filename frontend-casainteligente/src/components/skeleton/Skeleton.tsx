
export function Skeleton() {
    return (
        <div className="relative animate-pulse rounded-lg border shadow-sm overflow-hidden w-60 overflow-y-auto">
            <div className="h-10 p-2 flex justify-center bg-slate-400 text-white" />
            <div className="h-10 flex justify-between p-2 border-b" />
            <div className="h-10 flex justify-between p-2 border-b" />
            <div className="h-10 flex justify-between p-2 border-b" />
            <div className="h-10 flex justify-between p-2 border-b" />
        </div>
    );
};