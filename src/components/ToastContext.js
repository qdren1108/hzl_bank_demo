import React, { createContext, useContext, useState, useEffect } from 'react';
import Toast from './Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info', key: 0 });

    useEffect(() => {
        console.log('toast state:', toast);
    }, [toast]);

    const showToast = (message, type = 'info', duration = 5000) => {
        const newKey = Date.now();

        // 先关闭之前的 toast（如果有）
        setToast(prev => ({ ...prev, visible: false }));

        // 短暂延迟后显示新的 toast
        setTimeout(() => {
            setToast({ visible: true, message, type, key: newKey });

            // 自动关闭
            setTimeout(() => {
                setToast(prev => {
                    // 只有当key匹配时才关闭，避免关闭错误的toast
                    if (prev.key === newKey) {
                        return { ...prev, visible: false };
                    }
                    return prev;
                });
            }, duration);
        }, 100);
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <Toast
                key={toast.key}
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}; 