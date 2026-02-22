import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Button } from "./ui/button";

export default function StudentLayout({ children }: { children: ReactNode }) {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-background animated-bg text-foreground overflow-x-hidden">
            {/* Header / Top Navigation */}
            <header className="sticky top-0 z-50 w-full glass-subtle border-b border-border/40 px-4 md:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-bold text-primary text-sm">GF</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium hidden sm:inline-block">
                        {user?.name || "Aluno"}
                    </span>
                    <Button variant="ghost" size="icon" onClick={logout} className="rounded-full text-muted-foreground hover:text-foreground">
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Sair</span>
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container max-w-md mx-auto p-4 sm:p-6 sm:max-w-2xl min-h-[calc(100vh-4rem)]">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
