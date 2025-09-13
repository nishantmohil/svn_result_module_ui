<script lang="ts">
	import { supabase } from '$lib/supabase'
	import type { Student } from '$lib/types/database'
	import { goto } from '$app/navigation'

	let currentStep = $state(1)
	let selectedClass = $state('')
	let selectedSection = $state('')
	let selectedStudent: Student | null = $state(null)
	let dateOfBirth = $state('')
	let loading = $state(false)
	let error = $state('')
	let students: Student[] = $state([])
	let foundAdmissionNo = $state('')

	const classes = ['NUR', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
	const sections = ['A', 'B', 'C', 'D', 'E']


	async function selectClass(className: string) {
		selectedClass = className
		selectedSection = ''
		selectedStudent = null
		students = []
		error = ''
		currentStep = 2
	}

	async function selectSection(section: string) {
		selectedSection = section
		selectedStudent = null
		error = ''
		loading = true

		try {
			const { data, error: supabaseError } = await supabase
				.from('students')
				.select('*')
				.eq('class', selectedClass)
				.eq('section_name', selectedSection)
				.order('student_name')

			if (supabaseError) {
				throw supabaseError
			}

			students = data || []
			
			if (students.length === 0) {
				error = `No students found in Class ${selectedClass}-${selectedSection}`
			} else {
				currentStep = 3
			}
		} catch (err) {
			if (err instanceof Error) {
				if (err.message.includes('relation "public.students" does not exist')) {
					error = 'Database setup incomplete: Students table does not exist. Please check the SETUP.md file for database setup instructions.'
				} else if (err.message.includes('Invalid API key')) {
					error = 'Database connection error: Invalid API key. Please check your Supabase configuration.'
				} else if (err.message.includes('Failed to fetch')) {
					error = 'Network error: Cannot connect to database. Please check your internet connection.'
				} else {
					error = `Database error: ${err.message}`
				}
			} else {
				error = 'Error loading students'
			}
		} finally {
			loading = false
		}
	}

	function selectStudent(student: Student) {
		selectedStudent = student
		dateOfBirth = ''
		error = ''
		foundAdmissionNo = ''
		currentStep = 4
	}

	async function verifyAndGetAdmission() {
		if (!dateOfBirth.trim() || !selectedStudent) {
			error = 'Please enter your date of birth'
			return
		}

		loading = true
		error = ''

		try {
			// Verify date of birth matches
			if (selectedStudent.student_dob === dateOfBirth) {
				foundAdmissionNo = selectedStudent.admission_no
				currentStep = 5
			} else {
				error = 'Date of birth does not match our records. Please check and try again.'
			}
		} catch (err) {
			error = 'Error verifying information'
		} finally {
			loading = false
		}
	}

	function goToResults() {
		goto(`/?admission=${foundAdmissionNo}`)
	}

	function resetLookup() {
		currentStep = 1
		selectedClass = ''
		selectedSection = ''
		selectedStudent = null
		dateOfBirth = ''
		students = []
		error = ''
		foundAdmissionNo = ''
	}

	function goBack() {
		if (currentStep > 1) {
			currentStep--
			error = ''
			if (currentStep === 1) {
				selectedClass = ''
				selectedSection = ''
				selectedStudent = null
				students = []
			} else if (currentStep === 2) {
				selectedSection = ''
				selectedStudent = null
				students = []
			} else if (currentStep === 3) {
				selectedStudent = null
			}
		}
	}
</script>

<svelte:head>
	<title>Find Admission Number - SVN NAHAN</title>
</svelte:head>

<div class="py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Page Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Find Your Admission Number</h1>
			<p class="text-gray-600">Secure process to retrieve your admission number using personal verification</p>
		</div>

		<!-- Progress Indicator -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
			<div class="flex items-center justify-between mb-4">
				{#each Array(5) as _, i}
					<div class="flex items-center">
						<div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200
							{i + 1 < currentStep ? 'bg-blue-600 text-white' : 
							i + 1 === currentStep ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 
							'bg-gray-100 text-gray-400'}">
							{i + 1 < currentStep ? '✓' : i + 1}
						</div>
						{#if i < 4}
							<div class="flex-1 h-2 mx-4 bg-gray-200 rounded-full overflow-hidden">
								<div class="h-full bg-blue-600 transition-all duration-300 {i + 1 < currentStep ? 'w-full' : 'w-0'}"></div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="flex justify-between text-xs font-medium text-gray-600">
				<span>Select Class</span>
				<span>Select Section</span>
				<span>Choose Name</span>
				<span>Verify Identity</span>
				<span>Access Results</span>
			</div>
		</div>

		<!-- Main Content -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
			<!-- Navigation -->
			<div class="flex justify-between items-center mb-8">
				<div class="flex gap-3">
					{#if currentStep > 1}
						<button
							onclick={goBack}
							class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
						>
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
							</svg>
							Back
						</button>
					{/if}
				</div>
				<button
					onclick={resetLookup}
					class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
				>
					Start Over
				</button>
			</div>

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

			<!-- Step 1: Select Class -->
			{#if currentStep === 1}
				<div class="space-y-6">
					<div>
						<h2 class="text-2xl font-bold text-gray-900 mb-2">Select Your Class</h2>
						<p class="text-gray-600">Choose your current class from the options below</p>
					</div>
					<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
						{#each classes as className}
							<button
								onclick={() => selectClass(className)}
								class="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center font-semibold text-gray-900 hover:text-blue-600"
							>
								{className}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 2: Select Section -->
			{#if currentStep === 2}
				<div class="space-y-6">
					<div>
						<h2 class="text-2xl font-bold text-gray-900 mb-2">Select Your Section</h2>
						<p class="text-gray-600">Class: <span class="font-semibold text-blue-600">{selectedClass}</span></p>
					</div>
					<div class="grid grid-cols-5 gap-3 max-w-lg">
						{#each sections as section}
							<button
								onclick={() => selectSection(section)}
								disabled={loading}
								class="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center font-semibold text-gray-900 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{section}
							</button>
						{/each}
					</div>
					{#if loading}
						<div class="flex items-center space-x-2 text-blue-600">
							<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span class="font-medium">Loading students...</span>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Step 3: Select Student Name -->
			{#if currentStep === 3}
				<div class="space-y-6">
					<div>
						<h2 class="text-2xl font-bold text-gray-900 mb-2">Select Your Name</h2>
						<p class="text-gray-600">Class: <span class="font-semibold text-blue-600">{selectedClass}-{selectedSection}</span> | {students.length} student{students.length !== 1 ? 's' : ''} found</p>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
						{#each students as student}
							<button
								onclick={() => selectStudent(student)}
								class="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
							>
								<div class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{student.student_name}</div>
								<div class="text-sm text-gray-500 mt-1">Roll Number: {student.roll_no}</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 4: Verify Date of Birth -->
			{#if currentStep === 4}
				<div class="space-y-6">
					<div>
						<h2 class="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
						<p class="text-gray-600">Please enter your date of birth to confirm your identity</p>
					</div>
					
					<div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
						<h3 class="font-semibold text-blue-900 mb-2">Selected Student Information</h3>
						<div class="space-y-1 text-sm">
							<p class="text-blue-800">Name: <span class="font-medium">{selectedStudent?.student_name}</span></p>
							<p class="text-blue-800">Class: <span class="font-medium">{selectedClass}-{selectedSection}</span></p>
							<p class="text-blue-800">Roll Number: <span class="font-medium">{selectedStudent?.roll_no}</span></p>
						</div>
					</div>
					
					<div class="max-w-md space-y-4">
						<div>
							<label for="dob-verify" class="block text-sm font-semibold text-gray-900 mb-2">
								Date of Birth
							</label>
							<input
								id="dob-verify"
								type="date"
								bind:value={dateOfBirth}
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
								disabled={loading}
							/>
						</div>
						<button
							onclick={verifyAndGetAdmission}
							disabled={loading || !dateOfBirth.trim()}
							class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold"
						>
							{#if loading}
								<div class="flex items-center justify-center space-x-2">
									<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									<span>Verifying...</span>
								</div>
							{:else}
								Verify & Get Admission Number
							{/if}
						</button>
					</div>
				</div>
			{/if}

			<!-- Step 5: Success - Show Admission Number -->
			{#if currentStep === 5}
				<div class="text-center space-y-6">
					<div class="space-y-4">
						<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
							<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
						<div>
							<h2 class="text-3xl font-bold text-gray-900 mb-2">Verification Successful</h2>
							<p class="text-gray-600">Your admission number has been retrieved successfully</p>
						</div>
					</div>

					<div class="bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
						<h3 class="font-semibold text-green-900 mb-3">Student Information</h3>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-green-700">Name:</span>
								<span class="font-medium text-green-900">{selectedStudent?.student_name}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-green-700">Class:</span>
								<span class="font-medium text-green-900">{selectedClass}-{selectedSection}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-green-700">Roll Number:</span>
								<span class="font-medium text-green-900">{selectedStudent?.roll_no}</span>
							</div>
						</div>
						<div class="mt-4 pt-4 border-t border-green-200">
							<p class="text-sm text-green-700 mb-1">Admission Number</p>
							<p class="text-2xl font-bold text-green-600">{foundAdmissionNo}</p>
						</div>
					</div>

					<div class="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							onclick={goToResults}
							class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-lg"
						>
							View My Results
						</button>
						<button
							onclick={resetLookup}
							class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
						>
							Find Another Student
						</button>
					</div>
					
					<div class="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
						<p class="text-sm text-blue-800">
							<span class="font-medium">Next step:</span> Click "View My Results" to automatically load your test results
						</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Help Section -->
		{#if currentStep < 5}
			<div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
				<div class="flex items-start">
					<div class="flex-shrink-0">
						<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-semibold text-blue-800 mb-2">How This Process Works</h3>
						<ul class="text-sm text-blue-700 space-y-1">
							<li>Follow the secure verification steps in order</li>
							<li>Select your class and section carefully</li>
							<li>Your admission number is protected until identity verification</li>
							<li>Date of birth must match school records exactly</li>
							<li>Contact school office if you cannot find your information</li>
						</ul>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

