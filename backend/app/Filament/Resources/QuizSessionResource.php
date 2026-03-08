<?php
namespace App\Filament\Resources;

use App\Filament\Resources\QuizSessionResource\Pages;
use App\Models\QuizSession;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class QuizSessionResource extends Resource
{
    protected static ?string $model = QuizSession::class;
    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';
    protected static ?string $navigationGroup = 'Activity';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form { return $form->schema([]); }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('Student')->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('user.email')->label('Email')->color('gray')->searchable(),
                Tables\Columns\TextColumn::make('subject.name')->label('Subject')->badge()->color('primary'),
                Tables\Columns\TextColumn::make('topic.name')->label('Topic')->limit(30),
                Tables\Columns\TextColumn::make('score')->label('Score')
                    ->formatStateUsing(fn($record) => $record->score !== null ? "{$record->score}/{$record->total_questions}" : '—')
                    ->sortable(),
                Tables\Columns\TextColumn::make('percentage')
                    ->label('%')
                    ->formatStateUsing(fn($record) => $record->total_questions > 0 && $record->score !== null
                        ? round(($record->score / $record->total_questions) * 100) . '%' : '—')
                    ->color(fn($record) => $record->total_questions > 0 && $record->score !== null
                        ? (($record->score / $record->total_questions) >= 0.75 ? 'success' : (($record->score / $record->total_questions) >= 0.4 ? 'warning' : 'danger'))
                        : 'gray'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors(['warning' => 'in_progress', 'success' => 'completed', 'danger' => 'abandoned']),
                Tables\Columns\TextColumn::make('created_at')->since()->sortable()->label('Taken'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(['in_progress'=>'In Progress','completed'=>'Completed','abandoned'=>'Abandoned']),
                Tables\Filters\SelectFilter::make('subject')->relationship('subject', 'name'),
            ])
            ->actions([Tables\Actions\ViewAction::make()])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListQuizSessions::route('/')];
    }

    public static function getNavigationBadge(): ?string { return static::getModel()::count(); }
    public static function canCreate(): bool { return false; }
}
