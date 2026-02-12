@extends('layouts.app')

@section('content')
<div class="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-[#1C1C1A] rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Signed Out</h2>
    <p class="mb-4">You have been securely logged out.</p>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        For maximum protection, clear your browser cache and history to remove any data that might be temporarily stored locally.
    </p>
    <a href="{{ route('sign-in') }}" class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Sign In Again
    </a>
</div>
@endsection
