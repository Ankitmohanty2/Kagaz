import { Undo2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Editor } from "@tiptap/react";

export const WorkspaceHeader = ({
  fileName,
  editor,
}: {
  fileName: string;
  editor: Editor | null;
}) => {
  const router = useRouter();
  const { fileId } = useParams();
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const saveNote = useMutation(api.notes.saveNote);

  const HandleSave = async () => {
    setLoading(true);
    await saveNote({
      fileId: fileId as string,
      note: editor?.getHTML() as string,
      createBy: user?.primaryEmailAddress?.emailAddress as string,
    });
    setLoading(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Undo2
            size={20}
            onClick={handleBack}
            className="bg-muted hover:bg-muted/80 text-foreground w-9 h-9 p-2.5 rounded-full cursor-pointer transition-all active:scale-95 border border-border/50 shadow-sm"
          />
          <h1 className="text-lg font-bold tracking-tight text-foreground hidden sm:block">Workspace</h1>
        </div>
      </div>

      <div className="font-bold text-foreground uppercase tracking-widest text-xs bg-muted/50 px-3 py-1.5 rounded-lg border border-border items-center gap-2 hidden md:flex">
        <span className="w-2 h-2 rounded-full bg-[#d8b131] animate-pulse" />
        {fileName}
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button
          onClick={HandleSave}
          disabled={loading}
          className="bg-[#d8b131] hover:bg-[#c49e2b] text-white font-bold shadow-lg shadow-amber-500/20 px-6 transition-all active:scale-95"
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatar: "w-10 h-10 border-2 border-border shadow-sm",
              userButtonTrigger: "hover:scale-105 transition-transform",
            },
          }}
        />
      </div>
    </header>
  );
};
