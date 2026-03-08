<?php
namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Students';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Account')->schema([
                Forms\Components\TextInput::make('name')->required(),
                Forms\Components\TextInput::make('email')->email()->required(),
                Forms\Components\TextInput::make('password')->password()->dehydrateStateUsing(fn($s) => bcrypt($s))->dehydrated(fn($s) => filled($s))->required(fn(string $ctx) => $ctx === 'create'),
                Forms\Components\Toggle::make('is_admin')->label('Admin Access'),
            ])->columns(2),

            Forms\Components\Section::make('Academic Profile')->schema([
                Forms\Components\Select::make('grade_level')->options(array_combine(range(7,12), array_map(fn($g) => "Grade $g", range(7,12))))->label('Grade Level'),
                Forms\Components\Select::make('strand')->options(['STEM'=>'STEM','ABM'=>'ABM','HUMSS'=>'HUMSS','TVL'=>'TVL','GAS'=>'GAS'])->nullable(),
                Forms\Components\TextInput::make('school_name'),
                Forms\Components\Select::make('learning_style')->options(['visual'=>'Visual','auditory'=>'Auditory','reading'=>'Reading/Writing','kinesthetic'=>'Kinesthetic'])->nullable(),
            ])->columns(2),

            Forms\Components\Section::make('Subscription')->schema([
                Forms\Components\Select::make('plan')->options(['free'=>'Free','basic'=>'Basic','pro'=>'Pro','b2b_basic'=>'B2B Basic','b2b_ai'=>'B2B + AI'])->default('free'),
                Forms\Components\TextInput::make('ai_quota_used')->numeric()->default(0),
                Forms\Components\TextInput::make('ai_quota_limit')->numeric()->default(10),
                Forms\Components\Toggle::make('onboarding_done'),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('email')->searchable()->copyable()->color('gray'),
                Tables\Columns\BadgeColumn::make('plan')
                    ->colors(['gray'=>'free','primary'=>'basic','warning'=>'pro','success'=>fn($s)=>in_array($s,['b2b_basic','b2b_ai'])]),
                Tables\Columns\TextColumn::make('grade_level')->label('Grade')->sortable(),
                Tables\Columns\TextColumn::make('strand')->badge()->color('info'),
                Tables\Columns\TextColumn::make('ai_quota_used')->label('AI Used')->sortable(),
                Tables\Columns\IconColumn::make('onboarding_done')->boolean()->label('Onboarded'),
                Tables\Columns\IconColumn::make('is_admin')->boolean()->label('Admin'),
                Tables\Columns\TextColumn::make('created_at')->since()->sortable()->label('Joined'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('plan')->options(['free'=>'Free','basic'=>'Basic','pro'=>'Pro','b2b_basic'=>'B2B Basic','b2b_ai'=>'B2B AI']),
                Tables\Filters\TernaryFilter::make('onboarding_done')->label('Onboarded'),
                Tables\Filters\TernaryFilter::make('is_admin')->label('Admin'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelationsManagers(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('is_admin', false)->count();
    }
}
