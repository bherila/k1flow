<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Search for users by email (for autocomplete).
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }
        
        $users = User::where('email', 'like', "%{$query}%")
            ->where('is_disabled', false)
            ->select('id', 'name', 'email')
            ->limit(10)
            ->get();
        
        return response()->json($users);
    }
}
