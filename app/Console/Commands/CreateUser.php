<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserAuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CreateUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create
                            {email : The email address}
                            {name? : The full name}
                            {--password= : The password (will prompt if omitted)}
                            {--admin : Make the user an admin}
                            {--disabled : Create the user disabled}
                            {--verified : Mark email as verified}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new application user';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');
        $name = $this->argument('name') ?? $email;
        $password = $this->option('password');
        $isAdmin = $this->option('admin');
        $isDisabled = $this->option('disabled');
        $isVerified = $this->option('verified');

        if (!$password) {
            $password = $this->secret('Password (hidden)');
            if (!$password) {
                $this->error('Password is required');
                return 1;
            }
        }

        $validator = Validator::make([
            'email' => $email,
            'name' => $name,
            'password' => $password,
        ], [
            'email' => 'required|email|unique:users,email',
            'name' => 'required|string|max:255',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $err) {
                $this->error($err);
            }
            return 1;
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => \Illuminate\Support\Facades\Hash::make($password),
                'is_admin' => (bool) $isAdmin,
                'is_disabled' => (bool) $isDisabled,
            ]);

            if ($isVerified) {
                $user->email_verified_at = now();
                $user->save();
            }

            UserAuditLog::log(
                userId: $user->id,
                eventName: 'create',
                isSuccessful: true,
                message: 'Created via artisan user:create',
                actingUserId: null
            );

            DB::commit();

            $this->info('User created: ' . $user->id . ' <' . $user->email . '>');
            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Failed to create user: ' . $e->getMessage());
            return 1;
        }
    }
}
