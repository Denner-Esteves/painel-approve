'use client'

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, CheckCircle2, Play, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateImageStatus } from "@/app/actions"
import { Textarea } from "@/components/ui/textarea"

// Helper to extract YouTube ID
const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

type Task = {
    id: string
    title: string
    description: string
    type: string
    client_name: string
    external_url?: string
}

type TaskImage = {
    id: string
    url: string
    status: 'pending' | 'approved' | 'rejected'
    feedback?: string
}

export default function ApprovalCard({ task, images }: { task: Task, images: TaskImage[] }) {
    // If we have an external_url and NO images, we treat the external_url as the single "image" to approve
    const isLinkOnly = task.external_url && images.length === 0
    const [localImages, setLocalImages] = useState<TaskImage[]>(() => {
        if (isLinkOnly && task.external_url) {
            return [{
                id: 'link-only',
                url: task.external_url,
                status: 'pending'
            }]
        }
        return images
    })

    const [currentIndex, setCurrentIndex] = useState(() => {
        const firstPending = localImages.findIndex(img => img.status === 'pending')
        return firstPending >= 0 ? firstPending : 0
    })

    // Reset imageLoaded when currentIndex changes
    useEffect(() => {
        setImageLoaded(false)
    }, [currentIndex])

    const [direction, setDirection] = useState<'left' | 'right' | null>(null)
    const [showReasonModal, setShowReasonModal] = useState(false)
    const [reason, setReason] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showVideoModal, setShowVideoModal] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    // Derived state for current image
    const currentImage = localImages[currentIndex]
    const isCompleted = localImages.every(img => img.status !== 'pending')

    const videoId = currentImage ? (task.type === 'video' ? getYouTubeVideoId(currentImage.url) : null) : null

    const handleSwipe = (dir: 'left' | 'right') => {
        setDirection(dir)
        if (dir === 'left') {
            setTimeout(() => setShowReasonModal(true), 200)
        } else {
            submitDecision('approved')
        }
    }

    const submitDecision = async (status: 'approved' | 'rejected', feedback?: string) => {
        if (!currentImage) return

        setIsSubmitting(true)

        // Optimistic update
        const updatedImages = [...localImages]
        updatedImages[currentIndex] = { ...updatedImages[currentIndex], status, feedback }
        setLocalImages(updatedImages)

        setTimeout(async () => {
            // Server update
            if (isLinkOnly) {
                // If it's a link-only task, we update the Task status directly
                // (Though updateImageStatus would fail without a valid image ID)
                const { updateTaskStatus } = await import("@/app/actions")
                const taskStatus = status === 'approved' ? 'APROVADA' : 'REJEITADA'
                await updateTaskStatus(task.id, taskStatus)
            } else {
                await updateImageStatus(currentImage.id, status, feedback)
            }

            setIsSubmitting(false)
            setDirection(null)
            setShowReasonModal(false)
            setReason("")

            if (currentIndex < localImages.length) {
                setCurrentIndex(prev => prev + 1)
            }
        }, 300)
    }

    if (isCompleted && !currentImage) {
        const approvedCount = localImages.filter(i => i.status === 'approved').length
        return (
            <div className="flex h-screen flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500 bg-slate-50">
                <div className="rounded-full bg-blue-100 p-6 mb-4 shadow-inner">
                    <CheckCircle2 className="h-12 w-12 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Tudo Pronto!</h1>
                <p className="text-muted-foreground mt-2 mb-8 max-w-xs">{isLinkOnly ? "Sua decisão foi enviada com sucesso." : "Você revisou todas as mídias da tarefa."}</p>
                <div className="flex gap-4 text-sm font-bold">
                    <div className="px-6 py-2.5 bg-green-100 text-green-700 rounded-full border border-green-200">
                        {approvedCount} Aprovada{approvedCount !== 1 ? 's' : ''}
                    </div>
                    {localImages.length - approvedCount > 0 && (
                        <div className="px-6 py-2.5 bg-red-100 text-red-700 rounded-full border border-red-200">
                            {localImages.length - approvedCount} Rejeitada{localImages.length - approvedCount !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
                <Button className="mt-8 rounded-full px-8" onClick={() => window.location.reload()}>Revisar Escolhas</Button>
            </div>
        )
    }

    return (
        <div className="flex h-[100dvh] w-full flex-col bg-slate-50 overflow-hidden relative">
            {/* Header */}
            <div className="p-4 text-center z-10 pt-8 shrink-0">
                <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-1">{task.client_name}</h2>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{task.title}</h1>
                <div className="mt-3 inline-block px-4 py-1.5 bg-white rounded-full text-[10px] font-black shadow-sm border border-slate-200 text-slate-400 uppercase tracking-widest">
                    {isLinkOnly ? 'LINK EXTERNO' : `${currentIndex + 1} / ${localImages.length}`}
                </div>
            </div>

            {/* Card Container */}
            <div className="flex-1 flex items-center justify-center p-6 relative min-h-0">
                <AnimatePresence mode="wait">
                    {!direction && currentImage && (
                        <motion.div
                            key={currentImage.id}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.x > 100) handleSwipe('right')
                                else if (info.offset.x < -100) handleSwipe('left')
                            }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 cursor-grab active:cursor-grabbing relative"
                            style={{ height: '65vh', maxHeight: '550px' }}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{
                                x: direction === 'left' ? -500 : 500,
                                opacity: 0,
                                rotate: direction === 'left' ? -25 : 25,
                                scale: 0.5,
                                transition: { duration: 0.3, ease: "easeIn" }
                            }}
                        >
                            {/* Media Content */}
                            <div className="h-full w-full relative bg-slate-950">
                                {isLinkOnly ? (
                                    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                                        <div className="h-24 w-24 rounded-[2rem] bg-blue-50 flex items-center justify-center mb-6 shadow-sm ring-1 ring-blue-100">
                                            {task.type === 'video' ? <Play className="h-10 w-10 text-blue-500 fill-blue-500" /> : <AlertCircle className="h-10 w-10 text-blue-500" />}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Conteúdo Externo</h3>
                                        <p className="text-xs text-slate-500 mb-8 px-4 leading-relaxed line-clamp-2">
                                            Este material é hospedado em {task.type === 'video' ? 'um link de vídeo' : 'uma plataforma externa'}.
                                        </p>

                                        <Button
                                            variant="outline"
                                            className="w-full rounded-2xl h-14 font-bold border-2 hover:bg-slate-100 uppercase tracking-wider text-[11px]"
                                            onClick={() => window.open(currentImage.url, '_blank')}
                                        >
                                            Ver Material Completo
                                        </Button>

                                        <div className="mt-8 text-[11px] font-bold text-slate-400 flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                                            SWIPE PARA AVALIAR
                                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                                        </div>
                                    </div>
                                ) : videoId ? (
                                    <div className="relative h-full w-full group cursor-pointer" onClick={() => setShowVideoModal(true)}>
                                        <img
                                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                            alt={task.title}
                                            className="h-full w-full object-cover pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <div className="bg-white/30 backdrop-blur-md p-5 rounded-full ring-2 ring-white/50 group-hover:scale-110 transition-transform">
                                                <Play className="h-10 w-10 text-white fill-white" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative h-full w-full">
                                        <div className={`absolute inset-0 flex items-center justify-center bg-slate-100 transition-opacity duration-300 ${!imageLoaded ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
                                            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                        </div>
                                        <img
                                            src={currentImage.url}
                                            alt={task.title}
                                            className={`h-full w-full object-cover pointer-events-none select-none transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                            onLoad={() => setImageLoaded(true)}
                                        />
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                                {/* Text Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 text-white pointer-events-none select-none z-20">
                                    <p className="text-[13px] leading-relaxed font-medium line-clamp-4 italic opacity-95">
                                        "{task.description || "Sem descrição adicional para este material."}"
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="p-8 pb-14 flex justify-center gap-10 z-10 shrink-0 select-none">
                <Button
                    size="lg"
                    variant="outline"
                    className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all shadow-xl bg-white z-50 hover:scale-110 active:scale-95"
                    onClick={() => handleSwipe('left')}
                    disabled={isSubmitting || !!direction}
                >
                    <X className="h-8 w-8 stroke-[3]" />
                </Button>

                <Button
                    size="lg"
                    variant="outline"
                    className="h-16 w-16 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-all shadow-xl bg-white z-50 hover:scale-110 active:scale-95"
                    onClick={() => handleSwipe('right')}
                    disabled={isSubmitting || !!direction}
                >
                    <Heart className="h-8 w-8 text-green-500 fill-green-500" />
                </Button>
            </div>

            {/* Feedback Modal */}
            {showReasonModal && (
                <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">O que falta ajustar?</h3>
                        <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                            Seu feedback é essencial para fazermos os ajustes necessários.
                        </p>
                        <Textarea
                            placeholder="Ex: Gostaria de trocar a fonte por uma mais moderna..."
                            className="mb-8 min-h-[120px] rounded-2xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="flex flex-col gap-3">
                            <Button className="w-full h-12 rounded-2xl font-black bg-slate-900 hover:bg-slate-800" onClick={() => submitDecision('rejected', reason)} disabled={!reason.trim() || isSubmitting}>
                                {isSubmitting ? "ENVIANDO..." : "CONFIRMAR AJUSTE"}
                            </Button>
                            <Button variant="ghost" className="w-full h-12 rounded-2xl font-bold text-slate-400" onClick={() => {
                                setShowReasonModal(false)
                                setDirection(null)
                            }}>VOLTAR</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal */}
            {showVideoModal && videoId && (
                <div className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 pb-20 animate-in fade-in duration-300" onClick={() => setShowVideoModal(false)}>
                    <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full h-12 w-12"
                            onClick={() => setShowVideoModal(false)}
                        >
                            <X className="h-7 w-7" />
                        </Button>
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
