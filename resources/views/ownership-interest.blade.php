@extends('layouts.app')

@section('content')
    <div id="ownership-interest-detail" data-interest-id="{{ $interestId }}"></div>
@endsection

@push('scripts')
    @vite(['resources/js/ownership-interest.tsx'])
@endpush
