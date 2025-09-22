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
<nav class="bg-white shadow-sm border-b-2 border-blue-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo and School Name -->
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<a href="/" class="flex items-center space-x-2 sm:space-x-3" onclick={closeMobileMenu}>
						<div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center border-2 border-blue-500">
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
			<div class="hidden md:flex items-center space-x-4">
				<a 
					href="/" 
					class="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 {$page.url.pathname === '/' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-2 border-blue-500 shadow-sm' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200'}"
				>
					View Results
				</a>
				<a 
					href="/lookup" 
					class="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 {$page.url.pathname === '/lookup' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-500 shadow-sm' : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50 border-2 border-transparent hover:border-purple-200'}"
				>
					Find Admission Number
				</a>
				<a 
					href="/attendance" 
					class="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 {$page.url.pathname === '/attendance' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-2 border-green-500 shadow-sm' : 'text-gray-700 hover:text-green-600 hover:bg-green-50 border-2 border-transparent hover:border-green-200'}"
				>
					Attendance Sheets
				</a>
			</div>

			<!-- Mobile menu button -->
			<div class="md:hidden">
				<button
					onclick={toggleMobileMenu}
					class="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 border-2 border-transparent hover:border-blue-200"
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
				<div class="px-2 pt-2 pb-3 space-y-2 sm:px-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
					<a 
						href="/" 
						onclick={closeMobileMenu}
						class="block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 {$page.url.pathname === '/' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-2 border-blue-500 shadow-sm' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-100 border-2 border-transparent hover:border-blue-200'}"
					>
						View Results
					</a>
					<a 
						href="/lookup" 
						onclick={closeMobileMenu}
						class="block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 {$page.url.pathname === '/lookup' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-500 shadow-sm' : 'text-gray-700 hover:text-purple-600 hover:bg-purple-100 border-2 border-transparent hover:border-purple-200'}"
					>
						Find Admission Number
					</a>
					<a 
						href="/attendance" 
						onclick={closeMobileMenu}
						class="block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 {$page.url.pathname === '/attendance' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-2 border-green-500 shadow-sm' : 'text-gray-700 hover:text-green-600 hover:bg-green-100 border-2 border-transparent hover:border-green-200'}"
					>
						Attendance Sheets
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
				© 2025 SVN NAHAN. All rights reserved. | Student Result Management System
			</p>
		</div>
	</div>
</footer>
