@extends('layouts.app')

@section('title', 'Ownership Interest' . (isset($ownedCompanyName) ? ': ' . $ownedCompanyName : '') . (isset($ownerCompanyName) ? ' — ' . $ownerCompanyName : '') . ' — K1 Flow')

@section('content')
    <div id="ownership-interest-detail" data-interest-id="{{ $interestId }}" data-owned-company-name="{{ $ownedCompanyName ?? '' }}" data-owner-company-name="{{ $ownerCompanyName ?? '' }}"></div>
@endsection

@push('scripts')
    @vite(['resources/js/ownership-interest.tsx'])
@endpush
