@extends('layouts.app')

@section('title', 'Ownership Basis Adjustments' . (isset($ownedCompanyName) ? ': ' . $ownedCompanyName : '') . ' — ' . ($year ?? '') . ' — K1 Flow')

@section('content')
    <div 
        id="ownership-basis-detail" 
        data-interest-id="{{ $interestId }}"
        data-year="{{ $year }}"
        data-owned-company-name="{{ $ownedCompanyName ?? '' }}"
    ></div>
@endsection

@push('scripts')
    @vite(['resources/js/ownership-basis-detail.tsx'])
@endpush
