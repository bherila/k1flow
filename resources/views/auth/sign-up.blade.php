@extends('layouts.app')

@section('title', 'Sign up — K1 Flow')

@section('content')
<div id="sign-up-root"></div>
@endsection

@push('scripts')
@vite(['resources/js/auth/sign-up.tsx'])
@endpush
