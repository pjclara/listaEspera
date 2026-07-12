<!DOCTYPE html>
<html lang="pt-PT">

<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111827;
        }

        h1 {
            margin: 0 0 6px;
            font-size: 20px;
        }

        .meta {
            margin-bottom: 14px;
            color: #4b5563;
            font-size: 11px;
        }

        .day-block {
            margin-bottom: 14px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 8px;
        }

        .day-title {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 8px;
            color: #1f2937;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        th,
        td {
            border: 1px solid #e5e7eb;
            padding: 6px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background: #f3f4f6;
            font-size: 11px;
        }

        .muted {
            color: #6b7280;
        }

        ul {
            margin: 0;
            padding-left: 16px;
        }

        li {
            margin-bottom: 3px;
        }
    </style>
</head>

<body>
    <h1>{{ $title }}</h1>

    <div class="meta">
        @if ($type === 'mensal' && $month)
            <div><strong>Mês:</strong> {{ $month->format('m/Y') }}</div>
        @endif
        <div><strong>Período:</strong> {{ $start->format('d/m/Y') }} até {{ $end->format('d/m/Y') }}</div>
        <div><strong>Gerado em:</strong> {{ $generatedAt->format('d/m/Y H:i') }}</div>
    </div>

    @forelse ($slotsByDay as $date => $slots)
        <div class="day-block">
            <p class="day-title">{{ \Carbon\Carbon::parse($date)->format('d/m/Y') }}</p>

            <table>
                <thead>
                    <tr>
                        <th style="width: 10%;">Hora</th>
                        <th style="width: 10%;">Equipa</th>
                        <th style="width: 10%;">Sala</th>
                        <th style="width: 10%;">Nº cirurgias</th>
                        <th style="width: 60%;">Agendamentos</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($slots as $slot)
                        <tr>
                            <td>{{ \Carbon\Carbon::parse($slot->hora_inicio)->format('H:i') }} </td>
                            <td>{{ $slot->team->nome ?? '—' }}</td>
                            <td>{{ $slot->sala ?? '—' }}</td>
                            <td>{{ $slot->schedules->count() }}</td>
                            <td>
                                @if ($slot->schedules->isEmpty())
                                    <span class="muted">Sem agendamentos</span>
                                @else
                                    <ul>
                                        @foreach ($slot->schedules as $schedule)
                                            <li>
                                                Processo: {{ $schedule->waitingList->num_processo ?? '—' }} |
                                                Diagnóstico: {{ $schedule->waitingList->des_diagnostico ?? '—' }} |
                                                Pernoita: {{ $schedule->pernoita ?? '—' }}
                                                Posição: {{ $schedule->waitingList?->posicao_patologia ?? '—' }} / {{ $schedule->waitingList?->posicao_lista ?? '—' }} |
                                            </li>
                                        @endforeach
                                    </ul>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @empty
        <p class="muted">Não existem slots para o período selecionado.</p>
    @endforelse
</body>

</html>
