<?php
namespace App\Filament\Resources;

use App\Filament\Resources\SubjectResource\Pages;
use App\Models\Subject;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SubjectResource extends Resource
{
    protected static ?string $model = Subject::class;
    protected static ?string $navigationIcon = 'heroicon-o-book-open';
    protected static ?string $navigationGroup = 'Curriculum';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make()->schema([
                Forms\Components\TextInput::make('name')->required(),
                Forms\Components\TextInput::make('code'),
                Forms\Components\TextInput::make('icon')->label('Emoji Icon'),
                Forms\Components\ColorPicker::make('color'),
                Forms\Components\Select::make('grade_level')->options(array_combine(range(7,12), array_map(fn($g) => "Grade $g", range(7,12))))->nullable(),
                Forms\Components\Select::make('strand')->options(['STEM'=>'STEM','ABM'=>'ABM','HUMSS'=>'HUMSS','TVL'=>'TVL','GAS'=>'GAS','All'=>'All Strands'])->nullable(),
                Forms\Components\Toggle::make('is_active')->default(true),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('icon')->label('')->searchable(false),
                Tables\Columns\TextColumn::make('name')->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('code')->badge()->color('gray'),
                Tables\Columns\TextColumn::make('grade_level')->label('Grade')->sortable(),
                Tables\Columns\TextColumn::make('strand')->badge()->color('info'),
                Tables\Columns\TextColumn::make('topics_count')->counts('topics')->label('Topics')->sortable(),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Active'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('grade_level')->options(array_combine(range(7,12), array_map(fn($g) => "Grade $g", range(7,12)))),
                Tables\Filters\SelectFilter::make('strand')->options(['STEM'=>'STEM','ABM'=>'ABM','HUMSS'=>'HUMSS','TVL'=>'TVL','GAS'=>'GAS']),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])])
            ->defaultSort('grade_level');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListSubjects::route('/'),
            'create' => Pages\CreateSubject::route('/create'),
            'edit'   => Pages\EditSubject::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string { return static::getModel()::count(); }
}
