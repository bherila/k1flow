@extends('layouts.app')

@section('content')
<div id="user-settings-root" 
    data-user="{{ json_encode($user) }}" 
    data-recent-attempts="{{ json_encode($recentAttempts) }}"></div>
@endsection

@push('scripts')
@vite(['resources/js/auth/settings.tsx'])
@endpush
