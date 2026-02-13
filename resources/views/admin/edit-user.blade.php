@extends('layouts.app')

@section('title', 'Edit User — Admin — K1 Flow')

@section('content')
<div id="edit-user-root" data-user-id="{{ $userId }}"></div>
@endsection

@push('scripts')
@vite(['resources/js/admin/edit-user.tsx'])
@endpush
