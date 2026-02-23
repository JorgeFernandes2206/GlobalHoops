<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function subscribe(Request $request)
    {
        \Log::info('Push subscribe request received', [
            'user_id' => auth()->id(),
            'data' => $request->all()
        ]);

        $request->validate([
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|string',
            'subscription.keys' => 'required|array',
        ]);

        $user = auth()->user();
        $subscriptionData = $request->input('subscription');

        \Log::info('Creating/updating subscription', [
            'user_id' => $user->id,
            'endpoint' => $subscriptionData['endpoint']
        ]);

        // Verificar se já existe
        $existing = PushSubscription::where('endpoint', $subscriptionData['endpoint'])->first();

        if ($existing) {
            // Atualizar se for do mesmo user
            if ($existing->user_id === $user->id) {
                $existing->update([
                    'subscription' => json_encode($subscriptionData),
                ]);
                \Log::info('✅ Subscription updated');
                return response()->json(['message' => 'Subscription updated']);
            }

            \Log::warning('⚠️ Subscription already exists for another user');
            return response()->json(['message' => 'Subscription already exists']);
        }

        // Criar nova subscription
        $created = PushSubscription::create([
            'user_id' => $user->id,
            'subscription' => json_encode($subscriptionData),
            'endpoint' => $subscriptionData['endpoint'],
        ]);

        \Log::info('Subscription created successfully', ['id' => $created->id]);

        return response()->json(['message' => 'Subscription created successfully']);
    }

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

    public function vapidPublicKey()
    {
        return response()->json([
            'publicKey' => config('services.vapid.public_key'),
        ]);
    }
}
