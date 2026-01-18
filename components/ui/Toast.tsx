import React, { useEffect } from 'react';
import { CheckCircleIcon, InformationCircleIcon } from '../icons';

export type ToastType = 'success' | 'info' | 'error';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 3000);

        return () => clearTimeout(timer);
    }, [id, onClose]);

    const bgMap = {
        success: 'bg-green-500/10 border-green-500/20 text-green-200',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-200',
        error: 'bg-red-500/10 border-red-500/20 text-red-200',
    };

    const iconMap = {
        success: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
        info: <InformationCircleIcon className="w-5 h-5 text-blue-400" />,
        error: <InformationCircleIcon className="w-5 h-5 text-red-400" />,
    };

    return (
        <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg mb-3 animate-fade-in-up transition-all ${bgMap[type]}`}>
            {iconMap[type]}
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
};

export default Toast;
