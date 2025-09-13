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
	<title>Find Your Admission Number - Student Result System</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">Find Your Admission Number</h1>
			<p class="text-gray-600">Follow the steps below to find your admission number</p>
		</div>

		<!-- Progress Indicator -->
		<div class="bg-white rounded-lg shadow-lg p-6 mb-8">
			<div class="flex items-center justify-between mb-4">
				{#each Array(5) as _, i}
					<div class="flex items-center">
						<div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
							{i + 1 <= currentStep ? 'bg-blue-600 text-white' : 
							i + 1 === currentStep ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 
							'bg-gray-200 text-gray-500'}">
							{i + 1}
						</div>
						{#if i < 4}
							<div class="w-full h-1 mx-2 
								{i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}">
							</div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="flex justify-between text-xs text-gray-600">
				<span>Select Class</span>
				<span>Select Section</span>
				<span>Select Name</span>
				<span>Verify DOB</span>
				<span>Get Results</span>
			</div>
		</div>

		<!-- Main Content -->
		<div class="bg-white rounded-lg shadow-lg p-6">
			<!-- Navigation -->
			<div class="flex justify-between items-center mb-6">
				<div class="flex gap-2">
					{#if currentStep > 1}
						<button
							onclick={goBack}
							class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
						>
							← Back
						</button>
					{/if}
					<a
						href="/"
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
					>
						← Main Page
					</a>
				</div>
				<button
					onclick={resetLookup}
					class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
				>
					Start Over
				</button>
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

			<!-- Step 1: Select Class -->
			{#if currentStep === 1}
				<div>
					<h2 class="text-2xl font-semibold text-gray-900 mb-4">Step 1: Select Your Class</h2>
					<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
						{#each classes as className}
							<button
								onclick={() => selectClass(className)}
								class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200 text-center font-medium"
							>
								{className}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 2: Select Section -->
			{#if currentStep === 2}
				<div>
					<h2 class="text-2xl font-semibold text-gray-900 mb-4">Step 2: Select Your Section</h2>
					<p class="text-gray-600 mb-4">Class: <span class="font-medium text-blue-600">{selectedClass}</span></p>
					<div class="grid grid-cols-5 gap-3 max-w-md">
						{#each sections as section}
							<button
								onclick={() => selectSection(section)}
								disabled={loading}
								class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200 text-center font-medium disabled:opacity-50"
							>
								{section}
							</button>
						{/each}
					</div>
					{#if loading}
						<p class="text-blue-600 mt-4">Loading students...</p>
					{/if}
				</div>
			{/if}

			<!-- Step 3: Select Student Name -->
			{#if currentStep === 3}
				<div>
					<h2 class="text-2xl font-semibold text-gray-900 mb-4">Step 3: Select Your Name</h2>
					<p class="text-gray-600 mb-4">Class: <span class="font-medium text-blue-600">{selectedClass}-{selectedSection}</span></p>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
						{#each students as student}
							<button
								onclick={() => selectStudent(student)}
								class="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200 text-left"
							>
								<div class="font-medium text-gray-900">{student.student_name}</div>
								<div class="text-sm text-gray-600">Roll No: {student.roll_no}</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 4: Verify Date of Birth -->
			{#if currentStep === 4}
				<div>
					<h2 class="text-2xl font-semibold text-gray-900 mb-4">Step 4: Verify Your Date of Birth</h2>
					<div class="bg-blue-50 p-4 rounded-lg mb-6">
						<p class="text-gray-700">Selected Student: <span class="font-medium text-blue-600">{selectedStudent?.student_name}</span></p>
						<p class="text-gray-700">Class: <span class="font-medium text-blue-600">{selectedClass}-{selectedSection}</span></p>
					</div>
					
					<div class="max-w-md">
						<label for="dob-verify" class="block text-sm font-medium text-gray-700 mb-2">
							Enter Your Date of Birth
						</label>
						<input
							id="dob-verify"
							type="date"
							bind:value={dateOfBirth}
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
							disabled={loading}
						/>
						<button
							onclick={verifyAndGetAdmission}
							disabled={loading || !dateOfBirth.trim()}
							class="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
						>
							{loading ? 'Verifying...' : 'Verify & Get Admission Number'}
						</button>
					</div>
				</div>
			{/if}

			<!-- Step 5: Success - Show Admission Number -->
			{#if currentStep === 5}
				<div class="text-center">
					<div class="mb-6">
						<svg class="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						<h2 class="text-3xl font-bold text-green-600 mb-2">Success!</h2>
						<p class="text-gray-600">Your admission number has been found</p>
					</div>

					<div class="bg-green-50 border border-green-200 p-6 rounded-lg mb-6 max-w-md mx-auto">
						<h3 class="font-medium text-gray-900 mb-2">Student Information:</h3>
						<p class="text-gray-700"><span class="font-medium">Name:</span> {selectedStudent?.student_name}</p>
						<p class="text-gray-700"><span class="font-medium">Class:</span> {selectedClass}-{selectedSection}</p>
						<p class="text-2xl font-bold text-green-600 mt-4">
							Admission Number: {foundAdmissionNo}
						</p>
					</div>

					<div class="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							onclick={goToResults}
							class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-lg"
						>
							View My Results →
						</button>
						<button
							onclick={resetLookup}
							class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
						>
							Look Up Another Student
						</button>
					</div>
					
					<p class="text-sm text-gray-500 text-center mt-4">
						Clicking "View My Results" will automatically load your test results
					</p>
				</div>
			{/if}
		</div>

		<!-- Help Section -->
		{#if currentStep < 5}
			<div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mt-8">
				<h3 class="font-medium mb-2">Need Help?</h3>
				<ul class="text-sm space-y-1">
					<li>• Follow the steps in order: Class → Section → Name → Date of Birth</li>
					<li>• Make sure to select the correct class and section</li>
					<li>• Your admission number will only be shown after verifying your date of birth</li>
					<li>• Your date of birth must match exactly with school records</li>
					<li>• If you can't find your name, try a different class or section</li>
				</ul>
			</div>
		{/if}
	</div>
</div>

