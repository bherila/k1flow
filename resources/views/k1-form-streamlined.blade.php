@extends('layouts.app')

@section('content')
  <div id="k1-form-streamlined" 
    data-interest-id="{{ $interestId }}"
  ></div>
@endsection

@push('scripts')
  @vite(['resources/js/k1-form-streamlined.tsx'])
@endpush
