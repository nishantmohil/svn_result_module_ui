<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores'
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Navigation -->
<nav class="bg-white shadow-sm border-b border-gray-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo and School Name -->
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<a href="/" class="flex items-center space-x-3">
						<div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
							<span class="text-white font-bold text-lg">S</span>
						</div>
						<div>
							<h1 class="text-xl font-bold text-gray-900">SVN NAHAN</h1>
							<p class="text-xs text-gray-500 -mt-1">Student Result Portal</p>
						</div>
					</a>
				</div>
			</div>

			<!-- Navigation Links -->
			<div class="flex items-center space-x-8">
				<a 
					href="/" 
					class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200 {$page.url.pathname === '/' ? 'text-blue-600 border-b-2 border-blue-600' : ''}"
				>
					View Results
				</a>
				<a 
					href="/lookup" 
					class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200 {$page.url.pathname === '/lookup' ? 'text-blue-600 border-b-2 border-blue-600' : ''}"
				>
					Find Admission Number
				</a>
			</div>
		</div>
	</div>
</nav>

<!-- Main Content -->
<main class="min-h-screen bg-gray-50">
	{@render children?.()}
</main>

<!-- Footer -->
<footer class="bg-white border-t border-gray-200">
	<div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<p class="text-sm text-gray-500">
				© 2024 SVN NAHAN. All rights reserved. | Student Result Management System
			</p>
		</div>
	</div>
</footer>
