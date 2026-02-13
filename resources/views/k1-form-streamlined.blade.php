@extends('layouts.app')

@section('title', 'K-1 Multi-Year View' . (isset($companyName) ? ': ' . $companyName : '') . ' — K1 Flow')

@section('content')
  <div id="k1-form-streamlined" 
    data-interest-id="{{ $interestId }}"
    data-company-name="{{ $companyName ?? '' }}"
  ></div>
@endsection

@push('scripts')
  @vite(['resources/js/k1-form-streamlined.tsx'])
@endpush
