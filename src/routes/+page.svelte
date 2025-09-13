<script lang="ts">
	import { supabase } from '$lib/supabase'
	import type { TestResult, TestResultWithStudent } from '$lib/types/database'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'

	let admissionNo = $state('')
	let results: TestResultWithStudent[] = $state([])
	let filteredResults: TestResultWithStudent[] = $state([])
	let loading = $state(false)
	let error = $state('')
	let searched = $state(false)
	let selectedSubject = $state('all')
	let availableSubjects: string[] = $state([])
	let selectedDate = $state('all')
	let availableDates: string[] = $state([])

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
			// Join with students table to get class information
			const { data, error: supabaseError } = await supabase
				.from('test_results')
				.select(`
					*,
					students!inner(class)
				`)
				.eq('admission_no', admissionNo.trim())
				.order('test_date', { ascending: false })

			if (supabaseError) {
				throw supabaseError
			}

			results = data || []
			if (results.length === 0) {
				error = 'No results found for this admission number'
			} else {
				// Get class level from the joined student data
				const classLevel = results[0]?.students?.class || 'X'
				const isJuniorClass = ['NUR', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].includes(classLevel)
				
				if (isJuniorClass) {
					// Extract unique exam types for junior classes
					availableSubjects = [...new Set(results.map(r => r.test_category).filter((category): category is string => Boolean(category)))].sort()
				} else {
					// Extract unique subjects for senior classes
					availableSubjects = [...new Set(results.map(r => r.subject_name))].sort()
				}
				
				// Select first option by default
				selectedSubject = availableSubjects[0] || ''
				selectedDate = 'all' // Show all dates by default
				
				// Update available dates based on selected subject/exam type
				updateAvailableDates()
				
				
				updateFilteredResults()
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred while fetching results'
			results = []
			filteredResults = []
			availableSubjects = []
			availableDates = []
		} finally {
			loading = false
		}
	}

	function updateFilteredResults() {
		// Determine if this is a junior class (below IX)
		const currentClass = getCurrentClass()
		const isJuniorClass = ['NUR', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].includes(currentClass)
		
		// First filter by subject/exam type
		let filtered = results
		if (isJuniorClass) {
			// Filter by exam type for junior classes
			filtered = results.filter(result => result.test_category === selectedSubject)
		} else {
			// Filter by subject for senior classes
			filtered = results.filter(result => result.subject_name === selectedSubject)
		}
		
		// Then filter by date if a specific date is selected
		if (selectedDate !== 'all') {
			filtered = filtered.filter(result => result.test_date === selectedDate)
		}
		
		filteredResults = filtered
	}
	
	function getCurrentClass() {
		// Get class from the joined student data in results
		if (results.length > 0 && results[0]?.students?.class) {
			return results[0].students.class
		}
		return 'X' // Default fallback
	}

	function updateAvailableDates() {
		// Determine if this is a junior class (below IX)
		const currentClass = getCurrentClass()
		const isJuniorClass = ['NUR', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].includes(currentClass)
		
		// Filter results based on selected subject/exam type first
		let subjectFilteredResults = results
		if (isJuniorClass) {
			// Filter by exam type for junior classes
			subjectFilteredResults = results.filter(result => result.test_category === selectedSubject)
		} else {
			// Filter by subject for senior classes
			subjectFilteredResults = results.filter(result => result.subject_name === selectedSubject)
		}
		
		// Extract unique dates from the filtered results
		availableDates = [...new Set(subjectFilteredResults.map(r => r.test_date))].sort().reverse() // Most recent first
		
		// Reset date selection if current selection is not available
		if (selectedDate !== 'all' && !availableDates.includes(selectedDate)) {
			selectedDate = 'all'
		}
	}

	function handleSubjectChange() {
		updateAvailableDates()
		updateFilteredResults()
	}
	
	function handleDateChange() {
		updateFilteredResults()
	}
	

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			fetchResults()
		}
	}

	function groupResultsBySubject(results: TestResultWithStudent[]) {
		return results.reduce((groups: Record<string, TestResultWithStudent[]>, result) => {
			const key = result.subject_name;
			if (!groups[key]) groups[key] = [];
			groups[key].push(result);
			return groups;
		}, {})
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
		availableDates = []
		selectedSubject = ''
		selectedDate = 'all'
		error = ''
		searched = false
	}
</script>

<svelte:head>
	<title>View Results - SVN NAHAN</title>
</svelte:head>

