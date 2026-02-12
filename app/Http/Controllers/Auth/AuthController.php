<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserAuditLog;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Show the sign-in page.
     */
    public function showSignIn()
    {
        return view('auth.sign-in');
    }

    /**
     * Show the sign-up page.
     */
    public function showSignUp()
    {
        return view('auth.sign-up');
    }

    /**
     * Handle sign-in request.
     */
    public function signIn(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            UserAuditLog::log(
                userId: 0, // Unknown user
                eventName: 'sign-in',
                isSuccessful: false,
                message: 'User not found',
                actingUserId: null
            );
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if account is disabled
        if ($user->is_disabled) {
            UserAuditLog::log(
                userId: $user->id,
                eventName: 'sign-in',
                isSuccessful: false,
                message: 'Account disabled'
            );
            return back()->withErrors([
                'email' => 'Sorry, you can\'t log in right now.',
            ])->withInput();
        }

        // Check if email is verified
        if (!$user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
            UserAuditLog::log(
                userId: $user->id,
                eventName: 'sign-in',
                isSuccessful: false,
                message: 'Email not verified'
            );
            return back()->with('message', 'Please check your email to verify your account before signing in.')->withInput();
        }

        // Attempt authentication
        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            UserAuditLog::log(
                userId: $user->id,
                eventName: 'sign-in',
                isSuccessful: false,
                message: 'Invalid credentials'
            );
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Update last login timestamp
        $user->last_login_at = now();
        $user->save();

        UserAuditLog::log(
            userId: $user->id,
            eventName: 'sign-in',
            isSuccessful: true,
            message: 'Successful sign-in'
        );

        $request->session()->regenerate();

        // Redirect to intended page or home
        return redirect()->intended('/');
    }

    /**
     * Handle sign-up request.
     */
    public function signUp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        UserAuditLog::log(
            userId: $user->id,
            eventName: 'create',
            isSuccessful: true,
            message: 'User account created',
            actingUserId: $user->id
        );

        event(new Registered($user));

        $user->sendEmailVerificationNotification();

        return redirect()->route('sign-in')->with('message', 'Account created! Please check your email to verify your account.');
    }

    /**
     * Handle sign-out request.
     */
    public function signOut(Request $request)
    {
        $userId = auth()->id();

        if ($userId) {
            UserAuditLog::log(
                userId: $userId,
                eventName: 'sign-out',
                isSuccessful: true,
                message: 'User signed out'
            );
        }

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return view('auth.sign-out');
    }
}

