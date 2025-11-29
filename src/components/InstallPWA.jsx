import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = (evt) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <button
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-cyan-400 hover:bg-cyan-950/30 rounded-xl transition-all group border border-transparent hover:border-cyan-500/20"
            onClick={onClick}
        >
            <Download size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">Instalar App</span>
        </button>
    );
};

export default InstallPWA;
