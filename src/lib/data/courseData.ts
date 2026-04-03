// ── Course Data ── 
// Complete Nigerian Higher Education Curriculum Data

export type InstitutionType = 'University' | 'Polytechnic' | 'College of Education' | 'IEI / Technical';

export const COURSES: Record<InstitutionType, string[]> = {
	University: [
		'Introduction to Computer Science',
		'General Mathematics I',
		'General Physics I',
		'General Chemistry I',
		'Introduction to Economics',
		'Use of English & Communication',
		'Data Structures & Algorithms',
		'Object-Oriented Programming',
		'Engineering Mechanics',
		'Financial Accounting I',
		'Law of Contract',
		'Database Management Systems',
		'Computer Networks',
		'Electrical Circuit Theory',
		'Human Anatomy',
		'Organic Chemistry',
		'Constitutional Law',
		'Fluid Mechanics',
		'Biochemistry',
		'Macroeconomics',
		'Artificial Intelligence & ML',
		'Software Engineering',
		'Structural Analysis',
		'Pharmacology',
		'Econometrics',
		'Advanced Cyber Security',
		'Surgery & Clinical Medicine',
		'Clinical Pharmacy',
		'MBA Strategic Management',
		'M.Sc. Research Methodology'
	],
	Polytechnic: [
		'Computer Science (ND)',
		'Accountancy (ND)',
		'Electrical Engineering (ND)',
		'Marketing (ND)',
		'Architectural Technology (ND)',
		'Civil Engineering (ND)',
		'Business Administration (ND)',
		'Computer Science (HND)',
		'Accountancy (HND)',
		'Civil Engineering (HND)',
		'Mechanical Engineering (HND)',
		'Banking & Finance (HND)',
		'Business Management (Post-HND)',
		'ICT & Networking (NID)'
	],
	'College of Education': [
		'General Education Studies',
		'Mathematics Education',
		'English Language Education',
		'Early Childhood & Care Education',
		'Vocational & Technical Education',
		'Integrated Science Education',
		'Social Studies Education',
		'Primary Education Studies',
		'B.Ed. Primary Education',
		'B.Ed. Educational Management'
	],
	'IEI / Technical': [
		'ICT & Computer Networking (NID)',
		'Oil & Gas Technology (NID)',
		'Film Production & Media (NID)',
		'Auto-Mechanics',
		'Electrical Installation',
		'Marine Engineering (NID)',
		'Aircraft Engineering Technology',
		'Carpentry & Joinery'
	]
};

export const LEVELS: Record<InstitutionType, string[]> = {
	University: [
		'100 Level', '200 Level', '300 Level', '400 Level',
		'500/600 Level', 'Postgraduate (M.Sc./MBA)', 'Ph.D.'
	],
	Polytechnic: [
		'PRE-ND', 'ND Year 1', 'ND Year 2', 'HND Year 1',
		'HND Year 2', 'Post-HND'
	],
	'College of Education': [
		'NCE Year 1', 'NCE Year 2', 'NCE Year 3', 'B.Ed. (Affiliated)'
	],
	'IEI / Technical': [
		'NID Level 1', 'NID Level 2', 'Professional Certificate'
	]
};

export const DIFFICULTIES = [
	{ value: 'mixed', label: 'Mixed (Recommended)' },
	{ value: 'easy', label: 'Easy' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'hard', label: 'Hard' }
];

export const INSTITUTION_TYPES: InstitutionType[] = [
	'University',
	'Polytechnic',
	'College of Education',
	'IEI / Technical'
];

export const NIGERIA_STATES = [
	'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
	'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
	'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa',
	'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
	'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
	'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// Stats for landing/SEO
export const PLATFORM_STATS = {
	institutions: '550+',
	questions: '250K+',
	students: '12K+',
	passRate: '89%'
};

export const WAEC_GRADES = [
	{ grade: 'A1', min: 75, label: 'Distinction', color: '#84cc16' },
	{ grade: 'B2', min: 70, label: 'Very Good', color: '#22d3ee' },
	{ grade: 'B3', min: 65, label: 'Good', color: '#67e8f9' },
	{ grade: 'C4', min: 60, label: 'Credit', color: '#f59e0b' },
	{ grade: 'C5', min: 55, label: 'Credit', color: '#fbbf24' },
	{ grade: 'C6', min: 50, label: 'Credit', color: '#fcd34d' },
	{ grade: 'D7', min: 45, label: 'Pass', color: '#f97316' },
	{ grade: 'E8', min: 40, label: 'Pass', color: '#ef4444' },
	{ grade: 'F9', min: 0, label: 'Fail', color: '#e11d48' }
];
