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

2. Create the `students` table with the required fields:

```sql
create table public.students (
  admission_no character varying(20) not null,
  student_name character varying(100) not null,
  student_dob date not null,
  student_gender character varying(10) not null,
  class character varying(10) not null,
  section_name character varying(5) not null,
  roll_no integer not null,
  father_name character varying(100) not null,
  mother_name character varying(100) not null,
  constraint students_pkey primary key (admission_no)
) TABLESPACE pg_default;
```

3. Insert sample student data:

```sql
-- Sample students data
INSERT INTO students (admission_no, student_name, student_dob, student_gender, class, section_name, roll_no, father_name, mother_name) VALUES
('S24/29', 'John Doe', '2009-05-15', 'Male', 'X', 'A', 1, 'John Sr.', 'Jane Doe'),
('P22/51', 'Jane Smith', '2010-03-22', 'Female', 'IX', 'B', 2, 'Robert Smith', 'Mary Smith'),
('P23/75', 'Mike Johnson', '2011-08-10', 'Male', 'VIII', 'A', 3, 'David Johnson', 'Lisa Johnson'),
('P21/37A', 'Sarah Wilson', '2008-12-05', 'Female', 'XI', 'C', 4, 'Thomas Wilson', 'Emma Wilson');
```

4. Your data structure should match this format (based on your CSV):

```sql
-- Sample data structure (your actual data format):
INSERT INTO test_results (admission_no, subject_name, marks_obtained, max_marks, test_date, attendance, test_category) VALUES
('S24/29', 'Computer Science', 54.37, 80.00, '2025-07-10', true, 'Class Test'),
('P22/51', 'English', 15.00, 15.00, '2025-07-01', true, 'FA1'),
('P23/75', 'Hindi', 15.00, 15.00, '2025-05-06', true, 'FA1');
```

## Important Notes for Result Display

### Attendance-Based Display
- **Absent students**: Marks are hidden, only attendance status is shown
- **Present students**: Full marks and percentage are displayed

### Class-Based Filtering
- **Classes below IX** (NUR, LKG, UKG, I-VIII): Results are filtered by **Exam Type** instead of Subject
- **Classes IX and above**: Results are filtered by **Subject** as usual

### Grading System
- The grading system has been removed from the results display
- Only marks, percentage, and attendance status are shown

### Simple & Clean Interface
- **Easy-to-Use Filters**: Clearly designed interactive dropdown menus with "Select Subject" and "Select Test Date" labels, visual indicators and colored backgrounds, stacked vertically for consistent layout across all screen sizes
- **Contextual Date Filtering**: Date filter shows only dates available for the selected test type/subject
- **Smart Date Updates**: When changing test types, date options automatically update to show relevant dates
- **Mobile-Optimized Cards**: Card-based layout that works perfectly on mobile devices
- **Responsive Navigation**: Mobile-friendly navigation with hamburger menu and responsive logo sizing
- **OTP-Style Input**: 5 separate input boxes for admission number entry - first for alphabet, rest for numbers, with automatic forward slash placement and mobile numeric keyboard support
- **Smart URL Management**: URL parameters are cleared after successful search to prevent auto-search on page refresh
- **Personalized Experience**: Shows student's name in the results header (e.g., "John's Test Results") instead of generic subject-based headers
- **Subject Grouping**: Results are grouped by subject to avoid repetitive subject names and improve readability
- **Beautiful Design Theme**: Consistent use of colored backgrounds, gradient effects, and thick borders throughout all components for a cohesive and visually appealing interface
- **Smart Attendance Display**: Only shows "Absent" status when student was absent, hides "Present" status for cleaner look
- **Score-Focused Design**: Emphasizes actual marks obtained over percentage for better clarity
- **Neutral Color Scheme**: Uses gray for maximum marks to create better visual balance
- **Consistent Badge Design**: Percentage displayed as small badges in the top row with date and test type
- **Auto-Hide Search Form**: Search form disappears after results are found to focus on the data
- **Student-Friendly Design**: Minimal complexity, maximum clarity for easy result viewing

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
- **Student Finder**: Interactive lookup system to find admission numbers by class, section, and name verification
- **Comprehensive Results Display**: Shows marks, percentage, grade, test date, category, and attendance
- **Grade Calculation**: Automatic grade calculation based on percentage (A+, A, B+, B, C+, C, F)
- **Overall Statistics**: Displays total marks, overall percentage, and overall grade
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Proper error messages for invalid admission numbers or connection issues
- **Loading States**: Visual feedback during data fetching

## Usage

### Direct Result Lookup
1. Enter a valid admission number (e.g., S24/29, S25/56, P22/51, P21/37A)
2. Click "Search Results" or press Enter
3. View the detailed results table with all test information
4. Check overall statistics at the bottom of the results

### Student Finder (Find Admission Number)
1. Click "Find Your Admission Number" from the main page
2. Select your class (NUR, LKG, UKG, I-XII)
3. Select your section (A, B, C, D, E)
4. Choose your name from the list of students (admission numbers are hidden for security)
5. Verify your date of birth for security verification
6. Get your admission number revealed only after successful verification
7. Proceed to view results with your admission number

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
