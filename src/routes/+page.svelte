<script lang="ts">
	import { supabase } from '$lib/supabase'
	import type { TestResult } from '$lib/types/database'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'

	let admissionNo = $state('')
	let results: TestResult[] = $state([])
	let filteredResults: TestResult[] = $state([])
	let loading = $state(false)
	let error = $state('')
	let searched = $state(false)
	let selectedSubject = $state('all')
	let availableSubjects: string[] = $state([])

	// Check for admission parameter in URL and auto-search
	onMount(() => {
		const urlAdmission = $page.url.searchParams.get('admission')
		if (urlAdmission) {
			admissionNo = urlAdmission
			// Small delay to show the auto-population visually
			setTimeout(() => {
				fetchResults()
			}, 100)
		}
	})


	async function fetchResults() {
		if (!admissionNo.trim()) {
			error = 'Please enter an admission number'
			return
		}

		loading = true
		error = ''
		searched = true

		try {
			const { data, error: supabaseError } = await supabase
				.from('test_results')
				.select('*')
				.eq('admission_no', admissionNo.trim())
				.order('test_date', { ascending: false })

			if (supabaseError) {
				throw supabaseError
			}

			results = data || []
			if (results.length === 0) {
				error = 'No results found for this admission number'
			} else {
				// Extract unique subjects for filtering
				availableSubjects = [...new Set(results.map(r => r.subject_name))].sort()
				// Select first subject by default (no "all" option)
				selectedSubject = availableSubjects[0] || ''
				updateFilteredResults()
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred while fetching results'
			results = []
			filteredResults = []
			availableSubjects = []
		} finally {
			loading = false
		}
	}

	function updateFilteredResults() {
		filteredResults = results.filter(result => result.subject_name === selectedSubject)
	}

	function handleSubjectChange() {
		updateFilteredResults()
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			fetchResults()
		}
	}

	function calculatePercentage(obtained: number, max: number): string {
		return ((obtained / max) * 100).toFixed(2)
	}

	function getGrade(percentage: number): string {
		if (percentage >= 90) return 'A+'
		if (percentage >= 80) return 'A'
		if (percentage >= 70) return 'B+'
		if (percentage >= 60) return 'B'
		if (percentage >= 50) return 'C+'
		if (percentage >= 40) return 'C'
		return 'F'
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	}

	function reset() {
		admissionNo = ''
		results = []
		filteredResults = []
		availableSubjects = []
		selectedSubject = ''
		error = ''
		searched = false
	}
</script>

<svelte:head>
	<title>Student Result System</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">Student Result System</h1>
			<p class="text-gray-600">Enter your admission number to view your test results</p>
		</div>

		<!-- Search Form -->
		<div class="bg-white rounded-lg shadow-lg p-6 mb-8">
			<div class="flex flex-col sm:flex-row gap-4">
				<div class="flex-1">
					<label for="admission-no" class="block text-sm font-medium text-gray-700 mb-2">
						Admission Number
					</label>
					<input
						id="admission-no"
						type="text"
						bind:value={admissionNo}
						onkeypress={handleKeyPress}
						placeholder="Enter your admission number"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
						disabled={loading}
					/>
				</div>
				<div class="flex gap-2 sm:items-end">
					<button
						onclick={fetchResults}
						disabled={loading || !admissionNo.trim()}
						class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
					>
						{loading ? 'Searching...' : 'Search Results'}
					</button>
					{#if searched}
						<button
							onclick={reset}
							class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
						>
							Reset
						</button>
					{/if}
				</div>
			</div>
			
			<!-- Find Admission Number Link -->
			<div class="text-center mt-4">
				<a
					href="/lookup"
					class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition duration-200"
				>
					<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
					</svg>
					Don't know your admission number? Find it here
				</a>
			</div>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
					</svg>
					{error}
				</div>
			</div>
		{/if}

		<!-- Subject Cards Filter -->
		{#if results.length > 0 && availableSubjects.length > 0}
			<div class="mb-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Select Subject</h3>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
					{#each availableSubjects as subject}
						<button
							onclick={() => { selectedSubject = subject; updateFilteredResults(); }}
							class="bg-white rounded-lg shadow-md p-4 border-2 transition-all duration-200 hover:shadow-lg text-center
								{selectedSubject === subject ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}"
						>
							<div class="flex flex-col items-center">
								<div class="w-4 h-4 rounded-full mb-2 {selectedSubject === subject ? 'bg-blue-500' : 'bg-gray-300'}"></div>
								<h4 class="font-medium text-gray-900 text-sm leading-tight">{subject}</h4>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Results Display -->
		{#if filteredResults.length > 0}
			<div class="bg-white rounded-lg shadow-lg overflow-hidden">
				<div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
					<h2 class="text-xl font-semibold text-gray-900">
						Test Results for Admission No: {admissionNo}
						<span class="text-blue-600">- {selectedSubject}</span>
					</h2>
					<p class="text-gray-600 mt-1">
						{filteredResults.length} result(s) found for {selectedSubject}
					</p>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-100">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Date</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each filteredResults as result}
								<tr class="hover:bg-gray-50 transition duration-150">
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm font-medium text-gray-900">{result.subject_name}</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm text-gray-900">
											<span class="font-semibold">{result.marks_obtained}</span>
											<span class="text-gray-500">/ {result.max_marks}</span>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{formatDate(result.test_date)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{result.test_category || 'N/A'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full
											{result.attendance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
											{result.attendance ? 'Present' : 'Absent'}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

			</div>
		{:else if searched && !loading && !error && results.length > 0 && filteredResults.length === 0}
			<div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
					</svg>
					No results found for {selectedSubject} subject.
				</div>
			</div>
		{:else if searched && !loading && !error && results.length === 0}
			<div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
				<div class="flex items-center">
					<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
					</svg>
					No results found for admission number: {admissionNo}
				</div>
			</div>
		{/if}

		<!-- Instructions -->
		{#if !searched}
			<div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
				<h3 class="font-medium mb-2">How to use:</h3>
				<ul class="text-sm space-y-1">
					<li>• Enter your admission number in the field above</li>
					<li>• Click "Search Results" or press Enter to view your test results</li>
					<li>• Click on subject cards to view results for that specific subject</li>
					<li>• Your results will show marks, test date, category, and attendance for each test</li>
				</ul>
			</div>
		{/if}
	</div>
</div>
