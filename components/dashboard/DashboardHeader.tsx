import { Bell } from 'lucide-react'

type HeaderProps = {
    name: string
    level: string
    avatarUrl: string
}

export function DashboardHeader({ name, level, avatarUrl }: HeaderProps) {
    return (
        <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <img
                            alt={`Foto de perfil de ${name}`}
                            className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow-sm"
                            src={avatarUrl}
                        />
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">¡Hola, {name.split(' ')[0]}!</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Nivel: {level}</p>
                    </div>
                </div>
                <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
                    <Bell className="w-6 h-6" />
                </button>
            </div>
        </header>
    )
}
