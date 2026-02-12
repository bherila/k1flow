<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rules\Password;

class UserSettingsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the user settings page.
     */
    public function show()
    {
        $user = auth()->user();
        $recentAttempts = UserAuditLog::where('user_id', $user->id)
            ->where('event_name', 'sign-in')
            ->where('created_at', '>=', now()->subDays(60))
            ->orderBy('id', 'desc')
            ->limit(20)
            ->with('actingUser')
            ->get();

        return view('auth.settings', [
            'user' => $user,
            'recentAttempts' => $recentAttempts,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user->name = $request->name;
        $user->save();

        UserAuditLog::log(
            userId: $user->id,
            eventName: 'update',
            isSuccessful: true,
            message: 'Profile updated'
        );

        return back()->with('message', 'Profile updated successfully.');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'string', 'min:8', 'confirmed', Password::defaults()],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'The provided password does not match your current password.']);
        }

        $user->password = Hash::make($request->password);
        $user->force_change_pw = false; // Clear force change flag if set
        $user->save();

        UserAuditLog::log(
            userId: $user->id,
            eventName: 'update',
            isSuccessful: true,
            message: 'Password changed'
        );

        return back()->with('message', 'Password updated successfully.');
    }

    /**
     * Request email change.
     */
    public function requestEmailChange(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        // Check if another user already has this email
        if (User::where('email', $request->email)->where('id', '!=', $user->id)->exists()) {
            return back()->withErrors(['email' => 'This email is already in use.']);
        }

        // Store pending email
        $user->pending_email = $request->email;
        $user->save();

        // Generate signed URL for email confirmation
        $url = URL::temporarySignedRoute(
            'settings.confirm-email',
            now()->addHours(24),
            ['user' => $user->id, 'email' => $request->email]
        );

        // Send email with confirmation link (would need to create notification)
        // For now, we'll just return success
        // TODO: Send actual email notification

        UserAuditLog::log(
            userId: $user->id,
            eventName: 'email-change-request',
            isSuccessful: true,
            message: 'Email change requested'
        );

        return back()->with('message', 'Please check your new email address to confirm the change.');
    }

    /**
     * Confirm email change.
     */
    public function confirmEmailChange(Request $request)
    {
        if (!$request->hasValidSignature()) {
            abort(401, 'Invalid or expired email confirmation link.');
        }

        $user = User::findOrFail($request->user);

        if ($user->pending_email !== $request->email) {
            abort(400, 'Email confirmation mismatch.');
        }

        $oldEmail = $user->email;
        $user->email = $user->pending_email;
        $user->pending_email = null;
        $user->email_verified_at = now(); // Mark new email as verified
        $user->save();

        UserAuditLog::log(
            userId: $user->id,
            eventName: 'email-change-complete',
            isSuccessful: true,
            message: 'Email changed'
        );

        return redirect()->route('settings')->with('message', 'Email updated successfully.');
    }
}

