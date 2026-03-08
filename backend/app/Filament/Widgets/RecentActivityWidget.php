<?php
namespace App\Filament\Widgets;

use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use App\Models\User;

class RecentActivityWidget extends BaseWidget
{
    protected static ?string $heading = 'Recent Registrations';
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(User::where('is_admin', false)->latest()->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->weight('bold'),
                Tables\Columns\TextColumn::make('email')->searchable()->color('gray'),
                Tables\Columns\BadgeColumn::make('plan')
                    ->colors([
                        'gray'    => 'free',
                        'primary' => 'basic',
                        'warning' => 'pro',
                        'success' => fn($state) => in_array($state, ['b2b_basic','b2b_ai']),
                    ]),
                Tables\Columns\TextColumn::make('grade_level')->label('Grade'),
                Tables\Columns\IconColumn::make('onboarding_done')->boolean()->label('Onboarded'),
                Tables\Columns\TextColumn::make('created_at')->since()->label('Joined'),
            ]);
    }
}
