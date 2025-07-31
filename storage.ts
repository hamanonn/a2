import { users, type User, type InsertUser, type UpdateUserProfile } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, profileData: UpdateUserProfile): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      profileImage: null,
      displayName: null,
      bio: null,
      totalPoints: 0,
      joinedAt: new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(id: number, profileData: UpdateUserProfile): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...profileData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();
