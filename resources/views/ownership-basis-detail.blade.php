@extends('layouts.app')

@section('content')
    <div 
        id="ownership-basis-detail" 
        data-interest-id="{{ $interestId }}"
        data-year="{{ $year }}"
    ></div>
@endsection

@push('scripts')
    @vite(['resources/js/ownership-basis-detail.tsx'])
@endpush
