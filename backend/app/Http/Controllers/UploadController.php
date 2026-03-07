<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\StudentUpload;
use App\Services\AIService;
use App\Services\AIQuotaService;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function __construct(
        private AIService $ai,
        private AnalyticsService $analytics,
        private AIQuotaService $quota
    ) {}

    // POST /api/uploads  — upload image and analyze with AI
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
            'type' => 'required|in:exam,quiz,assignment,report_card',
            'subject_id' => 'nullable|exists:subjects,id',
        ]);

        $user = $request->user();

        // ── AI Quota Check ────────────────────────────────────────────────────
        $quotaCheck = $this->quota->check($user);
        if (!$quotaCheck['allowed']) {
            return response()->json([
                'error'       => 'quota_exceeded',
                'message'     => $quotaCheck['message'],
                'quota'       => $this->quota->status($user),
                'upgrade_url' => '/upgrade',
            ], 402);
        }
        // ─────────────────────────────────────────────────────────────────────

        $file = $request->file('file');

        // Store file
        $path = $file->store("uploads/{$user->id}", 'public');
        $url = Storage::url($path);

        // Create upload record (pending)
        $upload = StudentUpload::create([
            'user_id' => $user->id,
            'subject_id' => $request->subject_id,
            'type' => $request->type,
            'file_url' => $url,
            'file_name' => $path,
            'original_name' => $file->getClientOriginalName(),
            'status' => 'processing',
        ]);

        // Notify student
        Notification::create([
            'user_id' => $user->id,
            'type' => 'upload_processing',
            'title' => 'Analyzing your upload...',
            'message' => "We're reading your {$request->type}. This usually takes 10-30 seconds.",
            'icon' => '🔍',
            'link' => "/uploads/{$upload->id}",
        ]);

        // Run AI analysis synchronously (use queue job in production)
        try {
            $mimeType = $file->getMimeType();
            $base64 = base64_encode(file_get_contents($file->getRealPath()));

            $result = $this->ai->analyzeUpload($base64, $mimeType, $request->type);

            // Determine subject if not provided
            $subjectId = $upload->subject_id;
            if (!$subjectId && !empty($result['subject'])) {
                $subject = \App\Models\Subject::where('name', 'like', '%' . $result['subject'] . '%')->first();
                $subjectId = $subject?->id;
            }

            $upload->update([
                'status' => 'done',
                'subject_id' => $subjectId,
                'ai_result' => $result,
                'extracted_score' => $result['score'] ?? null,
                'extracted_total' => $result['total_possible'] ?? null,
                'extracted_subject' => $result['subject'] ?? null,
                'extracted_quarter' => $result['quarter'] ?? null,
                'weak_topics' => $result['weak_topics'] ?? [],
                'ai_summary' => $result['ai_summary'] ?? null,
            ]);

            // Update mastery from weak topics
            if ($subjectId && !empty($result['weak_topics'])) {
                $this->analytics->updateMasteryFromUpload($user->id, $result['weak_topics'], $subjectId);
            }

            // ── Consume one AI action ─────────────────────────────────────────
            $this->quota->consume($user, 'upload', 2500, 800);
            // ─────────────────────────────────────────────────────────────────

            // Regenerate analytics snapshot
            $snapshot = $this->analytics->generateSnapshot($user->id);

            // Success notification
            Notification::where('user_id', $user->id)->where('type', 'upload_processing')->latest()->first()?->delete();
            Notification::create([
                'user_id' => $user->id,
                'type' => 'upload_done',
                'title' => 'Upload analyzed! ✅',
                'message' => $result['ai_summary'] ?? "Your {$request->type} has been analyzed. Check your dashboard for insights.",
                'icon' => '✅',
                'link' => "/uploads/{$upload->id}",
            ]);

        } catch (\Exception $e) {
            $upload->update(['status' => 'failed']);
            Notification::create([
                'user_id' => $user->id,
                'type' => 'upload_failed',
                'title' => 'Upload analysis failed',
                'message' => 'We could not analyze your file. Please try again with a clearer image.',
                'icon' => '❌',
                'link' => '/uploads',
            ]);
        }

        return response()->json([
            'upload'  => $upload->fresh(),
            'message' => 'Upload processed successfully',
            'quota'   => $this->quota->status($user),
        ]);
    }

    // GET /api/uploads
    public function index(Request $request)
    {
        $uploads = StudentUpload::with('subject')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($uploads);
    }

    // GET /api/uploads/{id}
    public function show(Request $request, $id)
    {
        $upload = StudentUpload::with('subject')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($upload);
    }

    // DELETE /api/uploads/{id}
    public function destroy(Request $request, $id)
    {
        $upload = StudentUpload::where('user_id', $request->user()->id)->findOrFail($id);
        if ($upload->file_name) Storage::disk('public')->delete($upload->file_name);
        $upload->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
