<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Show the admin users page.
     */
    public function index()
    {
        if (!Gate::allows('admin-only')) {
            abort(403, 'Unauthorized');
        }
        return view('admin.users');
    }

    /**
     * List all users (API endpoint).
     */
    public function list(Request $request)
    {
        if (!Gate::allows('admin-only')) {
            abort(403, 'Unauthorized');
        }
        
        $perPage = $request->input('per_page', 50);
        
        $users = User::withTrashed()
            ->orderBy('id')
            ->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Get a single user details.
     */
    public function show(User $user)
    {
        if (!Gate::allows('admin-only')) {
            abort(403, 'Unauthorized');
        }
        return response()->json($user);
    }

    /**
     * Create a new user.
     */
    public function store(Request $request)
    {
        if (!Gate::allows('admin-only')) {
            abort(403, 'Unauthorized');
        }
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:8',
            'is_admin' => 'boolean',
            'is_disabled' => 'boolean',
            'force_change_pw' => 'boolean',
            'email_verified' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password ? Hash::make($request->password) : Hash::make(Str::random(32)),
            'is_admin' => $request->boolean('is_admin'),
            'is_disabled' => $request->boolean('is_disabled'),
            'force_change_pw' => $request->boolean('force_change_pw'),
            'email_verified_at' => $request->boolean('email_verified') ? now() : null,
        ]);

        UserAuditLog::log(
            userId: $user->id,
            eventName: 'create',
            isSuccessful: true,
            message: 'Admin created user',
            actingUserId: auth()->id()
        );

        return response()->json($user, 201);
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, User $user)
    {
        if (!Gate::allows('admin-only')) {
            abort(403, 'Unauthorized');
        }
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'is_admin' => 'boolean',
            'is_disabled' => 'boolean',
            'force_change_pw' => 'boolean',
            'email_verified' => 'boolean',
        ]);

        $changes = [];

        if ($request->has('name')) {
            $user->name = $request->name;
            $changes[] = 'name';
        }

        if ($request->has('email')) {
            $user->email = $request->email;
            $changes[] = 'email';
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $changes[] = 'password';
        }

        if ($request->has('is_admin')) {
            $user->is_admin = $request->boolean('is_admin');
            $changes[] = 'is_admin';
        }

        if ($request->has('is_disabled')) {
            $wasDisabled = $user->is_disabled;
            $user->is_disabled = $request->boolean('is_disabled');
            $changes[] = 'is_disabled';

            // Log lock/unlock
            if (!$wasDisabled && $user->is_disabled) {
                UserAuditLog::log(
                    userId: $user->id,
                    eventName: 'admin-lock',
                    isSuccessful: true,
                    message: 'Account locked by admin',
                    actingUserId: auth()->id()
                );
            } elseif ($wasDisabled && !$user->is_disabled) {
                UserAuditLog::log(
                    userId: $user->id,
                    eventName: 'admin-unlock',
                    isSuccessful: true,
                    message: 'Account unlocked by admin',
                    actingUserId: auth()->id()
                );
            }
        }

        if ($request->has('force_change_pw')) {
            $user->force_change_pw = $request->boolean('force_change_pw');
            $changes[] = 'force_change_pw';
        }

        if ($request->has('email_verified')) {
            $user->email_verified_at = $request->boolean('email_verified') ? now() : null;
            $changes[] = 'email_verified_at';
        }

        $user->save();

        UserAuditLog::log(
            userId: $user->id,
            eventName: 'update',
            isSuccessful: true,
            message: 'Admin updated user: ' . implode(', ', $changes),
            actingUserId: auth()->id()
        );

        return response()->json($user);
    }

    /**
     * Delete a user (soft delete).
     */
    public function destroy(User $user)
    {
        if (!Gate::allows('admin-only')) {
            abort(403, 'Unauthorized');
        }
        
        $user->delete();

        UserAuditLog::log(
            userId: $user->id,
            eventName: 'update',
            isSuccessful: true,
            message: 'Admin deleted user',
            actingUserId: auth()->id()
        );

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Get audit log for a user.
     */
    public function auditLog(Request $request, User $user)
    {
        if (!Gate::allows('admin-only')) {
            abort(403, 'Unauthorized');
        }
        
        $perPage = $request->input('per_page', 15);

        $logs = UserAuditLog::where('user_id', $user->id)
            ->with('actingUser:id,name,email')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return response()->json($logs);
    }
}