<div class="py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Page Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">View Test Results</h1>
			<p class="text-gray-600">Enter your admission number to access your academic performance</p>
		</div>

		<!-- Search Form - Only show if no results -->
		{#if !searched || results.length === 0}
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
			<div class="space-y-6">
				<div>
					<label for="admission-no" class="block text-sm font-semibold text-gray-900 mb-3">
						Admission Number
					</label>
					<div class="relative">
						<input
							id="admission-no"
							type="text"
							bind:value={admissionNo}
							onkeypress={handleKeyPress}
							placeholder="e.g., S24/29, P22/51"
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg"
							disabled={loading}
						/>
					</div>
				</div>
				
				<div class="flex flex-col sm:flex-row gap-3">
					<button
						onclick={fetchResults}
						disabled={loading || !admissionNo.trim()}
						class="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold text-center"
					>
						{loading ? 'Searching...' : 'View Results'}
					</button>
					{#if searched}
						<button
							onclick={reset}
							class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
						>
							Clear
						</button>
					{/if}
				</div>
				
				<div class="pt-4 border-t border-gray-100">
					<div class="text-center">
						<p class="text-sm text-gray-600 mb-2">Don't have your admission number?</p>
						<a
							href="/lookup"
							class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition duration-200"
						>
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
							Find Your Admission Number
						</a>
					</div>
				</div>
			</div>
		</div>
		{/if}

		<!-- Error Message -->
		{#if error}
			<div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div class="ml-3">
						<p class="text-sm font-medium text-red-800">{error}</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Simple Results Summary -->
		{#if results.length > 0}
			<div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-semibold text-gray-900">Your Results</h3>
					<div class="text-sm text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
						{filteredResults.length} test{filteredResults.length !== 1 ? 's' : ''} found
					</div>
				</div>
				
				<!-- Simple Subject Filter -->
				{#if availableSubjects.length > 1}
					{@const currentClass = getCurrentClass()}
					{@const isJuniorClass = ['NUR', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].includes(currentClass)}
					<div class="mb-4">
						<label for="subject-select" class="block text-sm font-medium text-gray-700 mb-2">
							{isJuniorClass ? 'Exam Type' : 'Subject'}
						</label>
						<select 
							id="subject-select"
							bind:value={selectedSubject} 
							onchange={handleSubjectChange}
							class="w-full max-w-xs px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
						>
							{#each availableSubjects as subject}
								<option value={subject}>{subject}</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Simple Date Filter -->
				{#if availableDates.length > 1}
					<div>
						<label for="date-select" class="block text-sm font-medium text-gray-700 mb-2">Test Date</label>
						<select 
							id="date-select"
							bind:value={selectedDate} 
							onchange={handleDateChange}
							class="w-full max-w-xs px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
						>
							<option value="all">All Dates</option>
							{#each availableDates as date}
								<option value={date}>{formatDate(date)}</option>
							{/each}
						</select>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Results Display -->
		{#if filteredResults.length > 0}
			{@const currentClass = getCurrentClass()}
			{@const isJuniorClass = ['NUR', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].includes(currentClass)}
			
			<!-- Results Header -->
			<div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-200 p-6 mb-6">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between">
					<div>
						<h2 class="text-xl font-semibold text-gray-900">
							Test Results - {selectedSubject}
						</h2>
						<p class="text-sm text-gray-600 mt-1">
							<span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2">{admissionNo}</span>
							<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2">Class {currentClass}</span>
							{#if selectedDate !== 'all'}
								<span class="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">{formatDate(selectedDate)}</span>
							{/if}
						</p>
					</div>
					<div class="mt-2 sm:mt-0">
						<button
							onclick={reset}
							class="text-sm text-gray-500 hover:text-gray-700 underline"
						>
							Search Another Student
						</button>
					</div>
				</div>
			</div>

			<!-- Mobile-Optimized Results - Grouped by Subject -->
			<div class="space-y-6">
				{#each Object.entries(groupResultsBySubject(filteredResults)) as [subjectName, subjectResults]}
					<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
						<!-- Subject Header -->
						<div class="bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-4 border-b border-gray-200">
							<h3 class="text-xl font-bold text-gray-900">{subjectName}</h3>
							<p class="text-sm text-gray-600 mt-1">{subjectResults.length} test{subjectResults.length !== 1 ? 's' : ''}</p>
						</div>
						
						<!-- Tests for this subject -->
						<div class="divide-y divide-gray-100">
							{#each subjectResults as result}
								<div class="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
									<!-- Test Header -->
									<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
										<div class="flex-1">
											<div class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
												<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
													{formatDate(result.test_date)}
												</span>
												{#if result.test_category}
													<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
														{result.test_category}
													</span>
												{/if}
												{#if result.attendance}
													<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
														{calculatePercentage(result.marks_obtained, result.max_marks)}%
													</span>
												{/if}
											</div>
										</div>
										{#if !result.attendance}
											<div class="mt-2 sm:mt-0">
												<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
													Absent
												</span>
											</div>
										{/if}
									</div>

									<!-- Scores Row -->
									{#if result.attendance}
										<div class="text-center p-4 bg-green-50 rounded-lg">
											<div class="text-3xl font-bold text-green-700">
												{result.marks_obtained}<span class="text-3xl text-gray-600 font-bold">/{result.max_marks}</span>
											</div>
											<div class="text-sm text-green-600 font-medium">Score</div>
										</div>
									{:else}
										<div class="text-center p-4 bg-gray-50 rounded-lg">
											<div class="text-sm text-gray-500 italic">Marks not available (Student was absent)</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else if searched && !loading && !error && results.length > 0 && filteredResults.length === 0}
			<div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-semibold text-yellow-800">No Results for {selectedSubject}</h3>
						<p class="text-sm text-yellow-700 mt-1">Try selecting a different subject from the filter above.</p>
					</div>
				</div>
			</div>
		{:else if searched && !loading && !error && results.length === 0}
			<div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-semibold text-yellow-800">No Results Found</h3>
						<p class="text-sm text-yellow-700 mt-1">No test results found for admission number: <span class="font-medium">{admissionNo}</span></p>
						<p class="text-xs text-yellow-600 mt-1">Please verify the admission number and try again.</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Instructions -->
		{#if !searched}
			<div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
				<div class="flex items-start">
					<div class="flex-shrink-0">
						<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-semibold text-blue-800 mb-2">How to Access Your Results</h3>
						<ul class="text-sm text-blue-700 space-y-1">
							<li>Enter your admission number in the field above</li>
							<li>Click "View Results" to see your academic performance</li>
							<li>Use subject filters to view specific subject results</li>
							<li>Each result shows marks, percentage, grade, and attendance status</li>
						</ul>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
