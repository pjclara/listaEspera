<?php

namespace App\Enum;

enum ScheduleEstadoTypes: string
{
    case PROPOSTO = 'proposto';
    case PRONTO = 'pronto';
    case AGENDADO = 'agendado';
    case OPERADO = 'operado';
    case CANCELADO = 'cancelado';

    public static function getAll(): array
    {
        return [
            self::PROPOSTO->value,
            self::PRONTO->value,
            self::AGENDADO->value,
            self::OPERADO->value,
            self::CANCELADO->value,
        ];
    }

    #color
    public function color(): string
    {
        return match ($this) {
            self::PROPOSTO => 'bg-yellow-500',
            self::PRONTO => 'bg-blue-500',
            self::AGENDADO => 'bg-orange-500',
            self::OPERADO => 'bg-green-500',
            self::CANCELADO => 'bg-red-500',
        };
    }
}
