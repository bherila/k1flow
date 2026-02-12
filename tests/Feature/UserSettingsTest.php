<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_settings()
    {
        $response = $this->get('/user/settings');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_settings()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/user/settings');

        $response->assertStatus(200);
        $response->assertSee('user-settings-root');
    }

    public function test_update_profile_saves_name_and_logs_event()
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user)->post('/user/settings/profile', [
            'name' => 'New Name',
        ]);

        $response->assertSessionHas('message', 'Profile updated successfully.');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name']);
    }
}
