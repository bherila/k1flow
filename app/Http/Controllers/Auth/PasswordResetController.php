<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserAuditLog;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link.
     */
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            // Don't reveal if user exists
            return back()->with('message', 'If an account with that email exists, we sent a password reset link.');
        }

        if ($user->is_disabled) {
            UserAuditLog::log(
                userId: $user->id,
                eventName: 'reset-password-request',
                isSuccessful: false,
                message: 'Account disabled'
            );
            return back()->withErrors(['email' => 'Sorry, you can\'t reset your password right now.']);
        }

        UserAuditLog::log(
            userId: $user->id,
            eventName: 'reset-password-request',
            isSuccessful: true,
            message: 'Password reset requested'
        );

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('message', __($status))
            : back()->withErrors(['email' => __($status)]);
    }

    /**
     * Show the password reset form.
     */
    public function showResetForm(Request $request, string $token)
    {
        return view('auth.reset-password', [
            'token' => $token,
            'email' => $request->email,
        ]);
    }

    /**
     * Reset the user's password.
     */
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'email_verified_at' => $user->email_verified_at ?? now(), // Verify email on successful reset if not already verified
                ])->setRememberToken(Str::random(60));

                $user->save();

                UserAuditLog::log(
                    userId: $user->id,
                    eventName: 'reset-password-complete',
                    isSuccessful: true,
                    message: 'Password reset completed'
                );

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('sign-in')->with('message', 'Your password has been reset!');
        }

        return back()->withErrors(['email' => [__($status)]]);
    }
}

