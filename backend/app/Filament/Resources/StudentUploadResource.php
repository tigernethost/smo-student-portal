<?php
namespace App\Filament\Resources;

use App\Filament\Resources\StudentUploadResource\Pages;
use App\Models\StudentUpload;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class StudentUploadResource extends Resource
{
    protected static ?string $model = StudentUpload::class;
    protected static ?string $navigationIcon = 'heroicon-o-paper-clip';
    protected static ?string $navigationGroup = 'Activity';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form { return $form->schema([]); }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('Student')->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('original_name')->label('File')->limit(40)->searchable(),
                Tables\Columns\BadgeColumn::make('file_type')
                    ->colors(['primary'=>'pdf','info'=>'docx','warning'=>fn($s)=>in_array($s,['jpg','jpeg','png'])]),
                Tables\Columns\TextColumn::make('subject.name')->label('Subject')->badge()->color('primary'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors(['warning'=>'pending','primary'=>'processing','success'=>'analyzed','danger'=>'failed']),
                Tables\Columns\TextColumn::make('file_size')
                    ->formatStateUsing(fn($state) => $state ? round($state/1024, 1) . ' KB' : '—')
                    ->label('Size'),
                Tables\Columns\TextColumn::make('created_at')->since()->sortable()->label('Uploaded'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(['pending'=>'Pending','processing'=>'Processing','analyzed'=>'Analyzed','failed'=>'Failed']),
                Tables\Filters\SelectFilter::make('subject')->relationship('subject', 'name'),
            ])
            ->actions([Tables\Actions\ViewAction::make()])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListStudentUploads::route('/')];
    }

    public static function getNavigationBadge(): ?string { return static::getModel()::count(); }
    public static function canCreate(): bool { return false; }
}
