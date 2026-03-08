<?php
namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\User;
use App\Models\QuizSession;
use App\Models\StudentUpload;
use App\Models\Subscription;

class StatsOverviewWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $totalStudents  = User::where('is_admin', false)->count();
        $paidStudents   = User::whereIn('plan', ['basic','pro','b2b_basic','b2b_ai'])->count();
        $totalQuizzes   = QuizSession::count();
        $totalUploads   = StudentUpload::count();
        $newToday       = User::whereDate('created_at', today())->count();
        $activeThisWeek = User::where('updated_at', '>=', now()->subDays(7))->where('is_admin', false)->count();

        return [
            Stat::make('Total Students', $totalStudents)
                ->description("+{$newToday} today")
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('primary')
                ->icon('heroicon-o-users'),

            Stat::make('Paid Students', $paidStudents)
                ->description(round($totalStudents > 0 ? ($paidStudents/$totalStudents)*100 : 0, 1) . '% conversion')
                ->color('success')
                ->icon('heroicon-o-credit-card'),

            Stat::make('Active This Week', $activeThisWeek)
                ->description('unique sessions')
                ->color('warning')
                ->icon('heroicon-o-fire'),

            Stat::make('Quizzes Taken', $totalQuizzes)
                ->description("{$totalUploads} uploads")
                ->color('info')
                ->icon('heroicon-o-academic-cap'),
        ];
    }
}
