<?php

namespace App\Http\Controllers;

use App\Models\UserFavorite;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FavoriteController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:team,player',
            'id' => 'required|integer',
            'name' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        $favorite = UserFavorite::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'favoritable_type' => $validated['type'],
                'favoritable_id' => $validated['id'],
            ],
            [
                'favoritable_name' => $validated['name'],
                'metadata' => $validated['metadata'] ?? null,
            ]
        );

        return response()->json($favorite, 201);
    }

    public function destroy(string $type, int $id): JsonResponse
    {
        UserFavorite::where('user_id', auth()->id())
            ->where('favoritable_type', $type)
            ->where('favoritable_id', $id)
            ->delete();

        return response()->json(['message' => 'Favorite removed']);
    }

    public function index(): JsonResponse
    {
        $favorites = UserFavorite::where('user_id', auth()->id())
            ->get()
            ->groupBy('favoritable_type');

        return response()->json($favorites);
    }
}
