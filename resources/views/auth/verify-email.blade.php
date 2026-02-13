@extends('layouts.app')

@section('title', 'Verify Email — K1 Flow')

@section('content')
<div id="verify-email-root"></div>
@endsection

@push('scripts')
@vite(['resources/js/auth/verify-email.tsx'])
@endpush
