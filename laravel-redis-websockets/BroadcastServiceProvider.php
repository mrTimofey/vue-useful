<?php

namespace App\Providers;

use App\User;
use Illuminate\Broadcasting\BroadcastManager;
use Illuminate\Broadcasting\Broadcasters\Broadcaster;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider {
	/**
	 * Bootstrap any application services.
	 * @param BroadcastManager $manager
	 */
	public function boot(BroadcastManager $manager) {
		$manager->routes();
		/** @var Broadcaster $bc */
		$bc = $manager->driver();

		// any private event broadcasts here
		$bc->channel('user.*', function (User $user, $userId) {
			return $user->id === (int)$userId;
		});
	}
}