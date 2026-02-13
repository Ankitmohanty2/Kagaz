'use client'
import { EditorExtension } from './Editor-extension'
import { useEditor, EditorContent } from '@tiptap/react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { Editor } from '@tiptap/react'

interface EditorExtensionProps {
    editor: Editor | null
}

export const TextEditor = ({ editor }: EditorExtensionProps) => {

    const { fileId } = useParams();
    const getNotes = useQuery(api.notes.getNotes, fileId ? { fileId: fileId as string } : "skip");



    useEffect(() => {
        if (getNotes) {
            editor && editor.commands.setContent(getNotes[0]?.note);
        }
    }, [getNotes && editor])

    if (!editor) {
        return null
    }

    return (
        <div className='border border-border rounded-2xl bg-card shadow-2xl overflow-hidden flex flex-col h-full transition-all duration-300'>
            {/* Toolbar Container */}
            <div className="shrink-0 z-10 sticky top-0 bg-card/50 backdrop-blur-xl border-b border-border/50">
                <EditorExtension editor={editor} />
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-card/30 p-4 sm:p-12">
                <div className="max-w-4xl mx-auto">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    )
}