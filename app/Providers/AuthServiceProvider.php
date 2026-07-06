<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

use App\Models\Slot;
use App\Models\Schedule;
use App\Models\WaitingList;
use App\Models\Team;

use App\Policies\SlotPolicy;
use App\Policies\SchedulePolicy;
use App\Policies\WaitingListPolicy;
use App\Policies\TeamPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Slot::class => SlotPolicy::class,
        Schedule::class => SchedulePolicy::class,
        WaitingList::class => WaitingListPolicy::class,
        Team::class => TeamPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
