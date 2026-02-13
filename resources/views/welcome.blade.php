@extends('layouts.app')

@section('title', 'Home — K1 Flow')

@section('content')
  <div id="home"></div>
@endsection

@push('scripts')
  @vite(['resources/js/home.tsx'])
@endpush
