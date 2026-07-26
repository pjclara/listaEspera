<?php

namespace App\Enum;

enum ResultadoChamada: string
{
    case AGENDADO = 'Agendado';
    case Ativo = 'Ativo';
    case RECUSOU = 'Recusou';
    case NAO_ATENDE = 'Não atende';
    case INDISPONIVEL = 'Indisponível';
    case ACEITOU_OUTRO_HOSPITAL = 'Aceitou Outro Hospital';
    case OUTRO = 'Outro';

    public static function getAll(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }

    public function color(): string
    {
        return match ($this) {
            self::AGENDADO => 'bg-blue-600',
            self::Ativo => 'bg-yellow-600',
            self::RECUSOU => 'bg-red-600',
            self::NAO_ATENDE => 'bg-gray-600',
            self::INDISPONIVEL => 'bg-orange-600',
            self::ACEITOU_OUTRO_HOSPITAL => 'bg-purple-600',
            self::OUTRO => 'bg-slate-600',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::AGENDADO => 'Agendado',
            self::Ativo => 'Volta à lista',
            self::RECUSOU => 'Recusou',
            self::NAO_ATENDE => 'Não atende',
            self::INDISPONIVEL => 'Indisponível',
            self::ACEITOU_OUTRO_HOSPITAL => 'Aceitou Outro Hospital',
            self::OUTRO => 'Outro',
        };
    }
}
