<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores'
	
	let { children } = $props();
	let mobileMenuOpen = $state(false);
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Navigation -->
<nav class="bg-white shadow-sm border-b-2 border-gray-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo and School Name -->
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<a href="/" class="flex items-center space-x-2 sm:space-x-3" onclick={closeMobileMenu}>
						<div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
							<span class="text-white font-bold text-sm sm:text-lg">S</span>
						</div>
						<div>
							<h1 class="text-lg sm:text-xl font-bold text-gray-900">SVN NAHAN</h1>
							<p class="text-xs text-gray-500 -mt-1 hidden sm:block">Student Result Portal</p>
						</div>
					</a>
				</div>
			</div>

			<!-- Desktop Navigation Links -->
			<div class="hidden md:flex items-center space-x-8">
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

			<!-- Mobile menu button -->
			<div class="md:hidden">
				<button
					onclick={toggleMobileMenu}
					class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
					aria-expanded="false"
				>
					<span class="sr-only">Open main menu</span>
					<!-- Hamburger icon -->
					<svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Mobile Navigation Menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden">
				<div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
					<a 
						href="/" 
						onclick={closeMobileMenu}
						class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 {$page.url.pathname === '/' ? 'text-blue-600 bg-blue-100' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-100'}"
					>
						View Results
					</a>
					<a 
						href="/lookup" 
						onclick={closeMobileMenu}
						class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 {$page.url.pathname === '/lookup' ? 'text-blue-600 bg-blue-100' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-100'}"
					>
						Find Admission Number
					</a>
				</div>
			</div>
		{/if}
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
