@extends('layouts.app')

@section('content')
  <div id="companies"></div>
@endsection

@push('scripts')
  @vite(['resources/js/companies.tsx'])
@endpush
