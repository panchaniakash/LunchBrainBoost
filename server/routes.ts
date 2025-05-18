import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all games
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  // Get a specific game
  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });
  
  // Get daily challenge for a game
  app.get("/api/games/:id/daily", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const challenge = await storage.getDailyChallenge(gameId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Daily challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily challenge" });
    }
  });
  
  // Get memory cards for Memory Match game
  app.get("/api/games/memory-cards", async (req, res) => {
    try {
      const difficulty = req.query.difficulty ? parseInt(req.query.difficulty as string) : 1;
      const cards = await storage.getMemoryCards(difficulty);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate memory cards" });
    }
  });
  
  // Get scores for a game
  app.get("/api/scores", async (req, res) => {
    try {
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      const scores = await storage.getScores(gameId, userId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });
  
  // Get best score for a game
  app.get("/api/scores/best", async (req, res) => {
    try {
      if (!req.query.gameId) {
        return res.status(400).json({ message: "gameId is required" });
      }
      
      const gameId = parseInt(req.query.gameId as string);
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      const bestScore = await storage.getBestScore(gameId, userId);
      
      if (!bestScore) {
        return res.status(404).json({ message: "No scores found" });
      }
      
      res.json(bestScore);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch best score" });
    }
  });
  
  // Submit a new score
  app.post("/api/scores", async (req, res) => {
    try {
      const { gameId, userId, score } = req.body;
      
      if (!gameId || !score) {
        return res.status(400).json({ message: "gameId and score are required" });
      }
      
      const newScore = await storage.createScore({
        gameId,
        userId,
        score,
        date: new Date()
      });
      
      res.status(201).json(newScore);
    } catch (error) {
      res.status(500).json({ message: "Failed to save score" });
    }
  });
  
  // Get a random hint for a game
  app.get("/api/games/:id/hint", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const hint = await storage.getRandomHint(gameId);
      
      if (!hint) {
        return res.status(404).json({ message: "No hints found for this game" });
      }
      
      res.json(hint);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hint" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
