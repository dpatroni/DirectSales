type CycleProps = {
    name: string
    daysRemaining: number
}

export function CycleCard({ name, daysRemaining }: CycleProps) {
    return (
        <div className="col-span-2 bg-gradient-to-r from-primary to-orange-400 p-4 rounded-3xl shadow-lg text-white">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium opacity-90">Ciclo Actual</p>
                    <h3 className="text-xl font-bold">{name}</h3>
                </div>
                <div className="text-right">
                    <p className="text-xs font-medium opacity-90">Faltan</p>
                    <h3 className="text-xl font-bold italic text-white/90">{daysRemaining} Días</h3>
                </div>
            </div>
        </div>
    )
}
