'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { getCalendarTasks } from "@/app/actions"
import { PlatformIcon } from "@/components/platform-icon"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Task {
    id: string
    title: string
    scheduled_date: string
    status: string
    client_name: string
    type: string
    platform: string
}

export default function CalendarPage() {
    const router = useRouter()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [selectedDayTasks, setSelectedDayTasks] = useState<{ date: string, tasks: Task[] } | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

    const handleOpenDialog = (dateStr: string, tasks: Task[]) => {
        setSelectedDayTasks({ date: dateStr, tasks })
        setIsDialogOpen(true)
    }

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true)
            // Get first and last day of current month for query
            // Adjust to get previous/next month overlap if needed, but strict month is fine for now
            const startStr = new Date(year, month, 1).toISOString().split('T')[0]
            const endStr = new Date(year, month + 1, 0).toISOString().split('T')[0]

            const data = await getCalendarTasks(startStr, endStr)
            setTasks(data || [])
            setIsLoading(false)
        }
        fetchTasks()
    }, [year, month])

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const handleToday = () => {
        setCurrentDate(new Date())
    }

    // Generate calendar grid
    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
    }

    return (
        <div className="w-full h-[calc(100vh-theme(spacing.24))] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                        Calendário Editorial
                    </h1>
                    <p className="text-slate-500 font-medium">Visualize e planeje suas postagens.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handlePrevMonth} size="icon" className="rounded-xl">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-[180px] text-center font-bold text-lg capitalize">
                        {monthName}
                    </div>
                    <Button variant="outline" onClick={handleNextMonth} size="icon" className="rounded-xl">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={handleToday} className="rounded-xl text-sm font-bold ml-2">
                        Hoje
                    </Button>
                    <Link href="/dashboard/create">
                        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold ml-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Post
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="flex-1 border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden flex flex-col min-h-0 bg-white">
                <div className="flex-1 overflow-auto">
                    <div className="min-w-[800px] lg:min-w-0 h-full flex flex-col">
                        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                <div key={day} className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 flex-1 bg-white auto-rows-fr">
                            {days.map((day, index) => {
                                if (day === null) {
                                    return <div key={`empty-${index}`} className="border-b border-r border-slate-50 min-h-[120px] p-2 bg-slate-50/10" />
                                }

                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                const dayTasks = tasks.filter(t => t.scheduled_date === dateStr)
                                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

                                const visibleTasks = dayTasks.slice(0, 2)
                                const hiddenCount = dayTasks.length - 2

                                const handleDayClick = () => {
                                    router.push(`/dashboard/create?date=${dateStr}`)
                                }

                                return (
                                    <div
                                        key={`day-${day}`}
                                        onClick={handleDayClick}
                                        className={`
                                            border-b border-r border-slate-50 min-h-[120px] p-2 transition-colors hover:bg-slate-50/50 group relative cursor-pointer
                                            ${isToday ? 'bg-blue-50/30' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-sm font-bold ${isToday ? 'bg-blue-600 text-white h-6 w-6 rounded-full flex items-center justify-center shadow-md shadow-blue-200' : 'text-slate-400'}`}>
                                                {day}
                                            </span>
                                            {dayTasks.length > 0 && <span className="text-[9px] font-bold text-slate-300">{dayTasks.length} Posts</span>}

                                            {/* Hover Add Icon */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition-opacity bg-blue-100 text-blue-600 rounded-full p-1">
                                                <Plus className="h-3 w-3" />
                                            </div>
                                        </div>

                                        <div className="space-y-1 mt-2">
                                            {isLoading ? (
                                                <div className="h-12 w-full bg-slate-50 animate-pulse rounded-lg" />
                                            ) : (
                                                <>
                                                    {visibleTasks.map(task => (
                                                        <div key={task.id} onClick={(e) => e.stopPropagation()}>
                                                            <Link href={`/approve/${task.id}`} className="block">
                                                                <div className={`
                                                                    p-1.5 rounded-lg text-[10px] font-medium border transition-all hover:scale-[1.02] active:scale-95 shadow-sm truncate
                                                                    ${task.status === 'APROVADA' || task.status === 'approved'
                                                                        ? 'bg-green-50 border-green-100 text-green-700 hover:border-green-300'
                                                                        : task.status === 'REJEITADA' || task.status === 'rejected'
                                                                            ? 'bg-red-50 border-red-100 text-red-700 hover:border-red-300'
                                                                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                                                                    }
                                                                `}>
                                                                    <div className="flex items-center gap-1 mb-0.5 opacity-70">
                                                                        <PlatformIcon platform={task.platform as any} className="h-2.5 w-2.5" />
                                                                        <span className="truncate max-w-[60px] text-[8px]">{task.client_name}</span>
                                                                    </div>
                                                                    <p className="truncate font-bold leading-tight">{task.title}</p>
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    ))}
                                                    {hiddenCount > 0 && (
                                                        <div onClick={(e) => { e.stopPropagation(); handleOpenDialog(dateStr, dayTasks); }}>
                                                            <button className="w-full text-[9px] font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 py-1 rounded-lg transition-colors border border-dashed border-slate-200 mt-1">
                                                                + {hiddenCount} mais
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Postagens do Dia {selectedDayTasks ? new Date(selectedDayTasks.date + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 max-h-[60vh] overflow-y-auto pr-2">
                        {selectedDayTasks?.tasks.map(task => (
                            <Link href={`/approve/${task.id}`} key={task.id} className="block">
                                <div className={`
                                    p-3 rounded-xl text-sm font-medium border transition-all hover:scale-[1.01] active:scale-95 shadow-sm
                                    ${task.status === 'APROVADA' || task.status === 'approved'
                                        ? 'bg-green-50 border-green-100 text-green-700 hover:border-green-300'
                                        : task.status === 'REJEITADA' || task.status === 'rejected'
                                            ? 'bg-red-50 border-red-100 text-red-700 hover:border-red-300'
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                                    }
                                `}>
                                    <div className="flex items-center gap-2 mb-1.5 opacity-70">
                                        <PlatformIcon platform={task.platform as any} className="h-4 w-4" />
                                        <span className="font-semibold">{task.client_name}</span>
                                        <span className="text-xs ml-auto opacity-50 uppercase tracking-wider font-bold">{task.status}</span>
                                    </div>
                                    <p className="font-bold leading-tight">{task.title}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
