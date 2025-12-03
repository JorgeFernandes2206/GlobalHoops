<?php

namespace App\Http\Controllers;

use App\Models\Topic;
use App\Models\Comment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TopicController extends Controller
{
    public function index(Request $request)
    {
        $query = Topic::query();

        if ($category = $request->get('category')) {
            $query->where('category', $category);
        }

        $topics = $query->withCount([
            'comments' => function ($query) {
                $query->where('commentable_type', 'Topic');
            }
        ])
        ->orderBy('is_pinned', 'desc')
        ->latest()
        ->paginate(20);

        // Add latest comment info to each topic
        $topics->getCollection()->transform(function ($topic) {
            $latestComment = $topic->latestComment();
            $topic->latest_comment = $latestComment ? [
                'user' => $latestComment->user,
                'created_at' => $latestComment->created_at,
            ] : null;
            return $topic;
        });

        return Inertia::render('Forum/Index', [
            'topics' => $topics,
            'category' => $category,
        ]);
    }

    public function show($id)
    {
        $topic = Topic::findOrFail($id);
        
        // Increment views
        $topic->incrementViews();

        // Get comments with limited nesting
        $comments = Comment::where('commentable_type', 'Topic')
            ->where('commentable_id', $id)
            ->whereNull('parent_id')
            ->with(['replies.user', 'replies.replies.user'])
            ->latest()
            ->get();

        return Inertia::render('Forum/Show', [
            'topic' => $topic,
            'comments' => $comments,
        ]);
    }

    public function create()
    {
        return Inertia::render('Forum/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|min:10',
            'category' => 'nullable|string|in:general,nba,euroleague,transfer,other',
        ]);

        $topic = Topic::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category' => $validated['category'] ?? 'general',
        ]);

        return redirect()->route('forum.show', $topic->id);
    }

    public function destroy($id)
    {
        $topic = Topic::findOrFail($id);

        if ($topic->user_id !== auth()->id()) {
            abort(403);
        }

        $topic->delete();

        return redirect()->route('forum.index');
    }
}
