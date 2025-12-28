@extends('layouts.app')

@section('content')
  <div id="k1-outside-basis" 
    data-company-id="{{ $companyId }}" 
    data-form-id="{{ $formId }}"
  ></div>
@endsection

@push('scripts')
  @vite(['resources/js/k1-outside-basis.tsx'])
@endpush
