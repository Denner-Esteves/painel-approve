'use client'

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function CopyPasswordButton({ password }: { password: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(password)
        setCopied(true)
        toast.success("Senha copiada!")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button variant="outline" size="sm" className="h-8 text-xs gap-2" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {password}
        </Button>
    )
}
