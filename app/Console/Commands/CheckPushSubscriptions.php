<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PushSubscription;
use App\Models\User;

class CheckPushSubscriptions extends Command
{
    protected $signature = 'push:check';
    protected $description = 'Check push subscriptions in database';

    public function handle()
    {
        $total = PushSubscription::count();

        $this->info("Total push subscriptions: {$total}");

        if ($total > 0) {
            $this->info("\nUsers with subscriptions:");

            $users = User::has('pushSubscriptions')->with('pushSubscriptions')->get();

            foreach ($users as $user) {
                $count = $user->pushSubscriptions->count();
                $this->line("- {$user->name} (ID: {$user->id}) - {$count} device(s)");
            }

            $this->info("\n✓ Ready to send notifications!");
            return 0;
        }

        $this->warn("\n⚠ No subscriptions found. Please enable push notifications on /teams/following");
        return 1;
    }
}
