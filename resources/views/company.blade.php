@extends('layouts.app')

@section('title', ($companyName ?? 'Company') . ' — K1 Flow')

@section('content')
  <div id="company-detail" data-company-id="{{ $id }}" data-company-name="{{ $companyName ?? '' }}"></div>
@endsection

@push('scripts')
  @vite(['resources/js/company.tsx'])
@endpush
