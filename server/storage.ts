import {
  users, type User, type InsertUser,
  skills, type Skill, type InsertSkill,
  userSkills, type UserSkill, type InsertUserSkill,
  mentorships, type Mentorship, type InsertMentorship,
  events, type Event, type InsertEvent,
  eventAttendees, type EventAttendee, type InsertEventAttendee,
  resources, type Resource, type InsertResource,
  messages, type Message, type InsertMessage,
  badges, type Badge, type InsertBadge,
  userBadges, type UserBadge, type InsertUserBadge,
  connections, type Connection, type InsertConnection
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import pg from "pg";
import { and, eq, like, gte, desc, or } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  searchUsers(query: string, limit?: number): Promise<User[]>;
  
  // Skill methods
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillByName(name: string): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  getAllSkills(): Promise<Skill[]>;
  
  // UserSkill methods
  addUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;
  getUserSkills(userId: number): Promise<Skill[]>;
  removeUserSkill(userId: number, skillId: number): Promise<void>;
  
  // Mentorship methods
  createMentorship(mentorship: InsertMentorship): Promise<Mentorship>;
  getMentorship(id: number): Promise<Mentorship | undefined>;
  getUserMentorships(userId: number, role: 'mentor' | 'mentee'): Promise<Mentorship[]>;
  updateMentorshipStatus(id: number, status: string): Promise<Mentorship | undefined>;
  
  // Connection methods
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnection(id: number): Promise<Connection | undefined>;
  getConnectionByUsers(requesterId: number, receiverId: number): Promise<Connection | undefined>;
  getUserConnections(userId: number, status?: string): Promise<Connection[]>;
  getUserConnectionsWithDetails(userId: number, status?: string): Promise<Array<Connection & { user: Omit<User, 'password'> }>>;
  updateConnectionStatus(id: number, status: string): Promise<Connection | undefined>;
  
  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(limit?: number): Promise<Event[]>;
  getUpcomingEvents(limit?: number): Promise<Event[]>;
  
  // EventAttendee methods
  addEventAttendee(eventAttendee: InsertEventAttendee): Promise<EventAttendee>;
  getEventAttendees(eventId: number): Promise<User[]>;
  getUserEvents(userId: number): Promise<Event[]>;
  updateAttendeeStatus(eventId: number, userId: number, status: string): Promise<EventAttendee | undefined>;
  
  // Resource methods
  createResource(resource: InsertResource): Promise<Resource>;
  getResource(id: number): Promise<Resource | undefined>;
  getAllResources(limit?: number): Promise<Resource[]>;
  getResourcesByType(type: string, limit?: number): Promise<Resource[]>;
  
  // Message methods
  sendMessage(message: InsertMessage): Promise<Message>;
  getMessage(id: number): Promise<Message | undefined>;
  getUserMessages(userId: number, role: 'sender' | 'receiver'): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Badge methods
  createBadge(badge: InsertBadge): Promise<Badge>;
  getBadge(id: number): Promise<Badge | undefined>;
  getAllBadges(): Promise<Badge[]>;
  
  // UserBadge methods
  awardBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  getUserBadge(id: number): Promise<UserBadge | undefined>;
  getUserBadges(userId: number): Promise<UserBadge[]>;
  getUserBadgesWithDetails(userId: number): Promise<Array<UserBadge & { badge: Badge }>>;
  updateBadgeHighlight(id: number, highlighted: boolean): Promise<UserBadge | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Create a pool instance for the session store
    const sessionPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    
    this.sessionStore = new PostgresSessionStore({
      pool: sessionPool,
      createTableIfMissing: true,
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const newUser = {
      ...insertUser,
      profilePicture: insertUser.profilePicture || null,
      graduationYear: insertUser.graduationYear || null,
      major: insertUser.major || null,
      company: insertUser.company || null,
      position: insertUser.position || null,
      bio: insertUser.bio || null,
      isAlumni: Boolean(insertUser.isAlumni),
      isStudent: insertUser.isStudent !== undefined ? Boolean(insertUser.isStudent) : true,
      isMentor: insertUser.isMentor !== undefined ? Boolean(insertUser.isMentor) : false,
      createdAt: new Date()
    };
    
    const result = await db.insert(users).values(newUser).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }
  
  async searchUsers(query: string, limit = 10): Promise<User[]> {
    if (!query) {
      return db.select().from(users).limit(limit);
    }
    
    const likeQuery = `%${query}%`;
    return db.select()
      .from(users)
      .where(
        or(
          like(users.firstName, likeQuery),
          like(users.lastName, likeQuery),
          like(users.username, likeQuery),
          like(users.email, likeQuery),
          like(users.company || '', likeQuery),
          like(users.position || '', likeQuery),
          like(users.major || '', likeQuery)
        )
      )
      .limit(limit);
  }
  
  // Skill methods
  async getSkill(id: number): Promise<Skill | undefined> {
    const result = await db.select().from(skills).where(eq(skills.id, id));
    return result[0];
  }
  
  async getSkillByName(name: string): Promise<Skill | undefined> {
    const result = await db.select()
      .from(skills)
      .where(eq(skills.name, name));
    
    return result[0];
  }
  
  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const result = await db.insert(skills)
      .values(insertSkill)
      .returning();
    
    return result[0];
  }
  
  async getAllSkills(): Promise<Skill[]> {
    return db.select().from(skills);
  }
  
  // UserSkill methods
  async addUserSkill(insertUserSkill: InsertUserSkill): Promise<UserSkill> {
    const result = await db.insert(userSkills)
      .values(insertUserSkill)
      .returning();
    
    return result[0];
  }
  
  async getUserSkills(userId: number): Promise<Skill[]> {
    return db.select({
        id: skills.id,
        name: skills.name
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId));
  }
  
  async removeUserSkill(userId: number, skillId: number): Promise<void> {
    await db.delete(userSkills)
      .where(
        and(
          eq(userSkills.userId, userId),
          eq(userSkills.skillId, skillId)
        )
      );
  }
  
  // Mentorship methods
  async createMentorship(insertMentorship: InsertMentorship): Promise<Mentorship> {
    const result = await db.insert(mentorships)
      .values({
        ...insertMentorship,
        status: insertMentorship.status || 'pending',
        createdAt: new Date()
      })
      .returning();
    
    return result[0];
  }
  
  async getMentorship(id: number): Promise<Mentorship | undefined> {
    const result = await db.select()
      .from(mentorships)
      .where(eq(mentorships.id, id));
    
    return result[0];
  }
  
  async getUserMentorships(userId: number, role: 'mentor' | 'mentee'): Promise<Mentorship[]> {
    if (role === 'mentor') {
      return db.select()
        .from(mentorships)
        .where(eq(mentorships.mentorId, userId));
    } else {
      return db.select()
        .from(mentorships)
        .where(eq(mentorships.menteeId, userId));
    }
  }
  
  async updateMentorshipStatus(id: number, status: string): Promise<Mentorship | undefined> {
    const result = await db.update(mentorships)
      .set({ status })
      .where(eq(mentorships.id, id))
      .returning();
    
    return result[0];
  }
  
  // Connection methods
  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const result = await db.insert(connections)
      .values({
        ...insertConnection,
        status: insertConnection.status || 'pending',
        createdAt: new Date()
      })
      .returning();
    
    return result[0];
  }
  
  async getConnection(id: number): Promise<Connection | undefined> {
    const result = await db.select()
      .from(connections)
      .where(eq(connections.id, id));
    
    return result[0];
  }
  
  async getConnectionByUsers(requesterId: number, receiverId: number): Promise<Connection | undefined> {
    const result = await db.select()
      .from(connections)
      .where(
        or(
          and(
            eq(connections.requesterId, requesterId),
            eq(connections.receiverId, receiverId)
          ),
          and(
            eq(connections.requesterId, receiverId),
            eq(connections.receiverId, requesterId)
          )
        )
      );
    
    return result[0];
  }
  
  async getUserConnections(userId: number, status?: string): Promise<Connection[]> {
    if (status) {
      return db.select()
        .from(connections)
        .where(
          and(
            or(
              eq(connections.requesterId, userId),
              eq(connections.receiverId, userId)
            ),
            eq(connections.status, status)
          )
        );
    } else {
      return db.select()
        .from(connections)
        .where(
          or(
            eq(connections.requesterId, userId),
            eq(connections.receiverId, userId)
          )
        );
    }
  }
  
  async getUserConnectionsWithDetails(userId: number, status?: string): Promise<Array<Connection & { user: Omit<User, 'password'> }>> {
    const userConnections = await this.getUserConnections(userId, status);
    const result: Array<Connection & { user: Omit<User, 'password'> }> = [];
    
    for (const connection of userConnections) {
      const otherUserId = connection.requesterId === userId ? connection.receiverId : connection.requesterId;
      const otherUser = await this.getUser(otherUserId);
      
      if (otherUser) {
        const { password, ...safeUser } = otherUser;
        result.push({
          ...connection,
          user: safeUser
        });
      }
    }
    
    return result;
  }
  
  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    const result = await db.update(connections)
      .set({ status })
      .where(eq(connections.id, id))
      .returning();
    
    return result[0];
  }
  
  // Event methods
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const newEvent = {
      ...insertEvent,
      location: insertEvent.location || null,
      isVirtual: Boolean(insertEvent.isVirtual),
      meetingLink: insertEvent.meetingLink || null,
      imageUrl: insertEvent.imageUrl || null,
      createdAt: new Date()
    };
    
    const result = await db.insert(events)
      .values(newEvent)
      .returning();
    
    return result[0];
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select()
      .from(events)
      .where(eq(events.id, id));
    
    return result[0];
  }
  
  async getAllEvents(limit = 100): Promise<Event[]> {
    return db.select()
      .from(events)
      .orderBy(desc(events.date))
      .limit(limit);
  }
  
  async getUpcomingEvents(limit = 10): Promise<Event[]> {
    const now = new Date();
    return db.select()
      .from(events)
      .where(gte(events.date, now))
      .orderBy(events.date)
      .limit(limit);
  }
  
  // EventAttendee methods
  async addEventAttendee(insertEventAttendee: InsertEventAttendee): Promise<EventAttendee> {
    const newAttendee = {
      ...insertEventAttendee,
      status: insertEventAttendee.status || 'going'
    };
    
    const result = await db.insert(eventAttendees)
      .values(newAttendee)
      .returning();
    
    return result[0];
  }
  
  async getEventAttendees(eventId: number): Promise<User[]> {
    return db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profilePicture: users.profilePicture,
        graduationYear: users.graduationYear,
        major: users.major,
        company: users.company,
        position: users.position,
        bio: users.bio,
        isAlumni: users.isAlumni,
        isStudent: users.isStudent,
        isMentor: users.isMentor,
        createdAt: users.createdAt,
        password: users.password
      })
      .from(eventAttendees)
      .innerJoin(users, eq(eventAttendees.userId, users.id))
      .where(eq(eventAttendees.eventId, eventId));
  }
  
  async getUserEvents(userId: number): Promise<Event[]> {
    return db.select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        location: events.location,
        isVirtual: events.isVirtual,
        meetingLink: events.meetingLink,
        organizerId: events.organizerId,
        imageUrl: events.imageUrl,
        createdAt: events.createdAt
      })
      .from(eventAttendees)
      .innerJoin(events, eq(eventAttendees.eventId, events.id))
      .where(eq(eventAttendees.userId, userId));
  }
  
  async updateAttendeeStatus(eventId: number, userId: number, status: string): Promise<EventAttendee | undefined> {
    const result = await db.update(eventAttendees)
      .set({ status })
      .where(
        and(
          eq(eventAttendees.eventId, eventId),
          eq(eventAttendees.userId, userId)
        )
      )
      .returning();
    
    return result[0];
  }
  
  // Resource methods
  async createResource(insertResource: InsertResource): Promise<Resource> {
    const result = await db.insert(resources)
      .values({
        ...insertResource,
        createdAt: new Date()
      })
      .returning();
    
    return result[0];
  }
  
  async getResource(id: number): Promise<Resource | undefined> {
    const result = await db.select()
      .from(resources)
      .where(eq(resources.id, id));
    
    return result[0];
  }
  
  async getAllResources(limit = 100): Promise<Resource[]> {
    return db.select()
      .from(resources)
      .orderBy(desc(resources.createdAt))
      .limit(limit);
  }
  
  async getResourcesByType(type: string, limit = 10): Promise<Resource[]> {
    return db.select()
      .from(resources)
      .where(eq(resources.type, type))
      .orderBy(desc(resources.createdAt))
      .limit(limit);
  }
  
  // Message methods
  async sendMessage(insertMessage: InsertMessage): Promise<Message> {
    const result = await db.insert(messages)
      .values({
        ...insertMessage,
        isRead: false,
        createdAt: new Date()
      })
      .returning();
    
    return result[0];
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    const result = await db.select()
      .from(messages)
      .where(eq(messages.id, id));
    
    return result[0];
  }
  
  async getUserMessages(userId: number, role: 'sender' | 'receiver'): Promise<Message[]> {
    if (role === 'sender') {
      return db.select()
        .from(messages)
        .where(eq(messages.senderId, userId))
        .orderBy(desc(messages.createdAt));
    } else {
      return db.select()
        .from(messages)
        .where(eq(messages.receiverId, userId))
        .orderBy(desc(messages.createdAt));
    }
  }
  
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.receiverId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.receiverId, user1Id)
          )
        )
      )
      .orderBy(messages.createdAt);
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const result = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    
    return result[0];
  }
  
  // Badge methods
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const result = await db.insert(badges)
      .values({
        ...insertBadge,
        tier: insertBadge.tier || 1,
        createdAt: new Date()
      })
      .returning();
    
    return result[0];
  }
  
  async getBadge(id: number): Promise<Badge | undefined> {
    const result = await db.select()
      .from(badges)
      .where(eq(badges.id, id));
    
    return result[0];
  }
  
  async getAllBadges(): Promise<Badge[]> {
    return db.select()
      .from(badges)
      .orderBy(badges.name);
  }
  
  // UserBadge methods
  async awardBadge(insertUserBadge: InsertUserBadge): Promise<UserBadge> {
    const result = await db.insert(userBadges)
      .values({
        ...insertUserBadge,
        highlighted: insertUserBadge.highlighted || false,
        earnedAt: new Date()
      })
      .returning();
    
    return result[0];
  }
  
  async getUserBadge(id: number): Promise<UserBadge | undefined> {
    const result = await db.select()
      .from(userBadges)
      .where(eq(userBadges.id, id));
    
    return result[0];
  }
  
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return db.select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
  }
  
  async getUserBadgesWithDetails(userId: number): Promise<Array<UserBadge & { badge: Badge }>> {
    const result = await db.select({
        userBadge: userBadges,
        badge: badges
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
    
    return result.map(item => ({
      ...item.userBadge,
      badge: item.badge
    }));
  }
  
  async updateBadgeHighlight(id: number, highlighted: boolean): Promise<UserBadge | undefined> {
    const result = await db.update(userBadges)
      .set({ highlighted })
      .where(eq(userBadges.id, id))
      .returning();
    
    return result[0];
  }
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private skillsMap: Map<number, Skill>;
  private userSkillsMap: Map<number, UserSkill>;
  private mentorshipsMap: Map<number, Mentorship>;
  private eventsMap: Map<number, Event>;
  private eventAttendeesMap: Map<number, EventAttendee>;
  private resourcesMap: Map<number, Resource>;
  private messagesMap: Map<number, Message>;
  private badgesMap: Map<number, Badge>;
  private userBadgesMap: Map<number, UserBadge>;
  private connectionsMap: Map<number, Connection>;
  
  sessionStore: session.Store;
  
  // Counters for IDs
  private userCounter: number;
  private skillCounter: number;
  private userSkillCounter: number;
  private mentorshipCounter: number;
  private eventCounter: number;
  private eventAttendeeCounter: number;
  private resourceCounter: number;
  private messageCounter: number;
  private badgeCounter: number;
  private userBadgeCounter: number;
  private connectionCounter: number;

  constructor() {
    this.usersMap = new Map();
    this.skillsMap = new Map();
    this.userSkillsMap = new Map();
    this.mentorshipsMap = new Map();
    this.eventsMap = new Map();
    this.eventAttendeesMap = new Map();
    this.resourcesMap = new Map();
    this.messagesMap = new Map();
    this.badgesMap = new Map();
    this.userBadgesMap = new Map();
    this.connectionsMap = new Map();
    
    this.userCounter = 1;
    this.skillCounter = 1;
    this.userSkillCounter = 1;
    this.mentorshipCounter = 1;
    this.eventCounter = 1;
    this.eventAttendeeCounter = 1;
    this.resourceCounter = 1;
    this.messageCounter = 1;
    this.badgeCounter = 1;
    this.userBadgeCounter = 1;
    this.connectionCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const timestamp = new Date();
    
    // Create user with all fields properly initialized
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: timestamp,
      profilePicture: insertUser.profilePicture || null,
      graduationYear: insertUser.graduationYear || null,
      major: insertUser.major || null,
      company: insertUser.company || null,
      position: insertUser.position || null,
      bio: insertUser.bio || null,
      isAlumni: Boolean(insertUser.isAlumni),
      isStudent: insertUser.isStudent !== undefined ? Boolean(insertUser.isStudent) : true,
      isMentor: insertUser.isMentor !== undefined ? Boolean(insertUser.isMentor) : false
    };
    
    this.usersMap.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }
  
  async searchUsers(query: string, limit = 10): Promise<User[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.usersMap.values())
      .filter(user => 
        user.username.toLowerCase().includes(lowercaseQuery) ||
        user.firstName.toLowerCase().includes(lowercaseQuery) ||
        user.lastName.toLowerCase().includes(lowercaseQuery) ||
        (user.major && user.major.toLowerCase().includes(lowercaseQuery)) ||
        (user.company && user.company.toLowerCase().includes(lowercaseQuery))
      )
      .slice(0, limit);
  }

  // Skill methods
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skillsMap.get(id);
  }
  
  async getSkillByName(name: string): Promise<Skill | undefined> {
    return Array.from(this.skillsMap.values()).find(
      (skill) => skill.name.toLowerCase() === name.toLowerCase(),
    );
  }
  
  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.skillCounter++;
    const skill: Skill = { ...insertSkill, id };
    this.skillsMap.set(id, skill);
    return skill;
  }
  
  async getAllSkills(): Promise<Skill[]> {
    return Array.from(this.skillsMap.values());
  }
  
  // UserSkill methods
  async addUserSkill(insertUserSkill: InsertUserSkill): Promise<UserSkill> {
    const id = this.userSkillCounter++;
    const userSkill: UserSkill = { ...insertUserSkill, id };
    this.userSkillsMap.set(id, userSkill);
    return userSkill;
  }
  
  async getUserSkills(userId: number): Promise<Skill[]> {
    const userSkillEntries = Array.from(this.userSkillsMap.values())
      .filter(userSkill => userSkill.userId === userId);
    
    return Promise.all(
      userSkillEntries.map(async entry => {
        const skill = await this.getSkill(entry.skillId);
        if (!skill) throw new Error(`Skill with id ${entry.skillId} not found`);
        return skill;
      })
    );
  }
  
  async removeUserSkill(userId: number, skillId: number): Promise<void> {
    const userSkillEntry = Array.from(this.userSkillsMap.values())
      .find(entry => entry.userId === userId && entry.skillId === skillId);
    
    if (userSkillEntry) {
      this.userSkillsMap.delete(userSkillEntry.id);
    }
  }
  
  // Mentorship methods
  async createMentorship(insertMentorship: InsertMentorship): Promise<Mentorship> {
    const id = this.mentorshipCounter++;
    const timestamp = new Date();
    const mentorship: Mentorship = { 
      ...insertMentorship, 
      id, 
      createdAt: timestamp,
      status: insertMentorship.status || 'pending'
    };
    this.mentorshipsMap.set(id, mentorship);
    return mentorship;
  }
  
  async getMentorship(id: number): Promise<Mentorship | undefined> {
    return this.mentorshipsMap.get(id);
  }
  
  async getUserMentorships(userId: number, role: 'mentor' | 'mentee'): Promise<Mentorship[]> {
    return Array.from(this.mentorshipsMap.values())
      .filter(mentorship => 
        role === 'mentor' 
          ? mentorship.mentorId === userId 
          : mentorship.menteeId === userId
      );
  }
  
  async updateMentorshipStatus(id: number, status: string): Promise<Mentorship | undefined> {
    const mentorship = await this.getMentorship(id);
    if (!mentorship) return undefined;
    
    const updatedMentorship = { ...mentorship, status };
    this.mentorshipsMap.set(id, updatedMentorship);
    return updatedMentorship;
  }
  
  // Event methods
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventCounter++;
    const timestamp = new Date();
    const event: Event = { 
      ...insertEvent, 
      id, 
      createdAt: timestamp,
      location: insertEvent.location || null,
      isVirtual: Boolean(insertEvent.isVirtual),
      meetingLink: insertEvent.meetingLink || null,
      imageUrl: insertEvent.imageUrl || null
    };
    this.eventsMap.set(id, event);
    return event;
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.eventsMap.get(id);
  }
  
  async getAllEvents(limit = 100): Promise<Event[]> {
    return Array.from(this.eventsMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
  
  async getUpcomingEvents(limit = 10): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.eventsMap.values())
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }
  
  // EventAttendee methods
  async addEventAttendee(insertEventAttendee: InsertEventAttendee): Promise<EventAttendee> {
    const id = this.eventAttendeeCounter++;
    const eventAttendee: EventAttendee = { 
      ...insertEventAttendee, 
      id,
      status: insertEventAttendee.status || 'going'
    };
    this.eventAttendeesMap.set(id, eventAttendee);
    return eventAttendee;
  }
  
  async getEventAttendees(eventId: number): Promise<User[]> {
    const attendeeEntries = Array.from(this.eventAttendeesMap.values())
      .filter(attendee => attendee.eventId === eventId);
    
    return Promise.all(
      attendeeEntries.map(async entry => {
        const user = await this.getUser(entry.userId);
        if (!user) throw new Error(`User with id ${entry.userId} not found`);
        return user;
      })
    );
  }
  
  async getUserEvents(userId: number): Promise<Event[]> {
    const attendeeEntries = Array.from(this.eventAttendeesMap.values())
      .filter(attendee => attendee.userId === userId);
    
    return Promise.all(
      attendeeEntries.map(async entry => {
        const event = await this.getEvent(entry.eventId);
        if (!event) throw new Error(`Event with id ${entry.eventId} not found`);
        return event;
      })
    );
  }
  
  async updateAttendeeStatus(eventId: number, userId: number, status: string): Promise<EventAttendee | undefined> {
    const attendeeEntry = Array.from(this.eventAttendeesMap.values())
      .find(entry => entry.eventId === eventId && entry.userId === userId);
    
    if (!attendeeEntry) return undefined;
    
    const updatedAttendee = { ...attendeeEntry, status };
    this.eventAttendeesMap.set(attendeeEntry.id, updatedAttendee);
    return updatedAttendee;
  }
  
  // Resource methods
  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.resourceCounter++;
    const timestamp = new Date();
    const resource: Resource = { ...insertResource, id, createdAt: timestamp };
    this.resourcesMap.set(id, resource);
    return resource;
  }
  
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resourcesMap.get(id);
  }
  
  async getAllResources(limit = 100): Promise<Resource[]> {
    return Array.from(this.resourcesMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  async getResourcesByType(type: string, limit = 10): Promise<Resource[]> {
    return Array.from(this.resourcesMap.values())
      .filter(resource => resource.type === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  // Message methods
  async sendMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCounter++;
    const timestamp = new Date();
    const message: Message = { ...insertMessage, id, isRead: false, createdAt: timestamp };
    this.messagesMap.set(id, message);
    return message;
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messagesMap.get(id);
  }
  
  async getUserMessages(userId: number, role: 'sender' | 'receiver'): Promise<Message[]> {
    return Array.from(this.messagesMap.values())
      .filter(message => 
        role === 'sender' 
          ? message.senderId === userId 
          : message.receiverId === userId
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messagesMap.values())
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = await this.getMessage(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messagesMap.set(id, updatedMessage);
    return updatedMessage;
  }
  
  // Badge methods
  
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = this.badgeCounter++;
    const badge: Badge = { 
      ...insertBadge, 
      id,
      createdAt: new Date(),
      tier: insertBadge.tier || 1
    };
    this.badgesMap.set(id, badge);
    return badge;
  }
  
  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badgesMap.get(id);
  }
  
  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badgesMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // UserBadge methods
  async awardBadge(insertUserBadge: InsertUserBadge): Promise<UserBadge> {
    const id = this.userBadgeCounter++;
    const timestamp = new Date();
    const userBadge: UserBadge = { 
      ...insertUserBadge, 
      id, 
      earnedAt: timestamp,
      highlighted: insertUserBadge.highlighted || false 
    };
    this.userBadgesMap.set(id, userBadge);
    return userBadge;
  }
  
  async getUserBadge(id: number): Promise<UserBadge | undefined> {
    return this.userBadgesMap.get(id);
  }
  
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return Array.from(this.userBadgesMap.values())
      .filter(badge => badge.userId === userId);
  }
  
  async getUserBadgesWithDetails(userId: number): Promise<Array<UserBadge & { badge: Badge }>> {
    const userBadges = await this.getUserBadges(userId);
    
    return Promise.all(
      userBadges.map(async userBadge => {
        const badge = await this.getBadge(userBadge.badgeId);
        if (!badge) throw new Error(`Badge with id ${userBadge.badgeId} not found`);
        return {
          ...userBadge,
          badge
        };
      })
    );
  }
  
  async updateBadgeHighlight(id: number, highlighted: boolean): Promise<UserBadge | undefined> {
    const userBadge = await this.getUserBadge(id);
    if (!userBadge) return undefined;
    
    const updatedUserBadge = { ...userBadge, highlighted };
    this.userBadgesMap.set(id, updatedUserBadge);
    return updatedUserBadge;
  }
  
  // Connection methods
  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const id = this.connectionCounter++;
    const timestamp = new Date();
    const connection: Connection = {
      ...insertConnection,
      id,
      createdAt: timestamp,
      status: insertConnection.status || 'pending'
    };
    this.connectionsMap.set(id, connection);
    return connection;
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    return this.connectionsMap.get(id);
  }

  async getConnectionByUsers(requesterId: number, receiverId: number): Promise<Connection | undefined> {
    return Array.from(this.connectionsMap.values()).find(
      connection =>
        (connection.requesterId === requesterId && connection.receiverId === receiverId) ||
        (connection.requesterId === receiverId && connection.receiverId === requesterId)
    );
  }

  async getUserConnections(userId: number, status?: string): Promise<Connection[]> {
    let connections = Array.from(this.connectionsMap.values()).filter(
      connection =>
        connection.requesterId === userId || connection.receiverId === userId
    );
    
    if (status) {
      connections = connections.filter(connection => connection.status === status);
    }
    
    return connections;
  }

  async getUserConnectionsWithDetails(userId: number, status?: string): Promise<Array<Connection & { user: Omit<User, 'password'> }>> {
    const connections = await this.getUserConnections(userId, status);
    const result: Array<Connection & { user: Omit<User, 'password'> }> = [];
    
    for (const connection of connections) {
      const otherUserId = connection.requesterId === userId ? connection.receiverId : connection.requesterId;
      const otherUser = await this.getUser(otherUserId);
      
      if (otherUser) {
        const { password, ...safeUser } = otherUser;
        result.push({
          ...connection,
          user: safeUser
        });
      }
    }
    
    return result;
  }

  async updateConnectionStatus(id: number, status: string): Promise<Connection | undefined> {
    const connection = await this.getConnection(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, status };
    this.connectionsMap.set(id, updatedConnection);
    return updatedConnection;
  }
}

// Use the DatabaseStorage implementation since we have provisioned a PostgreSQL database
export const storage = new DatabaseStorage();
