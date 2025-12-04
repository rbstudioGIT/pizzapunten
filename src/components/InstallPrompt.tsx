import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already in standalone mode
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);

        if (isStandaloneMode) return;

        // Handle Android/Desktop install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Handle iOS prompt logic
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent); // Simple check

        // Only show iOS prompt if on iOS Safari and not dismissed before
        if (isIOS && isSafari && !localStorage.getItem('iosPromptDismissed')) {
            setShowIOSPrompt(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const dismissIOSPrompt = () => {
        setShowIOSPrompt(false);
        localStorage.setItem('iosPromptDismissed', 'true');
    };

    if (isStandalone) return null;

    return (
        <>
            <AnimatePresence>
                {deferredPrompt && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-8 md:w-auto"
                    >
                        <Button
                            onClick={handleInstallClick}
                            className="w-full md:w-auto shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Installeer App
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showIOSPrompt && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900/95 backdrop-blur border-t border-slate-700 shadow-2xl"
                    >
                        <div className="container mx-auto max-w-md flex items-start justify-between gap-4">
                            <div className="text-sm text-slate-200">
                                <p className="font-bold mb-1">Installeer Pizzapunten</p>
                                <p>Tik op <span className="inline-block px-1 bg-slate-800 rounded border border-slate-600">Deel</span> en kies <span className="font-bold">"Zet op beginscherm"</span> om de app te installeren.</p>
                            </div>
                            <button onClick={dismissIOSPrompt} className="text-slate-400 hover:text-white p-1">
                                &times;
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
