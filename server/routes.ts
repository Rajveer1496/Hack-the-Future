import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertEventSchema, 
  insertResourceSchema, 
  insertMentorshipSchema,
  insertEventAttendeeSchema,
  insertSkillSchema,
  insertUserSkillSchema,
  insertMessageSchema,
  insertBadgeSchema,
  insertUserBadgeSchema,
  insertConnectionSchema
} from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.searchUsers("", 100); // Empty query gets all users
      
      // Remove passwords from the response
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const users = await storage.searchUsers(query);
      
      // Remove passwords from the response
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from the response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const userData = req.body;
      
      // Don't allow password updates through this endpoint
      delete userData.password;
      
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from the response
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Skills routes
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/skills", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertSkillSchema.parse(req.body);
      
      // Check if skill already exists
      const existingSkill = await storage.getSkillByName(validatedData.name);
      if (existingSkill) {
        return res.status(400).json({ message: "Skill already exists" });
      }
      
      const skill = await storage.createSkill(validatedData);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Skills routes
  app.get("/api/users/:id/skills", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const skills = await storage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/:id/skills", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const userId = parseInt(req.params.id);
      const validatedData = insertUserSkillSchema.parse({ ...req.body, userId });
      
      const userSkill = await storage.addUserSkill(validatedData);
      res.status(201).json(userSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/users/:userId/skills/:skillId", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.userId)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const userId = parseInt(req.params.userId);
      const skillId = parseInt(req.params.skillId);
      
      await storage.removeUserSkill(userId, skillId);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mentorship routes
  app.post("/api/mentorships", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertMentorshipSchema.parse(req.body);
      
      // Ensure the authenticated user is either the mentor or mentee
      if (req.user.id !== validatedData.mentorId && req.user.id !== validatedData.menteeId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const mentorship = await storage.createMentorship(validatedData);
      res.status(201).json(mentorship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:id/mentorships", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = parseInt(req.params.id);
      const role = req.query.role as 'mentor' | 'mentee' || 'mentee';
      
      // Only allow users to view their own mentorships
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const mentorships = await storage.getUserMentorships(userId, role);
      res.json(mentorships);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/mentorships/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const mentorshipId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'active', 'completed', 'declined'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get the mentorship to verify permissions
      const mentorship = await storage.getMentorship(mentorshipId);
      if (!mentorship) {
        return res.status(404).json({ message: "Mentorship not found" });
      }
      
      // Only allow the mentor or mentee to update the status
      if (req.user.id !== mentorship.mentorId && req.user.id !== mentorship.menteeId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedMentorship = await storage.updateMentorshipStatus(mentorshipId, status);
      res.json(updatedMentorship);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Events routes
  app.post("/api/events", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertEventSchema.parse({
        ...req.body,
        organizerId: req.user.id
      });
      
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const limitParam = req.query.limit;
      const limit = limitParam ? parseInt(limitParam as string) : 10;
      
      const events = await storage.getUpcomingEvents(limit);
      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Event Attendees routes
  app.post("/api/events/:id/attendees", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const eventId = parseInt(req.params.id);
      const validatedData = insertEventAttendeeSchema.parse({
        eventId,
        userId: req.user.id,
        status: req.body.status || "going"
      });
      
      const eventAttendee = await storage.addEventAttendee(validatedData);
      res.status(201).json(eventAttendee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/:id/attendees", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const attendees = await storage.getEventAttendees(eventId);
      
      // Remove passwords from the response
      const safeAttendees = attendees.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeAttendees);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/events/:eventId/attendees/:userId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const eventId = parseInt(req.params.eventId);
      const userId = parseInt(req.params.userId);
      const { status } = req.body;
      
      // Only allow users to update their own status
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      if (!status || !['going', 'maybe', 'not_going'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedAttendee = await storage.updateAttendeeStatus(eventId, userId, status);
      
      if (!updatedAttendee) {
        return res.status(404).json({ message: "Attendee record not found" });
      }
      
      res.json(updatedAttendee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resources routes
  app.post("/api/resources", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertResourceSchema.parse({
        ...req.body,
        uploaderId: req.user.id
      });
      
      const resource = await storage.createResource(validatedData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/resources", async (req, res) => {
    try {
      const type = req.query.type as string;
      const limitParam = req.query.limit;
      const limit = limitParam ? parseInt(limitParam as string) : 100;
      
      let resources;
      if (type) {
        resources = await storage.getResourcesByType(type, limit);
      } else {
        resources = await storage.getAllResources(limit);
      }
      
      res.json(resources);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/resources/:id", async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      const resource = await storage.getResource(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Messages routes
  app.post("/api/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id
      });
      
      const message = await storage.sendMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const role = req.query.role as 'sender' | 'receiver' || 'receiver';
      
      const messages = await storage.getUserMessages(userId, role);
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/messages/conversation/:userId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const currentUserId = req.user.id;
      const otherUserId = parseInt(req.params.userId);
      
      const messages = await storage.getConversation(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only allow the recipient to mark a message as read
      if (req.user.id !== message.receiverId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedMessage = await storage.markMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Badges routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/badges/:id", async (req, res) => {
    try {
      const badgeId = parseInt(req.params.id);
      const badge = await storage.getBadge(badgeId);
      
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }
      
      res.json(badge);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/badges", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertBadgeSchema.parse(req.body);
      const badge = await storage.createBadge(validatedData);
      res.status(201).json(badge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Badges routes
  app.get("/api/user-badges/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userBadges = await storage.getUserBadgesWithDetails(userId);
      res.json(userBadges);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user-badges", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertUserBadgeSchema.parse(req.body);
      const userBadge = await storage.awardBadge(validatedData);
      res.status(201).json(userBadge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user-badges/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userBadgeId = parseInt(req.params.id);
      const { highlighted } = req.body;
      
      if (highlighted === undefined) {
        return res.status(400).json({ message: "Highlighted status is required" });
      }
      
      // Get the user badge to verify ownership
      const userBadge = await storage.getUserBadge(userBadgeId);
      if (!userBadge) {
        return res.status(404).json({ message: "User badge not found" });
      }
      
      // Only allow users to update their own badges
      if (req.user.id !== userBadge.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedUserBadge = await storage.updateBadgeHighlight(userBadgeId, highlighted);
      res.json(updatedUserBadge);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Connection routes
  app.post("/api/connections", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertConnectionSchema.parse({
        ...req.body,
        requesterId: req.user.id
      });
      
      // Check if connection already exists
      const existingConnection = await storage.getConnectionByUsers(
        validatedData.requesterId, 
        validatedData.receiverId
      );
      
      if (existingConnection) {
        return res.status(400).json({ 
          message: "Connection already exists", 
          connection: existingConnection 
        });
      }
      
      const connection = await storage.createConnection(validatedData);
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/connections", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const status = req.query.status as string;
      
      const connections = await storage.getUserConnectionsWithDetails(userId, status);
      res.json(connections);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/connections/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const connectionId = parseInt(req.params.id);
      const connection = await storage.getConnection(connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Only allow users who are part of the connection to see it
      if (connection.requesterId !== req.user.id && connection.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(connection);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/connections/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const connectionId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get the connection to verify permissions
      const connection = await storage.getConnection(connectionId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Only allow the receiver to update the status
      if (req.user.id !== connection.receiverId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedConnection = await storage.updateConnectionStatus(connectionId, status);
      res.json(updatedConnection);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Toggle mentor status
  app.post("/api/user/toggle-mentor", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Can only become a mentor if you're an alumni
      if (!user.isAlumni && !user.isMentor) {
        return res.status(403).json({ 
          message: "Only alumni can become mentors" 
        });
      }
      
      // Toggle the mentor status
      const updatedUser = await storage.updateUser(userId, { 
        isMentor: !user.isMentor 
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update mentor status" });
      }
      
      // Update the session user info
      const { password, ...safeUser } = updatedUser;
      req.user = updatedUser;
      
      res.json({ 
        ...safeUser,
        message: user.isMentor ? "You are no longer a mentor" : "You are now a mentor"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections with user IDs
  const connections = new Map<number, WebSocket>();
  
  wss.on('connection', (ws) => {
    let userId: number | null = null;
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication message to associate this connection with a user
        if (data.type === 'authenticate') {
          userId = parseInt(data.userId);
          connections.set(userId, ws);
          console.log(`User ${userId} connected via WebSocket`);
          ws.send(JSON.stringify({ type: 'auth_success' }));
          
          // Send message history to the user
          const messages = await storage.getUserMessages(userId, 'receiver');
          const sentMessages = await storage.getUserMessages(userId, 'sender');
          const allMessages = [...messages, ...sentMessages];
          
          // Send the message history to the user
          ws.send(JSON.stringify({
            type: 'history',
            messages: allMessages
          }));
          
          return;
        }
        
        // Handle chat messages
        if (data.type === 'message' && userId) {
          // Validate required fields
          if (!data.message || !data.message.receiverId || !data.message.content) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              error: 'Missing required fields' 
            }));
            return;
          }
          
          const receiverId = parseInt(data.message.receiverId);
          
          // Store message in database
          const message = await storage.sendMessage({
            senderId: userId,
            receiverId,
            content: data.message.content
          });
          
          // Send to the recipient if they're connected
          const recipientWs = connections.get(receiverId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'message',
              message
            }));
          }
          
          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: 'message',
            message
          }));
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          error: 'Invalid message format' 
        }));
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        console.log(`User ${userId} disconnected from WebSocket`);
        connections.delete(userId);
      }
    });
  });
  
  return httpServer;
}
