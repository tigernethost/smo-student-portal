<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    private string $apiKey;
    private string $model = 'claude-opus-4-6';
    private string $baseUrl = 'https://api.anthropic.com/v1/messages';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.key');
    }

    // ── Analyze uploaded exam/assignment/report card image ──────────────
    public function analyzeUpload(string $base64Image, string $mimeType, string $docType): array
    {
        $prompt = $this->buildUploadPrompt($docType);

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->timeout(60)->post($this->baseUrl, [
            'model' => $this->model,
            'max_tokens' => 1500,
            'messages' => [[
                'role' => 'user',
                'content' => [
                    [
                        'type' => 'image',
                        'source' => [
                            'type' => 'base64',
                            'media_type' => $mimeType,
                            'data' => $base64Image,
                        ],
                    ],
                    ['type' => 'text', 'text' => $prompt],
                ],
            ]],
        ]);

        if (!$response->successful()) {
            Log::error('AI upload analysis failed', ['status' => $response->status(), 'body' => $response->body()]);
            throw new \Exception('AI analysis failed: ' . $response->status());
        }

        $text = $response->json('content.0.text', '{}');
        $text = preg_replace('/```json|```/', '', $text);
        $result = json_decode(trim($text), true) ?? [];

        return $result;
    }

    // ── Generate quiz questions for a topic ──────────────────────────────
    public function generateQuiz(string $subjectName, string $topicName, int $gradeLevel, int $numQuestions = 10, string $difficulty = 'mixed'): array
    {
        $prompt = <<<PROMPT
You are a Filipino K-12 curriculum expert. Generate a {$numQuestions}-question multiple choice quiz.

Subject: {$subjectName}
Topic: {$topicName}
Grade Level: Grade {$gradeLevel}
Difficulty: {$difficulty} (mix of easy, medium, and hard if "mixed")
Curriculum: Philippine K-12 (DepEd)

Return ONLY valid JSON, no markdown, no explanation:
{
  "subject": "{$subjectName}",
  "topic": "{$topicName}",
  "questions": [
    {
      "number": 1,
      "question": "Question text here?",
      "choices": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correct": "A",
      "explanation": "Brief explanation of why A is correct.",
      "difficulty": "easy"
    }
  ]
}
PROMPT;

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->timeout(45)->post($this->baseUrl, [
            'model' => $this->model,
            'max_tokens' => 4000,
            'messages' => [['role' => 'user', 'content' => $prompt]],
        ]);

        if (!$response->successful()) {
            throw new \Exception('AI API error: HTTP ' . $response->status() . ' — ' . substr($response->body(), 0, 300));
        }

        $text = $response->json('content.0.text', '{}');
        $text = preg_replace('/```json|```/', '', $text);
        $result = json_decode(trim($text), true) ?? [];

        return $result;
    }

    // ── Generate AI performance summary ──────────────────────────────────
    public function generateStudentSummary(array $analyticsData): string
    {
        $dataJson = json_encode($analyticsData, JSON_PRETTY_PRINT);

        $prompt = <<<PROMPT
You are a supportive academic advisor for a Filipino K-12 student. Based on the following performance data, write a personalized, encouraging summary in plain English (2-3 short paragraphs). Be specific, positive but honest, and suggest one clear next step.

Performance Data:
{$dataJson}

Guidelines:
- Address the student directly ("You are doing well in...")
- Mention specific subjects and topics
- Be encouraging even about weaknesses
- Keep it under 120 words total
- No markdown, just plain text paragraphs
PROMPT;

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->timeout(30)->post($this->baseUrl, [
            'model' => $this->model,
            'max_tokens' => 300,
            'messages' => [['role' => 'user', 'content' => $prompt]],
        ]);

        if (!$response->successful()) {
            return 'Keep up the great work! Continue practicing your weak topics and take quizzes regularly to improve your mastery.';
        }

        return $response->json('content.0.text', '');
    }

    // ── Build prompt for upload analysis ────────────────────────────────
    private function buildUploadPrompt(string $docType): string
    {
        return <<<PROMPT
You are analyzing a student's {$docType} uploaded to an adaptive learning portal in the Philippines (K-12 DepEd curriculum).

Extract all available information and return ONLY valid JSON (no markdown, no explanation):

{
  "document_type": "exam|quiz|assignment|report_card",
  "subject": "detected subject name or null",
  "topic": "detected topic/chapter or null",
  "grade_level": number or null,
  "quarter": 1-4 or null,
  "score": number or null,
  "total_possible": number or null,
  "percentage": number or null,
  "date": "date string or null",
  "correct_items": ["list of topics/items the student got correct"],
  "wrong_items": [
    {
      "question_or_topic": "what they got wrong",
      "correct_answer": "what the correct answer was if visible",
      "topic_area": "which topic area this falls under"
    }
  ],
  "weak_topics": ["list of topic areas where student struggled, based on wrong answers"],
  "strong_topics": ["list of topic areas where student did well"],
  "remarks": "any teacher remarks, grades, or notes visible",
  "ai_summary": "2-3 sentence encouraging summary of the student's performance on this document"
}

If this is a report card, extract all subjects and their grades into an array called "report_card_subjects": [{"subject": "...", "grade": number, "quarter": number}]

Be thorough. If something is not visible or clear, use null.
PROMPT;
    }
}
