@extends('layouts.app')

@section('content')
<div id="sign-up-root"></div>
@endsection

@push('scripts')
@vite(['resources/js/auth/sign-up.tsx'])
@endpush
