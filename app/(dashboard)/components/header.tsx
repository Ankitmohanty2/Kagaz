"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { Crown } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const header = ({ name }: { name: string }) => {
  const { user } = useUser();

  const createUser = useMutation(api.user.createUser);
  useEffect(() => {
    user && checkUser();
  }, [user]);

  const checkUser = async () => {
    const result = await createUser({
      email: user?.primaryEmailAddress?.emailAddress as string,
      userName: (user?.firstName || user?.lastName || "User") as string,
      imageUrl: (user?.imageUrl || "") as string,
    });
    console.log(result);
  };

  const getUser = useQuery(api.user.getUser, {
    email: user?.primaryEmailAddress?.emailAddress as string,
  });

  return (
    <header className="h-16 bg-background border-b border-border px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-foreground">{name}</h1>
          {name !== "Upgrade" && (
            <p className="text-xs text-muted-foreground">Manage your documents</p>
          )}
        </div>
        <div className="lg:hidden">
          <h1 className="text-lg font-semibold text-foreground ml-12">{name}</h1>
        </div>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-foreground">
            {user?.firstName}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {getUser && getUser?.upgrade == true ? (
              <>
                <Crown size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-amber-600 font-semibold">Pro Plan</span>
              </>
            ) : (
              "Free plan"
            )}
          </p>
        </div>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatar: "w-12 h-12", // Tailwind classes
              userButtonTrigger: "p-2",
            },
          }}
        />
      </div>
    </header>
  );
};

export default header;
