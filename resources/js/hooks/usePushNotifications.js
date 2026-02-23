import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Verificar se o browser suporta notificações
        console.log('🔍 Checking push notification support...');
        console.log('serviceWorker in navigator:', 'serviceWorker' in navigator);
        console.log('PushManager in window:', 'PushManager' in window);

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            console.log('✅ Push notifications are supported!');
            setIsSupported(true);
            checkSubscription();
        } else {
            console.log('❌ Push notifications are NOT supported');
        }
    }, []);

    const checkSubscription = async () => {
        try {
            console.log('🔍 Checking existing subscription...');
            const registration = await navigator.serviceWorker.ready;
            console.log('✅ Service worker is ready:', registration);

            const sub = await registration.pushManager.getSubscription();
            console.log('Current subscription:', sub);

            setSubscription(sub);
            setIsSubscribed(!!sub);
        } catch (error) {
            console.error('❌ Error checking subscription:', error);
        }
    };

    const subscribe = async () => {
        if (!isSupported) {
            alert('O teu browser não suporta notificações push');
            return false;
        }

        setIsLoading(true);

        try {
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                alert('Precisas de permitir notificações para receber updates');
                setIsLoading(false);
                return false;
            }

            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const response = await fetch('/push/vapid-public-key');
            const { publicKey } = await response.json();

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

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
