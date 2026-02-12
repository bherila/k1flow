@extends('layouts.app')

@section('content')
<div id="sign-in-root"></div>
@endsection

@push('scripts')
@vite(['resources/js/auth/sign-in.tsx'])
@endpush
