@extends('layouts.app')

@section('title', 'Companies — K1 Flow')

@section('content')
  <div id="companies"></div>
@endsection

@push('scripts')
  @vite(['resources/js/companies.tsx'])
@endpush
