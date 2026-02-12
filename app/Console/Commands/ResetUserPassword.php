<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserAuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ResetUserPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:reset-password
                            {email : The user email}
                            {--password= : The new password (will prompt if omitted)}
                            {--force-change : Require the user to change password on next login}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset a user\'s password';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');
        $password = $this->option('password');
        $forceChange = $this->option('force-change');

        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error('User not found: ' . $email);
            return 1;
        }

        if (!$password) {
            $password = $this->secret('New password (hidden)');
            if (!$password) {
                $this->error('Password is required');
                return 1;
            }
        }

        $validator = Validator::make(['password' => $password], ['password' => 'required|string']);
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $err) {
                $this->error($err);
            }
            return 1;
        }

        try {
            $user->password = Hash::make($password);
            if ($forceChange) {
                $user->force_change_pw = true;
            }
            $user->save();

            UserAuditLog::log(
                userId: $user->id,
                eventName: 'reset-password',
                isSuccessful: true,
                message: 'Password reset via artisan',
                actingUserId: null
            );

            $this->info('Password reset for ' . $user->email);
            return 0;
        } catch (\Exception $e) {
            $this->error('Failed to reset password: ' . $e->getMessage());
            return 1;
        }
    }
}
