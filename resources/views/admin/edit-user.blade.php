@extends('layouts.app')

@section('content')
<div id="edit-user-root" data-user-id="{{ $userId }}"></div>
@endsection

@push('scripts')
@vite(['resources/js/admin/edit-user.tsx'])
@endpush
