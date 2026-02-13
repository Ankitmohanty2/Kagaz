'use client'

import { useState, useRef, useEffect } from 'react'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Send, Bot, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Message {
    role: 'user' | 'bot'
    content: string
}

export const ChatPanel = ({ fileId }: { fileId: string }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', content: 'Hello! I am your AI assistant. Ask me anything about this document.' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const chatAction = useAction(api.chat.chat)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        try {
            const response = await chatAction({
                query: userMessage,
                fileId: fileId
            })

            setMessages(prev => [...prev, { role: 'bot', content: response }])
        } catch (error) {
            console.error("Chat error:", error)
            setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I encountered an error while processing your request. Please check your API key." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="flex flex-col h-full border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="p-4 border-b bg-slate-50/50">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-500" /> AI Assistant
                </h2>
            </div>

            <div
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                ref={scrollRef}
            >
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`p-2 rounded-lg max-w-[85%] ${msg.role === 'user'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="bg-slate-100 text-slate-800 border border-slate-200 p-2 rounded-lg flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-slate-50/50">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input
                        placeholder="Ask a question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        className="flex-1 bg-white"
                    />
                    <Button type="submit" disabled={loading || !input.trim()} size="icon" className="shrink-0 bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Card>
    )
}
