@extends('layouts.app')

@section('title', ucfirst(str_replace('-', ' ', $type)) . ' — ' . ($year ?? '') . (isset($ownedCompanyName) ? ': ' . $ownedCompanyName : '') . ' — K1 Flow')

@section('content')
    <div 
        id="loss-limitation-detail" 
        data-interest-id="{{ $interestId }}"
        data-year="{{ $year }}"
        data-type="{{ $type }}"
        data-owned-company-name="{{ $ownedCompanyName ?? '' }}"
    ></div>
@endsection

@push('scripts')
    @vite(['resources/js/loss-limitation-detail.tsx'])
@endpush
