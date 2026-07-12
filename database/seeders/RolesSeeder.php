<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesSeeder extends Seeder
{
    public function run()
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Agenda
            'agenda.view',
            'agenda.export',

            // Slots
            'slots.view',
            'slots.create',
            'slots.edit',
            'slots.delete',

            // Schedules (cirurgias)
            'schedules.view',
            'schedules.create',
            'schedules.edit',
            'schedules.delete',
            'schedules.move',

            // Waiting List
            'waiting_list.view',
            'waiting_list.manage',
            'waiting_list.export',
            'waiting_list.import',

            // Users / Teams
            'users.view',
            'users.manage',
            'teams.view',
            'teams.manage',
        ];

        foreach ($permissions as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        $admin = Role::findOrCreate('admin', 'web');
        $secretaria = Role::findOrCreate('secretaria', 'web');
        $teamMember = Role::findOrCreate('team_member', 'web');
        $teamLeader = Role::findOrCreate('team_leader', 'web');

        // Compatibilidade com nomes antigos
        Role::findOrCreate('membro', 'web');
        Role::findOrCreate('lider', 'web');

        $allPermissions = Permission::all()->pluck('name')->toArray();

        $admin->syncPermissions($allPermissions);

        $secretaria->syncPermissions([
            'agenda.view',
            'agenda.export',
            'slots.view',
            'slots.create',
            'slots.edit',
            'schedules.view',
            'schedules.create',
            'schedules.edit',
            'schedules.move',
            'waiting_list.view',
            'waiting_list.manage',
            'waiting_list.export',
            'waiting_list.import',
            'users.view',
            'teams.view',
        ]);

        $teamMember->syncPermissions([
            'agenda.view',
            'slots.view',
            'schedules.view',
            'schedules.create',
            'waiting_list.view',
        ]);

        $teamLeader->syncPermissions([
            'agenda.view',
            'agenda.export',
            'slots.view',
            'slots.create',
            'slots.edit',
            'schedules.view',
            'schedules.create',
            'schedules.edit',
            'schedules.move',
            'waiting_list.view',
            'waiting_list.manage',
            'waiting_list.export',
            'teams.view',
        ]);

        // Roles legadas recebem o mesmo conjunto
        Role::findByName('membro', 'web')->syncPermissions($teamMember->permissions);
        Role::findByName('lider', 'web')->syncPermissions($teamLeader->permissions);
    }
}
