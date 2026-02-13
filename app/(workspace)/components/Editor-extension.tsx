import { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Sparkle,
} from "lucide-react";

import "@tiptap/extension-highlight";
import "@tiptap/extension-underline";
import "@tiptap/extension-text-align";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface EditorExtensionProps {
  editor: Editor | null;
}

export const EditorExtension = ({ editor }: EditorExtensionProps) => {
  const [isActive, setIsActive] = useState(false);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const SearchAI = useAction(api.myAction.search);
  const addNotes = useMutation(api.notes.saveNote);
  const { fileId } = useParams();

  useEffect(() => {
    if (!editor) return;

    const updateActiveState = () => {
      setIsActive((prev) => !prev);
    };

    editor.on("update", updateActiveState);
    editor.on("selectionUpdate", updateActiveState);

    return () => {
      editor.off("update", updateActiveState);
      editor.off("selectionUpdate", updateActiveState);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const onAiClick = async () => {
    setLoading(true);

    let selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );

    // If no text is selected, check the current line
    if (!selectedText.trim()) {
      const { $from } = editor.state.selection;
      const currentParagraph = $from.parent.textContent;

      if (currentParagraph.trim()) {
        selectedText = currentParagraph;
        // console.log("No selection, using current paragraph:", selectedText);
      } else {
        // If the line is empty and no selection, don't generate anything
        setLoading(false);
        alert("Please write a question or select some text for the AI to analyze.");
        return;
      }
    }

    // console.log("Selected text:", selectedText);
    // console.log("File ID:", fileId);

    try {
      // Get context from your vector search
      const result = await SearchAI({
        query: selectedText,
        fileId: fileId as string,
      });

      // console.log("Search result:", result);

      const PROMPT = `
You are a helpful AI assistant.

USER QUESTION:
${selectedText}

RETRIEVED CONTEXT (may be incomplete):
${result}

TASK:
Use the retrieved context as the primary source to answer the question.  
If the context is unclear, incomplete, or empty, use your general knowledge to provide a helpful and reasonable explanation.

STYLE GUIDELINES:
- Explain in simple, short and easy-to-understand language.
- Be clear, structured, and beginner-friendly.
- Do not mention "context" or "retrieved data" in the answer.
- Do not leave large space between the answer and key points.
- Focus on giving value, not disclaimers.

OUTPUT FORMAT (HTML ONLY):
<h2>Answer</h2>
<p>Main explanation here.</p>
<h3>Key Points</h3>
<ul>
  <li>Important point</li>
  <li>Another helpful point</li>
</ul>
`;

      // Insert initial placeholder at the end of the document for safety
      const insertPos = editor.state.doc.content.size;
      editor.chain()
        .focus()
        .insertContentAt(insertPos, '<p id="ai-response-block"><em>Thinking...</em></p>')
        .run();

      // Find the exact position of our new block
      let answerStartPos = insertPos;
      editor.state.doc.descendants((node, pos) => {
        if (node.attrs?.id === 'ai-response-block') {
          answerStartPos = pos;
          return false;
        }
      });

      let streamedAnswer = "";
      // console.log("Calling streaming API...");

      const response = await fetch("/api/ai-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: PROMPT }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let thinkingRemoved = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            streamedAnswer += parsed.text;

            const cleanedAnswer = streamedAnswer
              .replace(/```html/g, "")
              .replace(/```/g, "");

            // Attempt to update the editor. If partial HTML causes a RangeError, 
            // we'll just wait for the next chunk which might close the tag.
            try {
              const currentDocSize = editor.state.doc.content.size;
              editor.chain()
                .deleteRange({ from: answerStartPos, to: currentDocSize })
                .insertContentAt(answerStartPos, cleanedAnswer)
                .run();
              thinkingRemoved = true;
            } catch (innerError) {
              // Ignore partial HTML errors during stream
              console.warn("Partial HTML skip:", innerError);
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      }

      // console.log("Final streamed answer:", streamedAnswer);

      // Save to database
      const Allnote = editor.getHTML();
      await addNotes({
        fileId: fileId as string,
        note: Allnote,
        createBy: user?.primaryEmailAddress?.emailAddress as string,
      });

      // console.log("Streaming completed successfully");
    } catch (error) {
      console.error("Error during AI streaming:", error);
      alert("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* AI Action Button */}
        <button
          onClick={onAiClick}
          disabled={loading}
          className="flex items-center justify-center p-3 bg-[#d8b131] hover:bg-[#c49e2b] text-white rounded-2xl shadow-[0_8px_20px_rgba(216,177,49,0.3)] transition-all active:scale-95 border border-white/10 group"
          title="AI Assistant"
        >
          <Sparkle className={`w-5 h-5 ${loading ? "animate-spin" : "group-hover:rotate-12 transition-all duration-300"}`} />
        </button>

        {/* Action Group Container */}
        <div className="flex items-center gap-1.5 p-1.5 bg-muted/30 dark:bg-muted/10 rounded-2xl border border-border/50 shadow-inner">
          {/* Headings */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive("heading", { level: 1 })
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive("heading", { level: 2 })
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive("heading", { level: 3 })
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border/40 mx-1" />

          {/* Formatting */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive("bold")
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive("italic")
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive("underline")
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive("highlight")
                ? "bg-[#d8b131] text-white shadow-lg scale-105 shadow-amber-500/20"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border/40 mx-1" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive({ textAlign: "left" })
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive({ textAlign: "center" })
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive({ textAlign: "right" })
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border/40 mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive("bulletList")
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2.5 rounded-xl transition-all duration-300 ${editor.isActive("orderedList")
                ? "bg-foreground text-background shadow-lg scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              title="Ordered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
