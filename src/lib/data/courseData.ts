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

/**
 * Helper to safely extract a sub-structure or return default
 */
export function getCurriculumSubStructure(faculty?: string, department?: string, level?: string) {
	if (!faculty) return { list: Object.keys(NIGERIAN_CURRICULUM), type: 'faculties' };
	
	const deptMap = NIGERIAN_CURRICULUM[faculty];
	if (!deptMap) return { list: [], type: 'departments' };
	if (!department) return { list: Object.keys(deptMap), type: 'departments' };
	
	const levelMap = deptMap[department];
	if (!levelMap) return { list: [], type: 'levels' };
	if (!level) return { list: Object.keys(levelMap), type: 'levels' };
	
	const subjects = levelMap[level]?.subjects || [];
	return { list: subjects, type: 'subjects' };
}

export const UNIVERSITIES_LIST = [
	"Abia State University, Uturu, Abia State", "Achievers University, Owo, Ondo State", "Adamawa State University, Mubi, Adamawa State", "Adekunle Ajasin University, Akungba-Akoko, Ondo State", "Adeleke University, Ede, Osun State", "Admiralty University, Ibusa, Delta State", "Afe Babalola University, Ado-Ekiti, Ekiti State", "Ahmadu Bello University, Zaria, Kaduna State", "Ajayi Crowther University, Oyo, Oyo State", "Al-Ansar University, Maiduguri, Borno State", "Al-Hikmah University, Ilorin, Kwara State", "Alex Ekwueme Federal University, Ndufu-Alike, Ebonyi State", "American University of Nigeria, Yola, Adamawa State", "Ambrose Alli University, Ekpoma, Edo State", "Anchor University, Ayobo, Lagos State", "Arthur Jarvis University, Akpabuyo (Calabar), Cross River State", "Ave-Maria University, Piyanko, Nasarawa State", "Azman University, Kano, Kano State", "Babcock University, Ilishan-Remo, Ogun State", "Bauchi State University, Gadau, Bauchi State", "Bayero University, Kano, Kano State", "Baze University, Abuja", "Benson Idahosa University, Benin City, Edo State", "Bingham University, Karu, Nasarawa State", "Bowen University, Iwo, Osun State", "Caleb University, Imota, Lagos State", "Chrisland University, Abeokuta, Ogun State", "Christopher University, Mowe, Ogun State", "Chukwuemeka Odumegwu Ojukwu University, Igbariam, Anambra State", "Confluence University of Science and Technology, Osara, Kogi State", "Crescent University, Abeokuta, Ogun State", "Delta State University, Abraka, Delta State", "Ebonyi State University, Abakaliki, Ebonyi State", "Edwin Clark University, Kiagbodo, Delta State", "Edo University, Iyamho (Uzairue), Edo State", "Ekiti State University, Ado-Ekiti, Ekiti State", "El-Amin University, Minna, Niger State", "Elizade University, Ilara-Mokin, Ondo State", "Enugu State University of Science and Technology, Agbani, Enugu State", "Federal University, Dutsin-Ma, Katsina State", "Federal University, Lokoja, Kogi State", "Federal University, Otuoke, Bayelsa State", "Federal University, Wukari, Taraba State", "Fountain University, Osogbo, Osun State", "Godfrey Okoye University, Enugu State", "Gombe State University, Gombe State", "Gregory University, Uturu, Abia State", "Hensard University, Toru-Orua, Bayelsa State", "Ibrahim Babangida University, Lapai, Niger State", "Igbinedion University, Okada, Edo State", "Imo State University, Owerri, Imo State", "Joseph Ayo Babalola University, Ikeji-Arakeji, Osun State", "Kingsley Ozumba Mbadiwe University, Ogboko, Imo State", "Koladaisi University, Ibadan, Oyo State", "Kwara State University, Malete, Kwara State", "Lagos State University, Ojo, Lagos State", "Lead City University, Ibadan, Oyo State", "Madonna University, Okija, Anambra State", "Maduka University, Enugu State", "Margaret Lawrence University, Abuja, FCT", "Maryam Abacha American University, Kano, Kano State", "McPherson University, Seriki-Sotayo, Ogun State", "Mewar International University, Masaka, Nasarawa State", "Modibbo Adama University, Yola, Adamawa State", "Nasarawa State University, Keffi, Nasarawa State", "Newgate University, Minna, Niger State", "Niger Delta University, Wilberforce Island, Bayelsa State", "Nigerian-British University, Asa, Abia state.", "Nile University, Abuja", "Nnamdi Azikiwe University, Awka, Anambra State", "North-Eastern University, Gombe State", "Northwest University, Kano (Yusuf Maitama Sule University), Kano State", "Northwest University, Kalambaina, Wamakko, Sokoto State.", "Novena University, Ogume, Delta State", "Obafemi Awolowo University, Ile-Ife, Osun State", "Olabisi Onabanjo University, Ago-Iwoye, Ogun State", "Osun State University, Osogbo, Osun State", "Peter University, Achina/Onnch, Anambra State", "Philomath University, Abuja, FCT", "Plateau State University, Bokkos, Plateau State", "Nigeria Police Academy, Wudil, Kano State", "Prime University, Abuja, FCT", "Prince Abubakar Audu University, Anyigba, Kogi State", "Rayhaan University, Birnin-Kebbi, Kebbi State", "Redeemer’s University, Ede, Osun State", "Renaissance University, Ugbawka, Enugu State", "Reverend Father Moses Orshio Adasu University, Makurdi, Benue State", "Rivers State University, Port Harcourt, Rivers State", "Salem University, Lokoja, Kogi State", "Sam Maris University, Supare-Akoko, Ondo State", "Shanahan University, Onitsha, Anambra State", "Skyline University, Kano, Kano State", "Taraba State University, Jalingo, Taraba State", "Thomas Adewunmi University, Oko-Irese, Kwara State", "Topfaith University, Mkpatak, Akwa Ibom State", "Umaru Musa Yar’Adua University, Katsina, Katsina State", "University of Abuja, Abuja, FCT", "University of Benin, Benin City, Edo State", "University of Calabar, Calabar, Cross River State", "University of Delta, Agbor, Delta State", "University of Ibadan, Ibadan, Oyo State", "University of Ilesa, Ilesa, Osun State", "University of Ilorin, Ilorin, Kwara State", "University of Jos, Jos, Plateau State", "University of Lagos, Akoka, Lagos State", "University of Maiduguri, Maiduguri, Borno State", "University of Nigeria, Nsukka, Enugu State", "University of Port Harcourt, Port Harcourt, Rivers State", "University of Uyo, Uyo, Akwa Ibom State", "University on the Niger, Umunya, Anambra State", "Usman Danfodio University, Sokoto, Sokoto State", "Veritas University, Bwari, Abuja", "Wesley University, Ondo, Ondo State", "Yobe State University, Damaturu, Yobe State", "Other (Please specify)" 
];

