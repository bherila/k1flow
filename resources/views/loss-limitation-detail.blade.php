@extends('layouts.app')

@section('content')
    <div 
        id="loss-limitation-detail" 
        data-interest-id="{{ $interestId }}"
        data-year="{{ $year }}"
        data-type="{{ $type }}"
    ></div>
@endsection

@push('scripts')
    @vite(['resources/js/loss-limitation-detail.tsx'])
@endpush
