@extends('layouts.app')

@section('content')
  <div id="k1-loss-limitations" 
    data-company-id="{{ $companyId }}" 
    data-form-id="{{ $formId }}"
  ></div>
@endsection

@push('scripts')
  @vite(['resources/js/k1-loss-limitations.tsx'])
@endpush
