import { mutation } from './_generated/server';

/**
 * Enterprise Seeding: Populating the full Nigerian Academic Database
 * Migrated from legacy courseData.ts and expanded with exhaustive registries.
 */
export const runSeed = mutation({
  handler: async (ctx) => {
    // ── 1. Comprehensive University Registry ──
    const universities = [
      "Abia State University, Uturu", "Achievers University, Owo", "Adamawa State University, Mubi", "Adekunle Ajasin University, Akungba-Akoko", "Adeleke University, Ede", "Admiralty University, Ibusa", "Afe Babalola University, Ado-Ekiti", "Ahmadu Bello University, Zaria", "Ajayi Crowther University, Oyo", "Al-Ansar University, Maiduguri", "Al-Hikmah University, Ilorin", "Alex Ekwueme Federal University, Ndufu-Alike", "American University of Nigeria, Yola", "Ambrose Alli University, Ekpoma", "Anchor University, Ayobo", "Arthur Jarvis University, Akpabuyo", "Ave-Maria University, Piyanko", "Azman University, Kano", "Babcock University, Ilishan-Remo", "Bauchi State University, Gadau", "Bayero University, Kano", "Baze University, Abuja", "Benson Idahosa University, Benin City", "Bingham University, Karu", "Bowen University, Iwo", "Caleb University, Imota", "Chrisland University, Abeokuta", "Christopher University, Mowe", "Chukwuemeka Odumegwu Ojukwu University, Igbariam", "Confluence University of Science and Technology, Osara", "Crescent University, Abeokuta", "Delta State University, Abraka", "Ebonyi State University, Abakaliki", "Edwin Clark University, Kiagbodo", "Edo University, Iyamho", "Ekiti State University, Ado-Ekiti", "El-Amin University, Minna", "Elizade University, Ilara-Mokin", "Enugu State University of Science and Technology, Agbani", "Federal University, Dutsin-Ma", "Federal University, Lokoja", "Federal University, Otuoke", "Federal University, Wukari", "Fountain University, Osogbo", "Godfrey Okoye University, Enugu State", "Gombe State University, Gombe State", "Gregory University, Uturu", "Hensard University, Toru-Orua", "Ibrahim Babangida University, Lapai", "Igbinedion University, Okada", "Imo State University, Owerri", "Joseph Ayo Babalola University, Ikeji-Arakeji", "Kingsley Ozumba Mbadiwe University, Ogboko", "Koladaisi University, Ibadan", "Kwara State University, Malete", "Lagos State University, Ojo", "Lead City University, Ibadan", "Madonna University, Okija", "Maduka University, Enugu State", "Margaret Lawrence University, Abuja", "Maryam Abacha American University, Kano", "McPherson University, Seriki-Sotayo", "Mewar International University, Masaka", "Modibbo Adama University, Yola", "Nasarawa State University, Keffi", "Newgate University, Minna", "Niger Delta University, Wilberforce Island", "Nigerian-British University, Asa", "Nile University, Abuja", "Nnamdi Azikiwe University, Awka", "North-Eastern University, Gombe State", "Northwest University, Kano", "Novena University, Ogume", "Obafemi Awolowo University, Ile-Ife", "Olabisi Onabanjo University, Ago-Iwoye", "Osun State University, Osogbo", "Peter University, Achina/Onnch", "Philomath University, Abuja", "Plateau State University, Bokkos", "Nigeria Police Academy, Wudil", "Prime University, Abuja", "Prince Abubakar Audu University, Anyigba", "Rayhaan University, Birnin-Kebbi", "Redeemer’s University, Ede", "Renaissance University, Ugbawka", "Rivers State University, Port Harcourt", "Salem University, Lokoja", "Sam Maris University, Supare-Akoko", "Shanahan University, Onitsha", "Skyline University, Kano", "Taraba State University, Jalingo", "Thomas Adewunmi University, Oko-Irese", "Topfaith University, Mkpatak", "Umaru Musa Yar’Adua University, Katsina", "University of Abuja, Abuja", "University of Benin, Benin City", "University of Calabar", "University of Delta, Agbor", "University of Ibadan", "University of Ilesa", "University of Ilorin", "University of Jos", "University of Lagos", "University of Maiduguri", "University of Nigeria, Nsukka", "University of Port Harcourt", "University of Uyo", "University on the Niger, Umunya", "Usman Danfodio University, Sokoto", "Veritas University, Bwari", "Wesley University, Ondo", "Yobe State University, Damaturu"
    ];

    for (const name of universities) {
      const existing = await ctx.db
        .query('institutions')
        .withIndex('by_name', q => q.eq('name', name))
        .unique();
      if (!existing) {
        await ctx.db.insert('institutions', {
          type: 'University',
          category: name.includes('Federal') ? 'Federal' : name.includes('State') ? 'State' : 'Private',
          name
        });
      }
    }

    // ── 2. Detailed Curriculum Seeding ──
    // Exhaustive Curriculum for Top Departments
    const curriculumData = [
      {
        faculty: "Faculty of Social Sciences",
        department: "Sociology",
        levels: [
          { level: "100 Level", course: "Introduction to Sociology (SOC 101)", topics: ["History of Sociology", "Social Structure", "Culture", "Socialization"] },
          { level: "100 Level", course: "Introduction to Anthropology (SOC 102)", topics: ["Evolution", "Kinship", "Cultural Diversity"] },
          { level: "200 Level", course: "Social Psychology (SOC 201)", topics: ["Self-Concept", "Attitude Formation", "Group Dynamics"] },
          { level: "300 Level", course: "Sociological Theory I (SOC 301)", topics: ["Functionalism", "Conflict Theory", "Symbolic Interactionism"] },
          { level: "400 Level", course: "Sociology of Development (SOC 405)", topics: ["Globalization", "Sustainable Development", "Modernization Theory"] }
        ]
      },
      {
        faculty: "Faculty of Science",
        department: "Computer Science",
        levels: [
          { level: "100 Level", course: "Introduction to Computer Science (CSC 101)", topics: ["Computing History", "Hardware/Software", "Algorithms"] },
          { level: "200 Level", course: "Data Structures & Algorithms (CSC 201)", topics: ["Arrays", "Linked Lists", "Stacks", "Queues"] },
          { level: "300 Level", course: "Database Management Systems (CSC 301)", topics: ["Relational Model", "SQL", "Normalization", "Concurrency"] },
          { level: "400 Level", course: "Artificial Intelligence (CSC 401)", topics: ["Heuristic Search", "Machine Learning", "Neural Networks", "NLP"] }
        ]
      },
      {
        faculty: "Faculty of Law",
        department: "Law",
        levels: [
          { level: "100 Level", course: "Legal Method", topics: ["Sources of Law", "Legal Reasoning", "Judicial Precedence"] },
          { level: "200 Level", course: "Law of Contract", topics: ["Offer and Acceptance", "Consideration", "Capacity", "Privity"] },
          { level: "300 Level", course: "Criminal Law", topics: ["Actus Reus", "Mens Rea", "Homicide", "Theft"] },
          { level: "400 Level", course: "Land Law", topics: ["Land Tenure Systems", "Ownership", "Leaseholds", "Mortgages"] },
          { level: "500 Level", course: "Jurisprudence & Legal Theory", topics: ["Natural Law", "Positivism", "Socialist Theory"] }
        ]
      },
      {
        faculty: "Faculty of Management Sciences",
        department: "Accounting",
        levels: [
          { level: "100 Level", course: "Financial Accounting I", topics: ["Bookkeeping", "Trial Balance", "Final Accounts"] },
          { level: "200 Level", course: "Cost Accounting", topics: ["Cost Classification", "Material Control", "Labor Costing"] },
          { level: "300 Level", course: "Advanced Financial Accounting", topics: ["Partnership Accounts", "Company Accounts", "Group Accounts"] },
          { level: "400 Level", course: "Auditing & Assurance", topics: ["Audit Process", "Internal Control", "Audit Reports"] }
        ]
      }
    ];

    for (const deptData of curriculumData) {
      for (const levelData of deptData.levels) {
        const existing = await ctx.db
          .query('curriculum')
          .withIndex('by_course', q => q.eq('course', levelData.course))
          .filter(q => q.and(
            q.eq(q.field('level'), levelData.level),
            q.eq(q.field('department'), deptData.department)
          ))
          .unique();
        
        if (!existing) {
          await ctx.db.insert('curriculum', {
            institutionType: 'University',
            faculty: deptData.faculty,
            department: deptData.department,
            level: levelData.level,
            course: levelData.course,
            topics: levelData.topics
          });
        }
      }
    }

    return { 
      message: "Exhaustive Seeding Complete.", 
      institutionsAdded: universities.length,
      curriculumEntries: curriculumData.reduce((acc, curr) => acc + curr.levels.length, 0)
    };
  }
});
