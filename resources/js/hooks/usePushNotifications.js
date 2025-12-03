import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Verificar se o browser suporta notificações
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
            setIsSubscribed(!!sub);
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    const subscribe = async () => {
        if (!isSupported) {
            alert('O teu browser não suporta notificações push');
            return false;
        }

        setIsLoading(true);

        try {
            // Pedir permissão
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                alert('Precisas de permitir notificações para receber updates');
                setIsLoading(false);
                return false;
            }

            // Registar service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Obter chave pública VAPID
            const response = await fetch('/push/vapid-public-key');
            const { publicKey } = await response.json();

            // Subscrever ao push
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            // Enviar subscription para o servidor
            await fetch('/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    subscription: sub.toJSON()
                })
            });

            setSubscription(sub);
            setIsSubscribed(true);
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('Erro ao ativar notificações: ' + error.message);
            setIsLoading(false);
            return false;
        }
    };

    const unsubscribe = async () => {
        if (!subscription) return false;

        setIsLoading(true);

        try {
            await fetch('/push/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint
                })
            });

            await subscription.unsubscribe();
            setSubscription(null);
            setIsSubscribed(false);
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Error unsubscribing:', error);
            setIsLoading(false);
            return false;
        }
    };

    return {
        isSupported,
        isSubscribed,
        isLoading,
        subscribe,
        unsubscribe,
    };
}

// Helper function
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
