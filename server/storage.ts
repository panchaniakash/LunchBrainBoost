import {
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  scores, type Score, type InsertScore,
  hints, type Hint, type InsertHint,
  DailyChallenge, MemoryCard
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface with all required CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game methods
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  
  // Score methods
  getScores(gameId?: number, userId?: number): Promise<Score[]>;
  getBestScore(gameId: number, userId?: number): Promise<Score | undefined>;
  createScore(score: InsertScore): Promise<Score>;
  
  // Hint methods
  getHints(gameId: number): Promise<Hint[]>;
  getRandomHint(gameId: number): Promise<Hint | undefined>;
  createHint(hint: InsertHint): Promise<Hint>;
  
  // Daily challenge
  getDailyChallenge(gameId: number): Promise<DailyChallenge | undefined>;
  
  // Memory cards for memory match game
  getMemoryCards(difficulty: number): Promise<MemoryCard[]>;
}

export class DatabaseStorage implements IStorage {
  private memoryIcons: string[] = [
    "home", "favorite", "star", "settings", "person", 
    "lightbulb", "pets", "music_note", "school", "work",
    "flight", "restaurant", "shopping_cart", "local_cafe", "directions_bike",
    "beach_access", "local_movies", "sports_basketball", "sports_soccer", "cake"
  ];

  private dailyChallenges: DailyChallenge[] = [];
  private challengeCurrentId: number = 1;

  constructor() {
    // Note: Database initialization happens in db.ts
    // We'll initialize default data when we first query for it
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Game methods
  async getGames(): Promise<Game[]> {
    const existingGames = await db.select().from(games);
    
    // If no games exist yet, initialize them
    if (existingGames.length === 0) {
      await this.initializeGames();
      return this.getGames();
    }
    
    return existingGames;
  }
  
  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }
  
  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }
  
  // Score methods
  async getScores(gameId?: number, userId?: number): Promise<Score[]> {
    let query = db.select().from(scores);
    
    if (gameId !== undefined && userId !== undefined) {
      return await db.select().from(scores)
        .where(eq(scores.gameId, gameId))
        .where(eq(scores.userId, userId));
    } else if (gameId !== undefined) {
      return await db.select().from(scores)
        .where(eq(scores.gameId, gameId));
    } else if (userId !== undefined) {
      return await db.select().from(scores)
        .where(eq(scores.userId, userId));
    }
    
    return await query;
  }
  
  async getBestScore(gameId: number, userId?: number): Promise<Score | undefined> {
    if (userId !== undefined) {
      const results = await db.select().from(scores)
        .where(eq(scores.gameId, gameId))
        .where(eq(scores.userId, userId))
        .orderBy(desc(scores.score))
        .limit(1);
      
      return results[0];
    } else {
      const results = await db.select().from(scores)
        .where(eq(scores.gameId, gameId))
        .orderBy(desc(scores.score))
        .limit(1);
      
      return results[0];
    }
  }
  
  async createScore(score: InsertScore): Promise<Score> {
    // Ensure date is set if not provided
    if (!score.date) {
      score.date = new Date();
    }
    
    const [newScore] = await db.insert(scores).values(score).returning();
    return newScore;
  }
  
  // Hint methods
  async getHints(gameId: number): Promise<Hint[]> {
    const gameHints = await db.select().from(hints).where(eq(hints.gameId, gameId));
    
    // If no hints exist yet for this game, initialize them
    if (gameHints.length === 0) {
      await this.initializeHints();
      return this.getHints(gameId);
    }
    
    return gameHints;
  }
  
  async getRandomHint(gameId: number): Promise<Hint | undefined> {
    const gameHints = await this.getHints(gameId);
    if (gameHints.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * gameHints.length);
    return gameHints[randomIndex];
  }
  
  async createHint(hint: InsertHint): Promise<Hint> {
    const [newHint] = await db.insert(hints).values(hint).returning();
    return newHint;
  }
  
  // Daily challenge methods - we'll keep these in memory for simplicity
  async getDailyChallenge(gameId: number): Promise<DailyChallenge | undefined> {
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's challenge for the specified game
    return this.dailyChallenges.find(
      challenge => challenge.gameId === gameId && challenge.date === today
    ) || this.createDailyChallenge(gameId);
  }
  
  // Memory card generation for memory match game
  async getMemoryCards(difficulty: number = 1): Promise<MemoryCard[]> {
    // Determine number of pairs based on difficulty (3-10 pairs)
    const pairCount = Math.min(10, Math.max(3, 3 + difficulty));
    
    // Shuffle the icons and take the number we need
    const shuffledIcons = [...this.memoryIcons].sort(() => 0.5 - Math.random());
    const selectedIcons = shuffledIcons.slice(0, pairCount);
    
    // Create pairs of cards
    const cards: MemoryCard[] = [];
    selectedIcons.forEach((icon, index) => {
      // Create two cards with the same icon (a pair)
      cards.push({ id: index * 2, icon, isFlipped: false, isMatched: false });
      cards.push({ id: index * 2 + 1, icon, isFlipped: false, isMatched: false });
    });
    
    // Shuffle the cards
    return cards.sort(() => 0.5 - Math.random());
  }
  
  // Helper methods for initialization
  private async initializeGames() {
    const defaultGames: InsertGame[] = [
      {
        name: "Memory Match",
        description: "Match pairs of hidden cards before time runs out",
        timeEstimate: "5 min",
        iconName: "grid_view",
      },
      {
        name: "Pattern Recall",
        description: "Memorize and repeat increasingly complex sequences",
        timeEstimate: "3 min",
        iconName: "touch_app",
      },
      {
        name: "Number Hunt",
        description: "Find numbers in ascending order as quickly as possible",
        timeEstimate: "7 min",
        iconName: "filter_1",
      },
    ];
    
    for (const game of defaultGames) {
      await this.createGame(game);
    }
  }
  
  private async initializeHints() {
    const memoryMatchHints: InsertHint[] = [
      { gameId: 1, hintText: "Try to focus on a few cards at a time rather than the whole board" },
      { gameId: 1, hintText: "Create a mental grid map to remember where you've seen certain icons" },
      { gameId: 1, hintText: "Start with the corners and edges to create reference points" }
    ];
    
    const patternRecallHints: InsertHint[] = [
      { gameId: 2, hintText: "Try assigning names or numbers to each colored button" },
      { gameId: 2, hintText: "Look for patterns or chunks within the longer sequences" },
      { gameId: 2, hintText: "Rehearse the sequence mentally before attempting to repeat it" }
    ];
    
    const numberHuntHints: InsertHint[] = [
      { gameId: 3, hintText: "Scan the grid row by row to find the next number" },
      { gameId: 3, hintText: "Focus on one quadrant of the grid at a time" },
      { gameId: 3, hintText: "Notice patterns in the distribution of numbers" }
    ];
    
    const allHints = [...memoryMatchHints, ...patternRecallHints, ...numberHuntHints];
    
    for (const hint of allHints) {
      await this.createHint(hint);
    }
  }
  
  private createDailyChallenge(gameId: number): DailyChallenge {
    const today = new Date().toISOString().split('T')[0];
    const id = this.challengeCurrentId++;
    
    const challenge: DailyChallenge = {
      id,
      gameId,
      date: today,
      difficulty: Math.floor(Math.random() * 5) + 1 // Random difficulty 1-5
    };
    
    this.dailyChallenges.push(challenge);
    return challenge;
  }
}

export const storage = new DatabaseStorage();
