<script lang="ts">
	import { supabase } from '$lib/supabase'
	import type { TestResult, TestResultWithStudent } from '$lib/types/database'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'

	let admissionNo = $state('')
	let studentName = $state('')
	let results: TestResultWithStudent[] = $state([])
	let filteredResults: TestResultWithStudent[] = $state([])
	let loading = $state(false)
	let error = $state('')
	let searched = $state(false)
	let selectedSubject = $state('')
	let availableSubjects: string[] = $state([])
	let selectedDate = $state('all')
	let availableDates: string[] = $state([])
	let showResults = $state(false)
	
	// OTP-style input states
	let input1 = $state('') // Alphabet
	let input2 = $state('') // Number
	let input3 = $state('') // Number
	let input4 = $state('') // Number
	let input5 = $state('') // Number

	// Check for admission parameter in URL and auto-search
	onMount(() => {
		const urlAdmission = $page.url.searchParams.get('admission')
		if (urlAdmission) {
			admissionNo = urlAdmission
			// Parse the admission number into OTP inputs
			parseAdmissionToInputs(urlAdmission)
			// Small delay to show the auto-population visually
			setTimeout(() => {
				fetchResults()
			}, 100)
		}
	})

	// Parse admission number into OTP inputs
	function parseAdmissionToInputs(admission: string) {
		const parts = admission.split('/')
		if (parts.length === 2) {
			input1 = parts[0].charAt(0) || ''
			input2 = parts[0].charAt(1) || ''
			input3 = parts[0].charAt(2) || ''
			input4 = parts[1].charAt(0) || ''
			input5 = parts[1].charAt(1) || ''
		}
	}

	// Build admission number from OTP inputs
	function buildAdmissionNumber() {
		const part1 = input1 + input2 + input3
		const part2 = input4 + input5
		return `${part1}/${part2}`
	}

	// Handle input changes and auto-focus
	function handleInputChange(inputNumber: number, value: string, event: Event) {
		// Remove any non-alphanumeric characters
		let cleanValue = value.replace(/[^a-zA-Z0-9]/g, '')
		
		if (inputNumber === 1) {
			// First input: only alphabets
			cleanValue = cleanValue.replace(/[^a-zA-Z]/g, '').toUpperCase()
			input1 = cleanValue
			if (cleanValue && input2 === '') {
				// Auto-focus to next input
				setTimeout(() => {
					const nextInput = document.getElementById('input-2')
					nextInput?.focus()
				}, 0)
			}
		} else {
			// Other inputs: only numbers
			cleanValue = cleanValue.replace(/[^0-9]/g, '')
			
			if (inputNumber === 2) {
				input2 = cleanValue
				if (cleanValue && input3 === '') {
					setTimeout(() => {
						const nextInput = document.getElementById('input-3')
						nextInput?.focus()
					}, 0)
				}
			} else if (inputNumber === 3) {
				input3 = cleanValue
				if (cleanValue && input4 === '') {
					setTimeout(() => {
						const nextInput = document.getElementById('input-4')
						nextInput?.focus()
					}, 0)
				}
			} else if (inputNumber === 4) {
				input4 = cleanValue
				if (cleanValue && input5 === '') {
					setTimeout(() => {
						const nextInput = document.getElementById('input-5')
						nextInput?.focus()
					}, 0)
				}
			} else if (inputNumber === 5) {
				input5 = cleanValue
			}
		}
		
		// Update admission number
		admissionNo = buildAdmissionNumber()
	}

	// Handle keydown events for backspace navigation
	function handleKeyDown(inputNumber: number, event: KeyboardEvent) {
		// Handle backspace
		if (event.key === 'Backspace' && !(event.currentTarget as HTMLInputElement)?.value) {
			if (inputNumber === 2 && input1) {
				setTimeout(() => {
					const prevInput = document.getElementById('input-1')
					prevInput?.focus()
				}, 0)
			} else if (inputNumber === 3 && input2) {
				setTimeout(() => {
					const prevInput = document.getElementById('input-2')
					prevInput?.focus()
				}, 0)
			} else if (inputNumber === 4 && input3) {
				setTimeout(() => {
					const prevInput = document.getElementById('input-3')
					prevInput?.focus()
				}, 0)
			} else if (inputNumber === 5 && input4) {
				setTimeout(() => {
					const prevInput = document.getElementById('input-4')
					prevInput?.focus()
				}, 0)
			}
		}
	}


	async function fetchResults() {
		if (!admissionNo.trim()) {
			error = 'Please enter an admission number'
			return
		}

		loading = true
		error = ''
		searched = true

		try {
			// Join with students table to get class information and student name
			const { data, error: supabaseError } = await supabase
				.from('test_results')
				.select(`
					*,
					students!inner(class, student_name)
				`)
				.eq('admission_no', admissionNo.trim())
				.order('test_date', { ascending: false })

			if (supabaseError) {
				throw supabaseError
			}

			results = data || []
			if (results.length === 0) {
				error = 'No results found for this admission number'
				studentName = ''
			} else {
				// Get student name from the first result
				studentName = results[0]?.students?.student_name || 'Student'
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
				
				// Don't select any subject by default - let user choose
				selectedSubject = ''
				selectedDate = 'all' // Show all dates by default
				showResults = false // Don't show results yet
				
				// Update available dates based on selected subject/exam type
				updateAvailableDates()
				
				// Clear URL parameter after successful search to prevent auto-search on refresh
				if ($page.url.searchParams.has('admission')) {
					goto('/', { replaceState: true })
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred while fetching results'
			results = []
			filteredResults = []
			availableSubjects = []
			availableDates = []
			studentName = ''
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
	
	function viewResults() {
		if (!selectedSubject) {
			error = 'Please select a subject first'
			return
		}
		showResults = true
		updateFilteredResults()
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
		showResults = false
		error = ''
		searched = false
		studentName = ''
		// Clear OTP inputs
		input1 = ''
		input2 = ''
		input3 = ''
		input4 = ''
		input5 = ''
	}
</script>

<svelte:head>
	<title>View Results - SVN NAHAN</title>
</svelte:head>

<div class="py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Page Header - Only show when no search has been performed -->
		{#if !searched}
			<div class="mb-8">
				<h1 class="text-xl font-bold text-gray-900 mb-2 text-center">S.V.N  Academic reporting module </h1>
				<p class="text-gray-600 text-center">Enter your admission number to access your academic performance</p>
			</div>
		{/if}


		<!-- Search Form - Only show if no search has been performed -->
		{#if !searched}
			<div class="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-8 mb-8">
			<div class="space-y-6">
				<div>
					<label for="input-1" class="block text-sm font-semibold text-gray-900 mb-3">
						Admission Number
					</label>
					<div class="flex items-center justify-center space-x-2">
						<!-- Input 1: Alphabet -->
						<input
							id="input-1"
							type="text"
							bind:value={input1}
							oninput={(e) => handleInputChange(1, e.currentTarget.value, e)}
							onkeydown={(e) => handleKeyDown(1, e)}
							maxlength="1"
							class="w-12 h-12 text-center text-lg font-bold border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 hover:border-blue-400 uppercase"
							disabled={loading}
						/>
						
						<!-- Input 2: Number -->
						<input
							id="input-2"
							type="text"
							inputmode="numeric"
							bind:value={input2}
							oninput={(e) => handleInputChange(2, e.currentTarget.value, e)}
							onkeydown={(e) => handleKeyDown(2, e)}
							maxlength="1"
							class="w-12 h-12 text-center text-lg font-bold border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 hover:border-blue-400"
							disabled={loading}
						/>
						
						<!-- Input 3: Number -->
						<input
							id="input-3"
							type="text"
							inputmode="numeric"
							bind:value={input3}
							oninput={(e) => handleInputChange(3, e.currentTarget.value, e)}
							onkeydown={(e) => handleKeyDown(3, e)}
							maxlength="1"
							class="w-12 h-12 text-center text-lg font-bold border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 hover:border-blue-400"
							disabled={loading}
						/>
						
						<!-- Forward Slash (Fixed) -->
						<div class="w-8 h-12 flex items-center justify-center">
							<span class="text-2xl font-bold text-gray-500">/</span>
						</div>
						
						<!-- Input 4: Number -->
						<input
							id="input-4"
							type="text"
							inputmode="numeric"
							bind:value={input4}
							oninput={(e) => handleInputChange(4, e.currentTarget.value, e)}
							onkeydown={(e) => handleKeyDown(4, e)}
							maxlength="1"
							class="w-12 h-12 text-center text-lg font-bold border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 hover:border-blue-400"
							disabled={loading}
						/>
						
						<!-- Input 5: Number -->
						<input
							id="input-5"
							type="text"
							inputmode="numeric"
							bind:value={input5}
							oninput={(e) => handleInputChange(5, e.currentTarget.value, e)}
							onkeydown={(e) => handleKeyDown(5, e)}
							maxlength="1"
							class="w-12 h-12 text-center text-lg font-bold border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 hover:border-blue-400"
							disabled={loading}
						/>
					</div>
					<p class="text-xs text-gray-500 mt-2 text-center">Format: H34/89 (First letter, then numbers)</p>
				</div>
				
				<div class="flex flex-col sm:flex-row gap-3">
					<button
						onclick={fetchResults}
						disabled={loading || !admissionNo.trim()}
						class="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold text-center border-2 border-blue-500 hover:border-blue-600"
					>
						{loading ? 'Searching...' : 'View Results'}
					</button>
					{#if searched}
						<button
							onclick={reset}
							class="px-6 py-3 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-lg hover:from-gray-200 hover:to-slate-200 transition duration-200 font-medium border-2 border-gray-300 hover:border-gray-400"
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
			<div class="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 mb-6">
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

		<!-- Subject and Date Selection Interface -->
		{#if searched && !showResults && results.length > 0}
			{@const currentClass = getCurrentClass()}
			{@const isJuniorClass = ['NUR', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].includes(currentClass)}
			
			<div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border-2 border-blue-200 p-6 mb-6">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
					<div>
						<h2 class="text-xl font-semibold text-gray-900">
							{studentName}'s Test Results
						</h2>
						<p class="text-sm text-gray-600 mt-1">
							<span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2">{admissionNo}</span>
							<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2">Class {currentClass}</span>
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
				
				<!-- Subject and Date Selection -->
				<div class="space-y-6">
					<!-- Subject Selection -->
					{#if availableSubjects.length > 0}
						<div>
							{#if isJuniorClass}
								<!-- Dropdown for Junior Classes -->
								<div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
									<label for="subject-select" class="block text-sm font-semibold text-purple-800 mb-3 flex items-center">
										<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
										</svg>
										Select Exam Type
									</label>
									<select 
										id="subject-select"
										bind:value={selectedSubject} 
										onchange={handleSubjectChange}
										class="w-full px-3 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm font-medium text-gray-900 hover:border-purple-400 transition-colors cursor-pointer"
									>
										<option value="">Choose an exam type...</option>
										{#each availableSubjects as subject}
											<option value={subject}>{subject}</option>
										{/each}
									</select>
								</div>
							{:else}
								<!-- Tabs for Senior Classes (IX and above) -->
								<div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
									<div class="block text-sm font-semibold text-purple-800 mb-3 flex items-center">
										<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
										</svg>
										Select Subject
									</div>
									<div class="flex flex-wrap gap-2">
										{#each availableSubjects as subject}
											<button
												onclick={() => {
													selectedSubject = subject;
													handleSubjectChange();
												}}
												class="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 {selectedSubject === subject ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300 shadow-sm' : 'text-purple-700 hover:text-purple-600 hover:bg-purple-50 border-purple-200 hover:border-purple-300'}"
											>
												{subject}
											</button>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}

					<!-- Date Selection -->
					{#if availableDates.length > 1}
						<div class="bg-green-50 border border-green-200 rounded-lg p-4">
							<label for="date-select" class="block text-sm font-semibold text-green-800 mb-3 flex items-center">
								<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
								</svg>
								Select Test Date
							</label>
							<select 
								id="date-select"
								bind:value={selectedDate} 
								onchange={handleDateChange}
								class="w-full px-3 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm font-medium text-gray-900 hover:border-green-400 transition-colors cursor-pointer"
							>
								<option value="all">All Dates</option>
								{#each availableDates as date}
									<option value={date}>{formatDate(date)}</option>
								{/each}
							</select>
						</div>
					{/if}

					<!-- View Results Button -->
					<div class="flex justify-center">
						<button
							onclick={viewResults}
							disabled={!selectedSubject}
							class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold text-lg border-2 border-blue-500 hover:border-blue-600"
						>
							View Results
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Results Display -->
		{#if searched && showResults && filteredResults.length > 0}
			{@const currentClass = getCurrentClass()}
			{@const isJuniorClass = ['NUR', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].includes(currentClass)}
			
			<!-- Results Header -->
			<div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border-2 border-blue-200 p-6 mb-6">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between">
					<div>
						<h2 class="text-xl font-semibold text-gray-900">
							{studentName}'s Test Results
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
				
				<!-- Quick Filters - Contextual Placement -->
				<div class="mt-4 pt-4 border-t border-indigo-200">
					<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
						<div class="flex items-center">
							<span class="text-sm font-medium text-gray-700 mr-3">
								{filteredResults.length} test{filteredResults.length !== 1 ? 's' : ''} found
							</span>
						</div>
						
						<!-- Quick Filters -->
						<div class="flex flex-col gap-3 w-full">
							<!-- Subject Filter -->
							{#if availableSubjects.length > 1}
								<div class="w-full">
									{#if isJuniorClass}
										<!-- Dropdown for Junior Classes -->
										<div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
											<label for="subject-select" class="block text-sm font-semibold text-purple-800 mb-2 flex items-center">
												<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
												</svg>
												Select Exam Type
											</label>
											<select 
												id="subject-select"
												bind:value={selectedSubject} 
												onchange={handleSubjectChange}
												class="w-full px-3 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm font-medium text-gray-900 hover:border-purple-400 transition-colors cursor-pointer"
											>
												{#each availableSubjects as subject}
													<option value={subject}>{subject}</option>
												{/each}
											</select>
										</div>
									{:else}
										<!-- Tabs for Senior Classes (IX and above) -->
										<div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
											<div class="block text-sm font-semibold text-purple-800 mb-3 flex items-center">
												<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
												</svg>
												Select Subject
											</div>
											<div class="flex flex-wrap gap-2">
												{#each availableSubjects as subject}
													<button
														onclick={() => {
															selectedSubject = subject;
															handleSubjectChange();
														}}
														class="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 {selectedSubject === subject ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300 shadow-sm' : 'text-purple-700 hover:text-purple-600 hover:bg-purple-50 border-purple-200 hover:border-purple-300'}"
													>
														{subject}
													</button>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							{/if}

							<!-- Date Filter -->
							{#if availableDates.length > 1}
								<div class="w-full">
									<div class="bg-green-50 border border-green-200 rounded-lg p-3">
										<label for="date-select" class="block text-sm font-semibold text-green-800 mb-2 flex items-center">
											<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
											</svg>
											Select Test Date
										</label>
										<select 
											id="date-select"
											bind:value={selectedDate} 
											onchange={handleDateChange}
											class="w-full px-3 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm font-medium text-gray-900 hover:border-green-400 transition-colors cursor-pointer"
										>
											<option value="all">All Dates</option>
											{#each availableDates as date}
												<option value={date}>{formatDate(date)}</option>
											{/each}
										</select>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Mobile-Optimized Results - Grouped by Subject -->
			<div class="space-y-6">
				{#each Object.entries(groupResultsBySubject(filteredResults)) as [subjectName, subjectResults]}
					<div class="bg-white rounded-xl shadow-sm border-2 border-purple-200 overflow-hidden">
						<!-- Subject Header -->
						<div class="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b-2 border-purple-200">
							<h3 class="text-xl font-bold text-purple-900">{subjectName}</h3>
							<p class="text-sm text-purple-700 mt-1">{subjectResults.length} test{subjectResults.length !== 1 ? 's' : ''}</p>
						</div>
						
						<!-- Tests for this subject -->
						<div class="divide-y divide-gray-100">
							{#each subjectResults as result}
								<div class="p-4 sm:p-6 hover:bg-purple-50 transition-colors duration-150">
									<!-- Test Header -->
									<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
										<div class="flex-1">
											<div class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
												<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border-2 border-blue-200">
													{formatDate(result.test_date)}
												</span>
												{#if result.test_category}
													<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border-2 border-purple-200">
														{result.test_category}
													</span>
												{/if}
												{#if result.attendance}
													<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border-2 border-orange-200">
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
										<div class="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
											<div class="text-3xl font-bold text-green-700">
												{result.marks_obtained}<span class="text-3xl text-gray-600 font-bold">/{result.max_marks}</span>
											</div>
											<div class="text-sm text-green-600 font-medium">Score</div>
										</div>
									{:else}
										<div class="text-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
											<div class="text-sm text-gray-500 italic">Marks not available (Student was absent)</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else if searched && showResults && !loading && !error && results.length > 0 && filteredResults.length === 0}
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
		{:else if searched && showResults && !loading && !error && results.length === 0}
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
