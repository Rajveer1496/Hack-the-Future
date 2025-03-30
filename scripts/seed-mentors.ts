import { promisify } from 'util';
import { db } from '../server/db';
import { users, skills, userSkills } from '../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { eq, or } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function seedMentors() {
  console.log('Starting mentor seeding...');
  
  // Define skills for mentors
  const mentorSkills = [
    { name: 'Leadership' },
    { name: 'Business Strategy' },
    { name: 'Marketing' },
    { name: 'Finance' },
    { name: 'Product Management' },
    { name: 'Software Engineering' },
    { name: 'Data Science' },
    { name: 'UX/UI Design' },
    { name: 'Entrepreneurship' },
    { name: 'Public Speaking' },
    { name: 'Sales' },
    { name: 'Venture Capital' },
    { name: 'Artificial Intelligence' },
    { name: 'Blockchain' },
    { name: 'Digital Transformation' },
    { name: 'HR Management' },
    { name: 'Supply Chain' },
    { name: 'Healthcare' },
    { name: 'Sustainability' },
    { name: 'Education' }
  ];
  
  // Add skills to database
  console.log('Adding skills...');
  for (const skill of mentorSkills) {
    try {
      // Check if skill already exists
      const existingSkill = await db.select()
        .from(skills)
        .where(eq(skills.name, skill.name))
        .limit(1);
        
      if (existingSkill.length === 0) {
        await db.insert(skills).values(skill);
        console.log(`Added skill: ${skill.name}`);
      } else {
        console.log(`Skill already exists: ${skill.name}`);
      }
    } catch (error) {
      console.error(`Error adding skill ${skill.name}:`, error);
    }
  }
  
  // Fetch all skills to assign to mentors
  const allSkills = await db.select().from(skills);
  const skillMap = new Map(allSkills.map(skill => [skill.name, skill.id]));
  
  // List of mentors to add
  const mentors = [
    {
      username: 'rajiv_kumar',
      password: await hashPassword('password123'),
      email: 'rajiv.kumar@example.com',
      firstName: 'Rajiv',
      lastName: 'Kumar',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      graduationYear: 1992,
      major: 'Business Administration',
      company: 'Global Industries Ltd.',
      position: 'CEO & Chairman',
      bio: 'Former Fortune 500 CEO with expertise in global business strategy and leadership. One of the nation\'s top business leaders with a proven track record of transforming organizations. My mentorship slots are limited and highly sought after.',
      isAlumni: true,
      isStudent: false,
      skills: ['Leadership', 'Business Strategy', 'Digital Transformation']
    },
    {
      username: 'priya_sharma',
      password: await hashPassword('password123'),
      email: 'priya.sharma@example.com',
      firstName: 'Priya',
      lastName: 'Sharma',
      profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
      graduationYear: 2005,
      major: 'Computer Science',
      company: 'TechVision Inc.',
      position: 'CTO',
      bio: 'Passionate about technology and innovation. Led multiple tech startups to successful exits.',
      isAlumni: true,
      isStudent: false,
      skills: ['Software Engineering', 'Artificial Intelligence', 'Product Management']
    },
    {
      username: 'michael_chen',
      password: await hashPassword('password123'),
      email: 'michael.chen@example.com',
      firstName: 'Michael',
      lastName: 'Chen',
      profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
      graduationYear: 2010,
      major: 'Finance',
      company: 'Investment Partners LLC',
      position: 'Managing Director',
      bio: 'Financial expert with experience in investment banking, private equity, and venture capital.',
      isAlumni: true,
      isStudent: false,
      skills: ['Finance', 'Venture Capital', 'Business Strategy']
    },
    {
      username: 'sarah_johnson',
      password: await hashPassword('password123'),
      email: 'sarah.johnson@example.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
      graduationYear: 2008,
      major: 'Marketing',
      company: 'Brand Innovators',
      position: 'CMO',
      bio: 'Creative marketing professional specializing in digital marketing and brand management.',
      isAlumni: true,
      isStudent: false,
      skills: ['Marketing', 'Public Speaking', 'Digital Transformation']
    },
    {
      username: 'david_rodriguez',
      password: await hashPassword('password123'),
      email: 'david.rodriguez@example.com',
      firstName: 'David',
      lastName: 'Rodriguez',
      profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg',
      graduationYear: 2015,
      major: 'Data Science',
      company: 'DataCraft Analytics',
      position: 'Lead Data Scientist',
      bio: 'Expert in machine learning and big data analytics with a focus on practical business applications.',
      isAlumni: true,
      isStudent: false,
      skills: ['Data Science', 'Artificial Intelligence', 'Software Engineering']
    },
    {
      username: 'lisa_wong',
      password: await hashPassword('password123'),
      email: 'lisa.wong@example.com',
      firstName: 'Lisa',
      lastName: 'Wong',
      profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg',
      graduationYear: 2000,
      major: 'Design',
      company: 'User Experience Design Studio',
      position: 'Founder & Creative Director',
      bio: 'Award-winning designer focused on creating meaningful and intuitive user experiences.',
      isAlumni: true,
      isStudent: false,
      skills: ['UX/UI Design', 'Product Management', 'Entrepreneurship']
    },
    {
      username: 'james_patel',
      password: await hashPassword('password123'),
      email: 'james.patel@example.com',
      firstName: 'James',
      lastName: 'Patel',
      profilePicture: 'https://randomuser.me/api/portraits/men/7.jpg',
      graduationYear: 1998,
      major: 'Entrepreneurship',
      company: 'Venture Accelerator',
      position: 'Serial Entrepreneur',
      bio: 'Founded and exited multiple tech startups. Now helping the next generation of entrepreneurs.',
      isAlumni: true,
      isStudent: false,
      skills: ['Entrepreneurship', 'Venture Capital', 'Leadership']
    },
    {
      username: 'emma_garcia',
      password: await hashPassword('password123'),
      email: 'emma.garcia@example.com',
      firstName: 'Emma',
      lastName: 'Garcia',
      profilePicture: 'https://randomuser.me/api/portraits/women/8.jpg',
      graduationYear: 2012,
      major: 'Psychology',
      company: 'HR Solutions International',
      position: 'Director of People Development',
      bio: 'Specializing in organizational psychology, talent development, and building inclusive workplaces.',
      isAlumni: true,
      isStudent: false,
      skills: ['HR Management', 'Leadership', 'Public Speaking']
    },
    {
      username: 'alex_kim',
      password: await hashPassword('password123'),
      email: 'alex.kim@example.com',
      firstName: 'Alex',
      lastName: 'Kim',
      profilePicture: 'https://randomuser.me/api/portraits/men/9.jpg',
      graduationYear: 2007,
      major: 'Supply Chain Management',
      company: 'Global Logistics Solutions',
      position: 'VP of Operations',
      bio: 'Expert in optimizing supply chains and operations across global enterprises.',
      isAlumni: true,
      isStudent: false,
      skills: ['Supply Chain', 'Leadership', 'Digital Transformation']
    },
    {
      username: 'natalie_clark',
      password: await hashPassword('password123'),
      email: 'natalie.clark@example.com',
      firstName: 'Natalie',
      lastName: 'Clark',
      profilePicture: 'https://randomuser.me/api/portraits/women/10.jpg',
      graduationYear: 2003,
      major: 'Healthcare Administration',
      company: 'MedTech Innovations',
      position: 'Healthcare Executive',
      bio: 'Dedicated to improving healthcare delivery through innovation and effective management.',
      isAlumni: true,
      isStudent: false,
      skills: ['Healthcare', 'Leadership', 'Digital Transformation']
    },
    {
      username: 'robert_thakur',
      password: await hashPassword('password123'),
      email: 'robert.thakur@example.com',
      firstName: 'Robert',
      lastName: 'Thakur',
      profilePicture: 'https://randomuser.me/api/portraits/men/11.jpg',
      graduationYear: 2011,
      major: 'Education Technology',
      company: 'EdTech Solutions',
      position: 'Founder & CEO',
      bio: 'Passionate about transforming education through innovative technology solutions.',
      isAlumni: true,
      isStudent: false,
      skills: ['Education', 'Entrepreneurship', 'Product Management']
    },
    {
      username: 'jennifer_lee',
      password: await hashPassword('password123'),
      email: 'jennifer.lee@example.com',
      firstName: 'Jennifer',
      lastName: 'Lee',
      profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg',
      graduationYear: 2001,
      major: 'Environmental Science',
      company: 'Sustainable Futures',
      position: 'Chief Sustainability Officer',
      bio: 'Leading sustainability initiatives and helping organizations reduce their environmental impact.',
      isAlumni: true,
      isStudent: false,
      skills: ['Sustainability', 'Leadership', 'Public Speaking']
    },
    {
      username: 'mark_wilson',
      password: await hashPassword('password123'),
      email: 'mark.wilson@example.com',
      firstName: 'Mark',
      lastName: 'Wilson',
      profilePicture: 'https://randomuser.me/api/portraits/men/13.jpg',
      graduationYear: 2009,
      major: 'Sales & Marketing',
      company: 'Sales Accelerator',
      position: 'VP of Sales',
      bio: 'Sales leader with a track record of building high-performing sales teams and strategies.',
      isAlumni: true,
      isStudent: false,
      skills: ['Sales', 'Marketing', 'Leadership']
    },
    {
      username: 'sophia_nguyen',
      password: await hashPassword('password123'),
      email: 'sophia.nguyen@example.com',
      firstName: 'Sophia',
      lastName: 'Nguyen',
      profilePicture: 'https://randomuser.me/api/portraits/women/14.jpg',
      graduationYear: 2014,
      major: 'Blockchain Technology',
      company: 'Blockchain Innovations',
      position: 'Blockchain Architect',
      bio: 'Pioneering blockchain solutions for enterprise applications and digital transformation.',
      isAlumni: true,
      isStudent: false,
      skills: ['Blockchain', 'Software Engineering', 'Digital Transformation']
    },
    {
      username: 'thomas_becker',
      password: await hashPassword('password123'),
      email: 'thomas.becker@example.com',
      firstName: 'Thomas',
      lastName: 'Becker',
      profilePicture: 'https://randomuser.me/api/portraits/men/15.jpg',
      graduationYear: 2002,
      major: 'Strategic Management',
      company: 'Strategic Consulting Group',
      position: 'Managing Partner',
      bio: 'Helping organizations develop and implement effective business strategies for growth.',
      isAlumni: true,
      isStudent: false,
      skills: ['Business Strategy', 'Leadership', 'Digital Transformation']
    },
    {
      username: 'olivia_smith',
      password: await hashPassword('password123'),
      email: 'olivia.smith@example.com',
      firstName: 'Olivia',
      lastName: 'Smith',
      profilePicture: 'https://randomuser.me/api/portraits/women/16.jpg',
      graduationYear: 2013,
      major: 'Digital Marketing',
      company: 'Digital Growth Partners',
      position: 'Digital Marketing Director',
      bio: 'Specializing in digital marketing strategies that drive measurable business results.',
      isAlumni: true,
      isStudent: false,
      skills: ['Marketing', 'Digital Transformation', 'Public Speaking']
    },
    {
      username: 'daniel_martin',
      password: await hashPassword('password123'),
      email: 'daniel.martin@example.com',
      firstName: 'Daniel',
      lastName: 'Martin',
      profilePicture: 'https://randomuser.me/api/portraits/men/17.jpg',
      graduationYear: 2006,
      major: 'Artificial Intelligence',
      company: 'AI Solutions',
      position: 'AI Research Director',
      bio: 'Leading research and development in artificial intelligence applications for business.',
      isAlumni: true,
      isStudent: false,
      skills: ['Artificial Intelligence', 'Software Engineering', 'Product Management']
    },
    {
      username: 'grace_taylor',
      password: await hashPassword('password123'),
      email: 'grace.taylor@example.com',
      firstName: 'Grace',
      lastName: 'Taylor',
      profilePicture: 'https://randomuser.me/api/portraits/women/18.jpg',
      graduationYear: 2004,
      major: 'Public Relations',
      company: 'Strategic Communications',
      position: 'Communications Director',
      bio: 'Expert in strategic communications, crisis management, and building brand reputation.',
      isAlumni: true,
      isStudent: false,
      skills: ['Public Speaking', 'Marketing', 'Leadership']
    },
    {
      username: 'samuel_brown',
      password: await hashPassword('password123'),
      email: 'samuel.brown@example.com',
      firstName: 'Samuel',
      lastName: 'Brown',
      profilePicture: 'https://randomuser.me/api/portraits/men/19.jpg',
      graduationYear: 1997,
      major: 'Product Design',
      company: 'Product Innovations',
      position: 'Chief Product Officer',
      bio: 'Experienced in product strategy, design thinking, and bringing innovative products to market.',
      isAlumni: true,
      isStudent: false,
      skills: ['Product Management', 'UX/UI Design', 'Leadership']
    },
    {
      username: 'elena_mitchell',
      password: await hashPassword('password123'),
      email: 'elena.mitchell@example.com',
      firstName: 'Elena',
      lastName: 'Mitchell',
      profilePicture: 'https://randomuser.me/api/portraits/women/20.jpg',
      graduationYear: 1995,
      major: 'International Business',
      company: 'Global Trade Partners',
      position: 'Global Strategy Executive',
      bio: 'Specializing in international business development and cross-cultural leadership.',
      isAlumni: true,
      isStudent: false,
      skills: ['Business Strategy', 'Leadership', 'Sales']
    }
  ];
  
  // Add mentors to database
  console.log('Adding mentors...');
  for (const mentor of mentors) {
    try {
      // Check if user with this username or email already exists
      const existingUser = await db.select()
        .from(users)
        .where(or(
          eq(users.username, mentor.username),
          eq(users.email, mentor.email)
        ))
        .limit(1);
        
      if (existingUser.length === 0) {
        // Extract skills from mentor object
        const mentorSkillsList = mentor.skills;
        delete (mentor as any).skills;
        
        // Add the mentor
        const [newUser] = await db.insert(users).values(mentor).returning();
        console.log(`Added mentor: ${mentor.firstName} ${mentor.lastName}`);
        
        // Add skills for this mentor
        for (const skillName of mentorSkillsList) {
          const skillId = skillMap.get(skillName);
          if (skillId) {
            await db.insert(userSkills).values({
              userId: newUser.id,
              skillId: skillId
            });
            console.log(`Added skill '${skillName}' to ${mentor.firstName} ${mentor.lastName}`);
          }
        }
      } else {
        console.log(`User already exists: ${mentor.username}`);
      }
    } catch (error) {
      console.error(`Error adding mentor ${mentor.username}:`, error);
    }
  }
  
  console.log('Mentor seeding completed!');
}

seedMentors()
  .catch(error => {
    console.error('Error in seed script:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed script finished. You can now terminate the process.');
  });