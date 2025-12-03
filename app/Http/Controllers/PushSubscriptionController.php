<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    /**
     * Subscribe to push notifications
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|string',
            'subscription.keys' => 'required|array',
        ]);

        $user = auth()->user();
        $subscriptionData = $request->input('subscription');

        // Verificar se já existe
        $existing = PushSubscription::where('endpoint', $subscriptionData['endpoint'])->first();

        if ($existing) {
            // Atualizar se for do mesmo user
            if ($existing->user_id === $user->id) {
                $existing->update([
                    'subscription' => json_encode($subscriptionData),
                ]);
                return response()->json(['message' => 'Subscription updated']);
            }

            return response()->json(['message' => 'Subscription already exists']);
        }

        // Criar nova subscription
        PushSubscription::create([
            'user_id' => $user->id,
            'subscription' => json_encode($subscriptionData),
            'endpoint' => $subscriptionData['endpoint'],
        ]);

        return response()->json(['message' => 'Subscription created successfully']);
    }

    /**
     * Unsubscribe from push notifications
     */
    public function unsubscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|string',
        ]);

        PushSubscription::where('endpoint', $request->endpoint)
            ->where('user_id', auth()->id())
            ->delete();

        return response()->json(['message' => 'Unsubscribed successfully']);
    }

    /**
     * Get VAPID public key for frontend
     */
    public function vapidPublicKey()
    {
        return response()->json([
            'publicKey' => config('services.vapid.public_key'),
        ]);
    }
}
