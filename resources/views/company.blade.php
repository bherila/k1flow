@extends('layouts.app')

@section('content')
  <div id="company-detail" data-company-id="{{ $id }}"></div>
@endsection

@push('scripts')
  @vite(['resources/js/company.tsx'])
@endpush
