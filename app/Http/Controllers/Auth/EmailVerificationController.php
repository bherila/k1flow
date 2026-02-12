<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserAuditLog;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmailVerificationController extends Controller
{
    /**
     * Show the email verification notice.
     */
    public function notice()
    {
        return view('auth.verify-email');
    }

    /**
     * Mark the authenticated user's email address as verified.
     */
    public function verify(EmailVerificationRequest $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            UserAuditLog::log(
                userId: $user->id,
                eventName: 'email-verify',
                isSuccessful: false,
                message: 'Email already verified'
            );
            return redirect()->route('sign-in')->with('message', 'This email has already been verified. Please sign in.');
        }

        if ($user->markEmailAsVerified()) {
            UserAuditLog::log(
                userId: $user->id,
                eventName: 'email-verify',
                isSuccessful: true,
                message: 'Email verified'
            );
            event(new Verified($user));
        }

        // Log the user in automatically
        Auth::login($user);
        $user->last_login_at = now();
        $user->save();

        return redirect('/')->with('message', 'Your email has been verified!');
    }

    /**
     * Resend the email verification notification.
     */
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return back()->with('message', 'Email already verified.');
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('message', 'Verification link sent!');
    }
}

