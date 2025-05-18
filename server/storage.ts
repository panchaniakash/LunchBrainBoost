import {
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  scores, type Score, type InsertScore,
  hints, type Hint, type InsertHint,
  DailyChallenge, MemoryCard
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private scores: Score[];
  private hints: Hint[];
  private dailyChallenges: DailyChallenge[];
  private memoryIcons: string[];
  
  private userCurrentId: number;
  private gameCurrentId: number;
  private scoreCurrentId: number;
  private hintCurrentId: number;
  private challengeCurrentId: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.scores = [];
    this.hints = [];
    this.dailyChallenges = [];
    this.memoryIcons = [
      "home", "favorite", "star", "settings", "person", 
      "lightbulb", "pets", "music_note", "school", "work",
      "flight", "restaurant", "shopping_cart", "local_cafe", "directions_bike",
      "beach_access", "local_movies", "sports_basketball", "sports_soccer", "cake"
    ];
    
    this.userCurrentId = 1;
    this.gameCurrentId = 1;
    this.scoreCurrentId = 1;
    this.hintCurrentId = 1;
    this.challengeCurrentId = 1;
    
    // Initialize with default games
    this.initializeGames();
    this.initializeHints();
    this.initializeDailyChallenges();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Game methods
  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }
  
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }
  
  async createGame(game: InsertGame): Promise<Game> {
    const id = this.gameCurrentId++;
    const newGame: Game = { ...game, id };
    this.games.set(id, newGame);
    return newGame;
  }
  
  // Score methods
  async getScores(gameId?: number, userId?: number): Promise<Score[]> {
    return this.scores.filter(score => 
      (gameId === undefined || score.gameId === gameId) &&
      (userId === undefined || score.userId === userId)
    );
  }
  
  async getBestScore(gameId: number, userId?: number): Promise<Score | undefined> {
    const filteredScores = await this.getScores(gameId, userId);
    if (filteredScores.length === 0) return undefined;
    
    return filteredScores.reduce((highest, current) => 
      current.score > highest.score ? current : highest
    );
  }
  
  async createScore(score: InsertScore): Promise<Score> {
    const id = this.scoreCurrentId++;
    const newScore: Score = { ...score, id };
    this.scores.push(newScore);
    return newScore;
  }
  
  // Hint methods
  async getHints(gameId: number): Promise<Hint[]> {
    return this.hints.filter(hint => hint.gameId === gameId);
  }
  
  async getRandomHint(gameId: number): Promise<Hint | undefined> {
    const gameHints = await this.getHints(gameId);
    if (gameHints.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * gameHints.length);
    return gameHints[randomIndex];
  }
  
  async createHint(hint: InsertHint): Promise<Hint> {
    const id = this.hintCurrentId++;
    const newHint: Hint = { ...hint, id };
    this.hints.push(newHint);
    return newHint;
  }
  
  // Daily challenge methods
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
  private initializeGames() {
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
    
    defaultGames.forEach(game => this.createGame(game));
  }
  
  private initializeHints() {
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
    
    [...memoryMatchHints, ...patternRecallHints, ...numberHuntHints].forEach(
      hint => this.createHint(hint)
    );
  }
  
  private initializeDailyChallenges() {
    // Create today's challenges for each game with random difficulties
    const today = new Date().toISOString().split('T')[0];
    
    for (let gameId = 1; gameId <= 3; gameId++) {
      this.dailyChallenges.push({
        id: gameId,
        gameId,
        date: today,
        difficulty: Math.floor(Math.random() * 5) + 1 // Random difficulty 1-5
      });
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

export const storage = new MemStorage();
