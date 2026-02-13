@extends('layouts.app')

@section('title', 'Welcome — K1 Flow')

@section('content')
  <div id="welcome"></div>
@endsection

@push('scripts')
  @vite(['resources/js/welcome.tsx'])
@endpush
