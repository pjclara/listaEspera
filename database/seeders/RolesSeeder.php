<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesSeeder extends Seeder
{
    public function run()
    {
        /**
         * ---------------------------------------------------------
         * PERMISSÕES POR DOMÍNIO
         * ---------------------------------------------------------
         */

        // Agenda
        Permission::create(['name' => 'agenda.view']);
        Permission::create(['name' => 'agenda.manage']);

        // Slots
        Permission::create(['name' => 'slots.create']);
        Permission::create(['name' => 'slots.edit']);
        Permission::create(['name' => 'slots.delete']);

        // Schedules (cirurgias)
        Permission::create(['name' => 'schedules.view']);
        Permission::create(['name' => 'schedules.create']);
        Permission::create(['name' => 'schedules.edit']);
        Permission::create(['name' => 'schedules.delete']);
        Permission::create(['name' => 'schedules.move']);

        // Waiting List
        Permission::create(['name' => 'waiting_list.view']);
        Permission::create(['name' => 'waiting_list.manage']);

        // Users
        Permission::create(['name' => 'users.view']);
        Permission::create(['name' => 'users.manage']);

        /**
         * ---------------------------------------------------------
         * ROLES
         * ---------------------------------------------------------
         */

        $admin        = Role::create(['name' => 'admin']);
        $secretaria   = Role::create(['name' => 'secretaria']);
        $team_member  = Role::create(['name' => 'team_member']);
        $team_leader  = Role::create(['name' => 'team_leader']);

        /**
         * ---------------------------------------------------------
         * PERMISSÕES POR ROLE
         * ---------------------------------------------------------
         */

        // ADMIN — tudo
        $admin->givePermissionTo(Permission::all());

        // SECRETARIA — gestão operacional
        $secretaria->givePermissionTo([
            'agenda.view',
            'slots.create',
            'slots.edit',
            'waiting_list.view',
            'schedules.view',
            'schedules.create',
            'schedules.edit',
            'schedules.move',
            'users.view',
        ]);

        // TEAM MEMBER — acesso clínico básico
        $team_member->givePermissionTo([
            'agenda.view',
            'waiting_list.view',
            'schedules.view',
        ]);

        // TEAM LEADER — acesso clínico avançado
        $team_leader->givePermissionTo([
            'agenda.view',
            'agenda.manage',
            'slots.create',
            'slots.edit',
            'waiting_list.view',
            'schedules.view',
            'schedules.create',
            'schedules.edit',
            'schedules.move',
        ]);
    }
}
