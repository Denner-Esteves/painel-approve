'use client'

import { useState } from "react"
import { verifyTaskPassword } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Lock, User } from "lucide-react"
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
                    <CardDescription>Para acessar, identifique-se e insira a senha.</CardDescription>
                </CardHeader>
                <form action={handleSubmit}>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Seu Nome
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        placeholder="Ex: Ana Silva"
                                        required
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Senha de Acesso
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="Digite a senha"
                                        required
                                        className="pl-9 text-lg tracking-widest"
                                    />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
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
