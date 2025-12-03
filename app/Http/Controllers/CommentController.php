<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Store a new comment
     */
    public function store(Request $request)
    {
        \Log::info('Comment store request received', [
            'user_id' => Auth::id(),
            'data' => $request->all(),
        ]);

        $validated = $request->validate([
            'commentable_type' => 'required|string',
            'commentable_id' => 'required|string',
            'parent_id' => 'nullable|exists:comments,id',
            'content' => 'required|string|min:1|max:5000',
        ]);

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'commentable_type' => $validated['commentable_type'],
            'commentable_id' => $validated['commentable_id'],
            'parent_id' => $validated['parent_id'] ?? null,
            'content' => $validated['content'],
        ]);

        \Log::info('Comment created successfully', [
            'comment_id' => $comment->id,
        ]);

        return back()->with('success', 'Comment posted successfully!');
    }

    /**
     * Delete a comment
     */
    public function destroy(Comment $comment)
    {
        // Check if user can delete
        if (!$comment->canDelete(Auth::user())) {
            return back()->with('error', 'You can only delete your own comments.');
        }

        $comment->delete();

        return back()->with('success', 'Comment deleted successfully!');
    }

    /**
     * Get comments for a specific item (API endpoint)
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'commentable_type' => 'required|string',
            'commentable_id' => 'required|string',
        ]);

        $comments = Comment::where('commentable_type', $validated['commentable_type'])
            ->where('commentable_id', $validated['commentable_id'])
            ->topLevel()
            ->latest()
            ->get();

        return response()->json($comments);
    }
}
