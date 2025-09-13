# Student Result System Setup Guide

This is a SvelteKit application that allows students to view their test results by entering their admission number.

## Prerequisites

- Node.js (v18 or higher)
- A Supabase account and project

## Database Setup

1. Create the following table in your Supabase database:

```sql
create table public.test_results (
  id serial not null,
  admission_no character varying(20) not null,
  subject_name character varying(100) not null,
  marks_obtained numeric(5, 2) not null,
  max_marks numeric(5, 2) not null,
  test_date date not null,
  attendance boolean null default true,
  test_category character varying(50) null,
  constraint test_results_pkey primary key (id),
  constraint test_results_admission_no_fkey foreign KEY (admission_no) references students (admission_no)
) TABLESPACE pg_default;
```

2. Make sure you have a `students` table with at least an `admission_no` column.

3. Your data structure should match this format (based on your CSV):

```sql
-- Sample data structure (your actual data format):
INSERT INTO test_results (admission_no, subject_name, marks_obtained, max_marks, test_date, attendance, test_category) VALUES
('S24/29', 'Computer Science', 54.37, 80.00, '2025-07-10', true, 'Class Test'),
('P22/51', 'English', 15.00, 15.00, '2025-07-01', true, 'FA1'),
('P23/75', 'Hindi', 15.00, 15.00, '2025-05-06', true, 'FA1');
```

Note: The application supports various admission number formats like `S24/29`, `S25/56`, `P22/51`, `P21/37A`, etc.

## Environment Setup

1. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase project URL and anon key from your Supabase dashboard.

## Installation & Running

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Features

- **Student Result Lookup**: Students can enter their admission number to view their test results
- **Comprehensive Results Display**: Shows marks, percentage, grade, test date, category, and attendance
- **Grade Calculation**: Automatic grade calculation based on percentage (A+, A, B+, B, C+, C, F)
- **Overall Statistics**: Displays total marks, overall percentage, and overall grade
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Proper error messages for invalid admission numbers or connection issues
- **Loading States**: Visual feedback during data fetching

## Usage

1. Enter a valid admission number (e.g., S24/29, S25/56, P22/51, P21/37A)
2. Click "Search Results" or press Enter
3. View the detailed results table with all test information
4. Check overall statistics at the bottom of the results

## Sample Admission Numbers (from your data):
- **S24/29** - Computer Science student with Class Test results
- **P22/51** - Student with both English and Hindi results
- **P21/37A** - English student with FA1 results

## Grading System

- A+: 90% and above
- A: 80-89%
- B+: 70-79%
- B: 60-69%
- C+: 50-59%
- C: 40-49%
- F: Below 40%

## Deployment

To build for production:

```bash
npm run build
```

The built application will be in the `build` directory and can be deployed to any static hosting service or Node.js server.

## Troubleshooting

1. **"No results found"**: Make sure the admission number exists in your database
2. **Connection errors**: Check your Supabase URL and API key in the `.env` file
3. **Build errors**: Ensure all dependencies are installed with `npm install`
