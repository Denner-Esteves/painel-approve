'use client'

import { useState } from "react"
import { verifyTaskPassword } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PasswordForm({ taskId }: { taskId: string }) {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError("")

        const result = await verifyTaskPassword(taskId, formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            // Success - refresh to show the actual content
            router.refresh()
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Conteúdo Protegido</CardTitle>
                    <CardDescription>Por favor, insira a senha para visualizar esta tarefa.</CardDescription>
                </CardHeader>
                <form action={handleSubmit}>
                    <CardContent>
                        <div className="space-y-4">
                            <Input
                                type="password"
                                name="password"
                                placeholder="Digite a senha"
                                required
                                className="text-center text-lg tracking-widest"
                            />
                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Verificando..." : "Acessar Tarefa"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