/**
 * Structured Nigerian Higher Education Curriculum
 * Faculty -> Department -> Level -> Subjects -> Topics
 */
export const NIGERIAN_CURRICULUM: any = {
	"Faculty of Social Sciences": {
		"Sociology": {
			"100 Level": {
				"subjects": [
					{
						"name": "Introduction to Sociology I",
						"code": "SOC 101",
						"topics": ["Origins of Sociology", "Social Structure", "Culture and Society", "Socialization"]
					},
					{
						"name": "Introduction to Anthropology",
						"code": "SOC 102",
						"topics": ["Human Evolution", "Cultural Diversity", "Kinship Systems"]
					}
				]
			},
			"200 Level": {
				"subjects": [
					{
						"name": "Social Psychology",
						"code": "SOC 201",
						"topics": ["Self-Concept", "Attitude Formation", "Group Dynamics"]
					},
					{
						"name": "Sociology of Family",
						"code": "SOC 202",
						"topics": ["Marriage Patterns", "Divorce and Society", "Family Transitions"]
					}
				]
			},
			"300 Level": {
				"subjects": [
					{
						"name": "Sociological Theory I",
						"code": "SOC 301",
						"topics": ["Functionalism", "Conflict Theory", "Symbolic Interactionism"]
					},
					{
						"name": "Research Methods",
						"code": "SOC 303",
						"topics": ["Qualitative Research", "Quantitative Analysis", "Ethical Considerations"]
					}
				]
			},
			"400 Level": {
				"subjects": [
					{
						"name": "Sociological Theory II",
						"code": "SOC 401",
						"topics": ["Contemporary Theorists", "Post-Modernism", "Critical Theory"]
					},
					{
						"name": "Sociology of Development",
						"code": "SOC 405",
						"topics": ["Dependency Theory", "Globalization", "Sustainable Development"]
					}
				]
			}
		},
		"Economics": {
			"100 Level": {
				"subjects": [
					{ "name": "Principles of Economics I", "code": "ECO 101", "topics": ["Introduction to Microeconomics", "Supply and Demand", "Market Structures"] }
				]
			}
		}
	},
	"Faculty of Science": {
		"Computer Science": {
			"100 Level": {
				"subjects": [
					{ "name": "Introduction to Computer Science", "code": "CSC 101", "topics": ["History of Computing", "Input/Output Devices", "Software Types"] }
				]
			},
			"200 Level": {
				"subjects": [
					{ "name": "Data Structures", "code": "CSC 201", "topics": ["Arrays", "Linked Lists", "Stacks and Queues"] }
				]
			}
		},
		"Mathematics": {
			"100 Level": {
				"subjects": [
					{ "name": "General Mathematics I", "code": "MTH 101", "topics": ["Set Theory", "Indices and Logarithms", "Quadratic Equations"] }
				]
			}
		}
	},
	"Faculty of Engineering": {
		"Mechanical Engineering": {
			"100 Level": {
				"subjects": [
					{ "name": "Engineering Drawing", "code": "MEE 101", "topics": ["Geometric Construction", "Orthographic Projection", "Isometric Drawing"] }
				]
			}
		}
	}
};
