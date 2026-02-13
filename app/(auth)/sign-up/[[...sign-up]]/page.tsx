import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return <div className="flex h-screen items-center justify-center bg-background/50 dark:bg-slate-950/20 backdrop-blur-3xl"><SignUp /></div>
}