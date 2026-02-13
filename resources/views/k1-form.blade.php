@extends('layouts.app')

@section('title', 'K-1 Form' . (isset($companyName) ? ': ' . $companyName : '') . (isset($formYear) ? ' — ' . $formYear : '') . ' — K1 Flow')

@section('content')
  <div id="k1-form-detail" 
    data-interest-id="{{ $interestId }}" 
    data-tax-year="{{ $taxYear }}"
    data-company-name="{{ $companyName ?? '' }}"
    data-form-year="{{ $formYear ?? '' }}"
  ></div>
@endsection

@push('scripts')
  @vite(['resources/js/k1-form.tsx'])
@endpush
