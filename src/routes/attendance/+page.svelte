<script lang="ts">
	import { supabase } from '$lib/supabase'
	import type { Student } from '$lib/types/database'
	import { onMount } from 'svelte'

	let selectedClass = $state('')
	let selectedSection = $state('')
	let selectedExam = $state('')
	let students: Student[] = $state([])
	let loading = $state(false)
	let error = $state('')

	const classes = ['NUR', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
	const sections = ['A', 'B', 'C', 'D', 'E']

	const examSchedules = [
		{
			id: 'nur',
			title: 'FIRST TERM EXAM SESSION 2025-2026',
			classes: 'Nursery',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT/ACTIVITY'],
			schedule: [
				{ date: '26-09-2025', subjects: ['DRW/CONVERSATION'] },
				{ date: '27-09-2025', subjects: ['ENGLISH (O/W)'] },
				{ date: '29-09-2025', subjects: ['MATHS'] },
				{ date: '30-09-2025', subjects: ['E.V.S (ORAL)'] },
				{ date: '01-10-2025', subjects: ['HINDI (O/W)'] }
			]
		},
		{
			id: 'lkg',
			title: 'FIRST TERM EXAM SESSION 2025-2026',
			classes: 'Lower KG',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
			schedule: [
				{ date: '26-09-2025', subjects: ['HINDI (O/W)'] },
				{ date: '27-09-2025', subjects: ['DRW/CONVERSATION'] },
				{ date: '29-09-2025', subjects: ['ENGLISH (O/W)'] },
				{ date: '30-09-2025', subjects: ['MATHS'] },
				{ date: '01-10-2025', subjects: ['E.V.S (O/W)'] }
			]
		},
		{
			id: 'ukg',
			title: 'FIRST TERM EXAM SESSION 2025-2026',
			classes: 'Upper KG',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
			schedule: [
				{ date: '26-09-2025', subjects: ['E.V.S (O/W)'] },
				{ date: '27-09-2025', subjects: ['HINDI (O/W)'] },
				{ date: '29-09-2025', subjects: ['MATHS'] },
				{ date: '30-09-2025', subjects: ['DRW/CONVERSATION'] },
				{ date: '01-10-2025', subjects: ['ENGLISH (O/W)'] }
			]
		},
		{
			id: 'class-1',
			title: 'SA1 Exam Session 2025-2026',
			classes: 'Class I',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
			schedule: [
				{ date: '26-09-2025', subjects: ['DIC / HINDI / ENG'] },
				{ date: '27-09-2025', subjects: ['ENGLISH'] },
				{ date: '29-09-2025', subjects: ['MATHS'] },
				{ date: '30-09-2025', subjects: ['HINDI'] },
				{ date: '01-10-2025', subjects: ['E.V.S'] }
			]
		},
		{
			id: 'class-2',
			title: 'SA1 Exam Session 2025-2026',
			classes: 'Class II',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
			schedule: [
				{ date: '26-09-2025', subjects: ['DIC / HINDI / ENG'] },
				{ date: '27-09-2025', subjects: ['HINDI'] },
				{ date: '29-09-2025', subjects: ['ENGLISH'] },
				{ date: '30-09-2025', subjects: ['E.V.S'] },
				{ date: '01-10-2025', subjects: ['MATHS'] }
			]
		},
		{
			id: 'class-3',
			title: 'SA1 Exam Session 2025-2026',
			classes: 'Class III',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
			schedule: [
				{ date: '26-09-2025', subjects: ['S.ST'] },
				{ date: '27-09-2025', subjects: ['ENGLISH'] },
				{ date: '29-09-2025', subjects: ['MATHS'] },
				{ date: '30-09-2025', subjects: ['SCIENCE'] },
				{ date: '01-10-2025', subjects: ['HINDI'] }
			]
		},
		{
			id: 'class-4',
			title: 'SA1 Exam Session 2025-2026',
			classes: 'Class IV',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
			schedule: [
				{ date: '26-09-2025', subjects: ['SCIENCE'] },
				{ date: '27-09-2025', subjects: ['HINDI'] },
				{ date: '29-09-2025', subjects: ['ENGLISH'] },
				{ date: '30-09-2025', subjects: ['S.ST'] },
				{ date: '01-10-2025', subjects: ['MATHS'] }
			]
		},
		{
			id: 'class-5',
			title: 'SA1 Exam Session 2025-2026',
			classes: 'Class V',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
			schedule: [
				{ date: '26-09-2025', subjects: ['HINDI'] },
				{ date: '27-09-2025', subjects: ['SCIENCE'] },
				{ date: '29-09-2025', subjects: ['MATHS'] },
				{ date: '30-09-2025', subjects: ['ENGLISH'] },
				{ date: '01-10-2025', subjects: ['S.ST'] }
			]
		},
		{
			id: 'class-6',
			title: 'SA1 Exam Session 2025-2026',
			classes: 'Class VI',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
			schedule: [
				{ date: '22-09-2025', subjects: ['S.ST'] },
				{ date: '23-09-2025', subjects: ['DRW'] },
				{ date: '24-09-2025', subjects: ['ENGLISH'] },
				{ date: '25-09-2025', subjects: ['HINDI'] },
				{ date: '26-09-2025', subjects: ['SCIENCE'] },
				{ date: '27-09-2025', subjects: ['SKT'] },
				{ date: '29-09-2025', subjects: ['MATHS'] },
				{ date: '30-09-2025', subjects: ['LOK SKT AND YOG'] },
				{ date: '01-10-2025', subjects: ['COMPUTER'] }
			]
		},
		{
			id: 'class-7',
			title: 'SA1 Exam Session 2025-2026',
			classes: 'Class VII',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
				schedule: [
					{ date: '22-09-2025', subjects: ['ENGLISH'] },
					{ date: '23-09-2025', subjects: ['SKT'] },
					{ date: '24-09-2025', subjects: ['SCIENCE'] },
					{ date: '25-09-2025', subjects: ['DRW'] },
					{ date: '26-09-2025', subjects: ['S.ST'] },
					{ date: '27-09-2025', subjects: ['LOK SKT AND YOG'] },
					{ date: '29-09-2025', subjects: ['MATHS'] },
					{ date: '30-09-2025', subjects: ['COMPUTER'] },
					{ date: '01-10-2025', subjects: ['HINDI'] }
				]
		},
		{
			id: 'class-8',
			title: 'SA1 Exam Session 2025-2026',
			classes: 'Class VIII',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
				schedule: [
					{ date: '22-09-2025', subjects: ['MATHS'] },
					{ date: '23-09-2025', subjects: ['LOK SKT AND YOG'] },
					{ date: '24-09-2025', subjects: ['ENGLISH'] },
					{ date: '25-09-2025', subjects: ['COMPUTER'] },
					{ date: '26-09-2025', subjects: ['HINDI'] },
					{ date: '27-09-2025', subjects: ['S.ST'] },
					{ date: '29-09-2025', subjects: ['SCIENCE'] },
					{ date: '30-09-2025', subjects: ['DRW'] },
					{ date: '01-10-2025', subjects: ['SKT'] }
				]
		},
		{
			id: 'class-9',
			title: 'FIRST TERM EXAM SESSION 2025-2026',
			classes: 'Class IX',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
				schedule: [
					{ date: '22-09-2025', subjects: ['MATHS'] },
					{ date: '23-09-2025', subjects: ['HINDI'] },
					{ date: '24-09-2025', subjects: ['SCIENCE'] },
					{ date: '25-09-2025', subjects: ['SKT'] },
					{ date: '26-09-2025', subjects: ['ENGLISH'] },
					{ date: '27-09-2025', subjects: ['COMPUTER'] },
					{ date: '29-09-2025', subjects: ['S.ST'] }
				]
		},
		{
			id: 'class-10',
			title: 'FIRST TERM EXAM SESSION 2025-2026',
			classes: 'Class X',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
				schedule: [
					{ date: '22-09-2025', subjects: ['S.ST'] },
					{ date: '23-09-2025', subjects: ['MATHS'] },
					{ date: '24-09-2025', subjects: ['HINDI'] },
					{ date: '25-09-2025', subjects: ['SCIENCE'] },
					{ date: '26-09-2025', subjects: ['SKT'] },
					{ date: '27-09-2025', subjects: ['ENGLISH'] },
					{ date: '29-09-2025', subjects: ['COMPUTER'] }
				]
		},
		{
			id: 'class-11',
			title: 'FIRST TERM EXAM SESSION 2025-2026',
			classes: 'Class XI',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
				schedule: [
					{ date: '22-09-2025', subjects: ['COMPUTER'] },
					{ date: '23-09-2025', subjects: ['S.ST'] },
					{ date: '24-09-2025', subjects: ['MATHS'] },
					{ date: '25-09-2025', subjects: ['HINDI'] },
					{ date: '26-09-2025', subjects: ['SCIENCE'] },
					{ date: '27-09-2025', subjects: ['SKT'] },
					{ date: '29-09-2025', subjects: ['ENGLISH'] }
				]
		},
		{
			id: 'class-12',
			title: 'FIRST TERM EXAM SESSION 2025-2026',
			classes: 'Class XII',
			time: '9:00am to 12:00 pm',
			columns: ['DATE', 'SUBJECT'],
				schedule: [
					{ date: '22-09-2025', subjects: ['ENGLISH'] },
					{ date: '23-09-2025', subjects: ['COMPUTER'] },
					{ date: '24-09-2025', subjects: ['S.ST'] },
					{ date: '25-09-2025', subjects: ['MATHS'] },
					{ date: '26-09-2025', subjects: ['HINDI'] },
					{ date: '27-09-2025', subjects: ['SCIENCE'] },
					{ date: '29-09-2025', subjects: ['SKT'] }
				]
		}
	]

	// Get exam schedule for selected class
	const currentExamSchedule = $derived(examSchedules.find(exam => {
		const classMap: Record<string, string> = {
			'NUR': 'nur',
			'LKG': 'lkg', 
			'UKG': 'ukg',
			'I': 'class-1',
			'II': 'class-2',
			'III': 'class-3',
			'IV': 'class-4',
			'V': 'class-5',
			'VI': 'class-6',
			'VII': 'class-7',
			'VIII': 'class-8',
			'IX': 'class-9',
			'X': 'class-10',
			'XI': 'class-11',
			'XII': 'class-12'
		}
		return exam.id === classMap[selectedClass]
	}))

	async function selectClass(className: string) {
		selectedClass = className
		selectedSection = ''
		selectedExam = ''
		students = []
		error = ''
	}

	async function selectSection(section: string) {
		selectedSection = section
		selectedExam = ''
		students = []
		error = ''
		loading = true

		try {
			const { data, error: supabaseError } = await supabase
				.from('students')
				.select('*')
				.eq('class', selectedClass)
				.eq('section_name', selectedSection)
				.order('roll_no')

			if (supabaseError) {
				throw supabaseError
			}

			students = data || []
			
			if (students.length === 0) {
				error = `No students found in Class ${selectedClass}-${selectedSection}`
			} else {
				// Auto-select the exam schedule for this class
				selectedExam = currentExamSchedule?.id || ''
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

	function selectExam(examId: string) {
		selectedExam = examId
	}

	function getStudentPhotoUrl(admissionNo: string): string {
		// Remove forward slashes from admission number for API call
		const cleanAdmissionNo = admissionNo.replace(/\//g, '')
		return `http://127.0.0.1:8000/admission/${cleanAdmissionNo}`
	}

	function printAttendanceSheet() {
		window.print()
	}

	function reset() {
		selectedClass = ''
		selectedSection = ''
		selectedExam = ''
		students = []
		error = ''
	}
</script>

<svelte:head>
	<title>Attendance Sheets - SVN NAHAN</title>
</svelte:head>

<div class="py-8 px-4">
	<div class="max-w-6xl mx-auto">
		<!-- Page Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Attendance Sheets</h1>
			<p class="text-gray-600">Generate printable attendance sheets for exam sessions</p>
		</div>

		<!-- Selection Interface -->
		{#if !selectedClass || !selectedSection || !selectedExam}
			<div class="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-8 mb-8">
				<div class="space-y-6">
					<!-- Class Selection -->
					<div>
						<h2 class="text-xl font-bold text-gray-900 mb-4">Select Class</h2>
						<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
							{#each classes as className}
								<button
									onclick={() => selectClass(className)}
									class="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center font-semibold text-gray-900 hover:text-blue-600 {selectedClass === className ? 'border-blue-500 bg-blue-50 text-blue-600' : ''}"
								>
									{className}
								</button>
							{/each}
						</div>
					</div>

					<!-- Section Selection -->
					{#if selectedClass}
						<div>
							<h2 class="text-xl font-bold text-gray-900 mb-4">Select Section</h2>
							<div class="grid grid-cols-5 gap-3 max-w-lg">
								{#each sections as section}
									<button
										onclick={() => selectSection(section)}
										disabled={loading}
										class="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center font-semibold text-gray-900 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed {selectedSection === section ? 'border-blue-500 bg-blue-50 text-blue-600' : ''}"
									>
										{section}
									</button>
								{/each}
							</div>
							{#if loading}
								<div class="flex items-center space-x-2 text-blue-600 mt-4">
									<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									<span class="font-medium">Loading students...</span>
								</div>
							{/if}
						</div>
					{/if}

					<!-- Exam Schedule Selection -->
					{#if selectedClass && selectedSection && students.length > 0}
						<div>
							<h2 class="text-xl font-bold text-gray-900 mb-4">Select Exam Schedule</h2>
							<div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
								<div class="flex items-center justify-between">
									<div>
										<h3 class="font-semibold text-purple-900">{currentExamSchedule?.title}</h3>
										<p class="text-sm text-purple-700">Class: {currentExamSchedule?.classes} | Time: {currentExamSchedule?.time}</p>
									</div>
									<button
										onclick={() => selectExam(currentExamSchedule?.id || '')}
										class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200 font-semibold"
									>
										Select This Schedule
									</button>
								</div>
							</div>
						</div>
					{/if}
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

		<!-- Attendance Sheet -->
		{#if selectedClass && selectedSection && selectedExam && students.length > 0}
			<div class="bg-white rounded-xl shadow-sm border-2 border-green-200 p-6 mb-6">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-2xl font-bold text-gray-900">Attendance Sheet</h2>
					<div class="flex gap-3">
						<button
							onclick={printAttendanceSheet}
							class="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition duration-200 font-semibold flex items-center"
						>
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
							</svg>
							Print Sheet
						</button>
						<button
							onclick={reset}
							class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
						>
							New Sheet
						</button>
					</div>
				</div>

				<!-- Printable Attendance Sheet -->
				<div class="printable-sheet" id="attendance-sheet">
					<!-- Header -->
					<div class="text-center mb-8">
						<h1 class="text-2xl font-bold text-gray-900 mb-2">S.V.N NAHAN</h1>
						<h2 class="text-xl font-semibold text-gray-800 mb-1">{currentExamSchedule?.title}</h2>
						<p class="text-lg text-gray-700">Class: {selectedClass}-{selectedSection} | Time: {currentExamSchedule?.time}</p>
					</div>


					<!-- Attendance Table -->
					<div class="mb-6">
						<div class="bg-white border border-gray-200 shadow-sm">
							<div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
								<h3 class="text-lg font-semibold text-gray-900">Attendance Record</h3>
							</div>
							<div class="overflow-x-auto">
								<table class="w-full border-collapse text-sm">
									<thead>
										<tr class="bg-gray-50 border-b border-gray-200">
											<th class="px-2 py-2 text-left font-medium text-gray-900 border-r border-gray-200 w-20">
												Photo
											</th>
											<th class="px-2 py-2 text-center font-medium text-gray-900 border-r border-gray-200 w-10">
												Roll
											</th>
											<th class="px-2 py-2 text-left font-medium text-gray-900 border-r border-gray-200 w-32">
												Student Name
											</th>
											<th class="px-2 py-2 text-center font-medium text-gray-900 border-r border-gray-200 w-16">
												Admission
											</th>
											{#each currentExamSchedule?.schedule || [] as scheduleItem}
												<th class="px-2 py-2 text-center font-medium text-gray-900 border-r border-gray-200 last:border-r-0 w-20">
													<div class="text-xs leading-tight">
														<div class="font-semibold">{scheduleItem.date.split('-')[0]}/{scheduleItem.date.split('-')[1]}</div>
														<div class="text-gray-600 text-xs">{scheduleItem.subjects[0].substring(0, 6)}</div>
													</div>
												</th>
											{/each}
										</tr>
									</thead>
									<tbody>
										{#each students as student, studentIndex}
											<tr class="border-b border-gray-100 hover:bg-gray-25">
												<td class="px-2 py-2 border-r border-gray-200">
													<img 
														src={getStudentPhotoUrl(student.admission_no)} 
														alt={student.student_name}
														class="w-16 h-20 object-cover rounded border border-gray-200"
														onerror={(e) => {
															const target = e.target as HTMLImageElement;
															target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA2NCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjlGQUZCIi8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjEwIiBmaWxsPSIjRDFENURCIi8+CjxwYXRoIGQ9Ik0xNiA1NkMxNiA0Ny4xNjM0IDIzLjE2MzQgNDAgMzIgNDBDNDAuODM2NiA0MCA0OCA0Ny4xNjM0IDQ4IDU2VjY0SDE2VjU2WiIgZmlsbD0iI0QxRDVEQiIvPgo8dGV4dCB4PSIzMiIgeT0iNzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtc2l6ZT0iOCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
														}}
													/>
												</td>
												<td class="px-2 py-2 text-center font-medium border-r border-gray-200">
													{student.roll_no}
												</td>
												<td class="px-3 py-2 font-medium border-r border-gray-200">
													{student.student_name}
												</td>
												<td class="px-2 py-2 text-center text-xs border-r border-gray-200">
													{student.admission_no}
												</td>
											{#each currentExamSchedule?.schedule || [] as scheduleItem}
												<td class="px-2 py-3 text-center border-r border-gray-200 last:border-r-0">
													<!-- Empty cell for student signature -->
												</td>
											{/each}
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<!-- Signature Section -->
					<div class="grid grid-cols-2 gap-8 mt-8">
						<div>
							<p class="text-sm text-gray-600 mb-1">Class Teacher Signature</p>
							<div class="border-b border-gray-400 h-8"></div>
						</div>
						<div>
							<p class="text-sm text-gray-600 mb-1">Principal Signature</p>
							<div class="border-b border-gray-400 h-8"></div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@media print {
		/* Hide everything by default */
		* {
			visibility: hidden !important;
		}
		
		/* Show only the printable sheet and its contents */
		.printable-sheet,
		.printable-sheet * {
			visibility: visible !important;
		}
		
		/* Position the printable sheet properly */
		.printable-sheet {
			position: absolute !important;
			left: 0 !important;
			top: 0 !important;
			width: 100% !important;
			margin: 0 !important;
			padding: 15px !important;
			background: white !important;
		}
		
		/* Style headers for print */
		.printable-sheet h1,
		.printable-sheet h2,
		.printable-sheet h3 {
			color: black !important;
			margin: 2px 0 !important;
		}
		
		/* Reduce spacing in header section */
		.printable-sheet .text-center {
			margin-bottom: 15px !important;
		}
		
		/* Style the table for print */
		.printable-sheet table {
			width: 100% !important;
			border-collapse: collapse !important;
			margin: 5px 0 !important;
		}
		
		.printable-sheet th,
		.printable-sheet td {
			border: 1px solid #333 !important;
			padding: 3px !important;
			font-size: 9px !important;
			line-height: 1.2 !important;
		}
		
		.printable-sheet th {
			background-color: #f5f5f5 !important;
			font-weight: bold !important;
			text-align: center !important;
		}
		
		/* Ensure table photos print properly */
		.printable-sheet img {
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
			max-width: 35px !important;
			max-height: 45px !important;
			border: 1px solid #666 !important;
		}
		
		/* Optimize table for A4 */
		.printable-sheet table {
			font-size: 8px !important;
		}
		
		.printable-sheet .w-20:first-child {
			width: 40px !important;
		}
		
		.printable-sheet .w-10 {
			width: 20px !important;
		}
		
		.printable-sheet .w-32 {
			width: 60px !important;
		}
		
		.printable-sheet .w-16 {
			width: 30px !important;
		}
		
		.printable-sheet .w-20 {
			width: 50px !important;
		}
		
		/* Reduce spacing around table section */
		.printable-sheet .mb-8 {
			margin-bottom: 10px !important;
		}
		
		/* Style signature section */
		.printable-sheet .grid {
			display: flex !important;
			justify-content: space-between !important;
			margin-top: 15px !important;
		}
		
		/* Hide page margins and headers/footers */
		@page {
			margin: 0.5in;
		}
		
		/* Hide any buttons or interactive elements */
		button {
			display: none !important;
		}
	}
</style>
