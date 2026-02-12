@extends('layouts.app')

@section('content')
  <div id="welcome"></div>
@endsection

@push('scripts')
  @vite(['resources/js/welcome.tsx'])
@endpush
