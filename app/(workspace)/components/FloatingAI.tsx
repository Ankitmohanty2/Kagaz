"use client";

import { useState } from "react";
import { Sparkle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export const FloatingAI = ({ fileId }: { fileId: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
        { role: 'bot', content: 'Hello! I am your AI assistant. Ask me anything about this document.' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const chatAction = useAction(api.chat.chat);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await chatAction({
                query: userMessage,
                fileId: fileId
            });
            setMessages(prev => [...prev, { role: 'bot', content: response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I encountered an error. Please check your API key and try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4"
                    >
                        <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl border-stone-200 overflow-hidden bg-white/95 backdrop-blur-md">
                            <div className="p-4 border-b bg-stone-50 flex justify-between items-center">
                                <div className="flex items-center gap-2 font-semibold text-stone-700">
                                    <Sparkle className="w-4 h-4 text-amber-500" />
                                    AI Assistant
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-stone-400">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-stone-200">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-stone-100 text-stone-800 rounded-bl-none'
                                            }`}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-stone-100 p-3 rounded-2xl rounded-bl-none">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                                                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t bg-stone-50/50">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        placeholder="Ask a question..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="flex-1 bg-white border-stone-200 focus-visible:ring-blue-500"
                                    />
                                    <Button type="submit" disabled={loading} size="icon" className="bg-blue-600 hover:bg-blue-700">
                                        <Send className="w-4 h-4 text-white" />
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-stone-800 rotate-90' : 'bg-[#d8b131] hover:scale-110'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6 text-white" /> : <Sparkle className="w-6 h-6 text-white" />}
            </Button>
        </div>
    );
};
