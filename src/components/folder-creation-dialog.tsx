'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, FolderPlus } from "lucide-react"
import { toast } from "sonner"
import { createManualFolder } from "@/app/dashboard/clients/actions"
import { useRouter } from "next/navigation"

interface FolderCreationDialogProps {
    clientId: string
    currentYear?: number
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function FolderCreationDialog({ clientId, currentYear, open, onOpenChange }: FolderCreationDialogProps) {
    // If currentYear is provided, we are creating a Month in that Year.
    // If not, we are creating a Year.
    const isCreatingMonth = !!currentYear

    const [year, setYear] = useState<string>(currentYear?.toString() || new Date().getFullYear().toString())
    const [month, setMonth] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const yearNum = parseInt(year)
            const monthNum = isCreatingMonth ? parseInt(month) : undefined

            if (isNaN(yearNum)) {
                toast.error("Ano inválido")
                return
            }

            if (isCreatingMonth && (isNaN(monthNum!) || monthNum === undefined)) {
                toast.error("Selecione um mês")
                return
            }

            const result = await createManualFolder(clientId, yearNum, monthNum)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(isCreatingMonth ? "Mês adicionado!" : "Ano adicionado!")
                onOpenChange(false)
                router.refresh()
            }
        } catch (error) {
            toast.error("Erro ao criar pasta")
        } finally {
            setIsLoading(false)
        }
    }

    const months = [
        { value: "0", label: "Janeiro" },
        { value: "1", label: "Fevereiro" },
        { value: "2", label: "Março" },
        { value: "3", label: "Abril" },
        { value: "4", label: "Maio" },
        { value: "5", label: "Junho" },
        { value: "6", label: "Julho" },
        { value: "7", label: "Agosto" },
        { value: "8", label: "Setembro" },
        { value: "9", label: "Outubro" },
        { value: "10", label: "Novembro" },
        { value: "11", label: "Dezembro" },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isCreatingMonth ? "Adicionar Mês" : "Adicionar Ano"}</DialogTitle>
                    <DialogDescription>
                        {isCreatingMonth
                            ? `Adicione uma pasta de mês para o ano de ${currentYear}.`
                            : "Adicione uma nova pasta de ano para organizar tarefas."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {!isCreatingMonth ? (
                            <div className="space-y-2">
                                <Label htmlFor="year">Ano</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    placeholder="2024"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Mês</Label>
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o mês" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map(m => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Pasta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
