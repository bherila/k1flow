@extends('layouts.app')

@section('title', 'Admin — Users — K1 Flow')

@section('content')
<div id="admin-users-root"></div>
@endsection

@push('scripts')
@vite(['resources/js/admin/users.tsx'])
@endpush
