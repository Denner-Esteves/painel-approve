import Link from "next/link"
import { LayoutDashboard, PlusCircle, CheckSquare } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-20 hidden w-16 flex-col border-r bg-white sm:flex shadow-sm">
                <nav className="flex flex-col items-center gap-5 px-2 py-6">
                    <Link
                        href="/dashboard"
                        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 text-lg font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:scale-110 active:scale-95"
                    >
                        <CheckSquare className="h-5 w-5" />
                        <span className="sr-only">Approve</span>
                    </Link>

                    <div className="h-px w-8 bg-slate-100 my-2" />

                    <Link
                        href="/dashboard"
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-50 hover:text-blue-600 group"
                    >
                        <LayoutDashboard className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="sr-only">Dashboard</span>
                    </Link>
                    <Link
                        href="/dashboard/create"
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-50 hover:text-blue-600 group"
                    >
                        <PlusCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="sr-only">Nova Tarefa</span>
                    </Link>
                </nav>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white/80 backdrop-blur-lg px-4 pb-safe sm:hidden shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
                <Link
                    href="/dashboard"
                    className="flex flex-col items-center justify-center gap-1 text-slate-400 transition-colors hover:text-blue-600"
                >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Início</span>
                </Link>
                <Link
                    href="/dashboard/create"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 -mt-8 transition-transform active:scale-90"
                >
                    <PlusCircle className="h-6 w-6" />
                    <span className="sr-only">Novo</span>
                </Link>
                <Link
                    href="/dashboard"
                    className="flex flex-col items-center justify-center gap-1 text-slate-400 transition-colors hover:text-blue-600"
                >
                    <CheckSquare className="h-5 w-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tarefas</span>
                </Link>
            </nav>

            <div className="flex flex-col sm:pl-16 pb-20 sm:pb-0">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/50 backdrop-blur-md px-6 sm:h-20 sm:border-0 sm:bg-transparent">
                    <div className="flex items-center gap-2 sm:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <CheckSquare className="h-4 w-4" />
                        </div>
                    </div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight sm:text-2xl">Agência <span className="text-blue-600 italic">Approve</span></h1>
                </header>
                <main className="flex-1 p-4 sm:p-8">
                    <div className="w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
