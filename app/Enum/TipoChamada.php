<?php

namespace App\Enum;

enum TipoChamada: string
{
    case Ambulatorio = 'Ambulatorio';
    case Base = 'Base';
    case SIGIC = 'SIGIC';

     public static function getAll(): array
    {
        return [
            self::Ambulatorio->value,
            self::Base->value,
            self::SIGIC->value
        ];

    }
}
