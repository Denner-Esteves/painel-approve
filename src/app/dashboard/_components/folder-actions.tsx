'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FolderPlus } from "lucide-react"
import { FolderCreationDialog } from "@/components/folder-creation-dialog"

interface FolderActionsProps {
    clientId: string
    currentYear?: number
}

export function FolderActions({ clientId, currentYear }: FolderActionsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <>
            <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] uppercase font-bold tracking-wider rounded-lg gap-1.5"
                onClick={() => setIsDialogOpen(true)}
            >
                <FolderPlus className="h-3 w-3" />
                {currentYear ? "Novo Mês" : "Novo Ano"}
            </Button>

            <FolderCreationDialog
                clientId={clientId}
                currentYear={currentYear}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </>
    )
}
