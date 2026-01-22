import supertest from 'supertest';
import { Server, type Socket as ServerSocket } from 'socket.io';
import { Server as HTTPServer, createServer } from 'http';
import { io as Client, type Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { app } from '../../app';
import GameManager from '../../services/games/gameManager';
import { FakeSOSocket, GameInstance, NimGameState, QuizGameState } from '../../types/types';
import * as util from '../../services/game.service';
import gameController from '../../controllers/game.controller';
import NimGame from '../../services/games/nim';
import QuizGame from '../../services/games/quiz';
import { MAX_NIM_OBJECTS } from '../../types/constants';
import getMultipleChoiceQuestion from '../../services/multipleChoiceQuestion.service';
import * as leaderboardService from '../../services/leaderboard.service';

jest.mock('../../services/multipleChoiceQuestion.service');

const mockGameManager = GameManager.getInstance();

describe('POST /create', () => {
  const addGameSpy = jest.spyOn(mockGameManager, 'addGame');

  describe('200 OK Requests', () => {
    it('should return 200 with a game ID when successful for Nim', async () => {
      addGameSpy.mockResolvedValueOnce('testGameID');

      const response = await supertest(app).post('/games/create').send({ gameType: 'Nim' });

      expect(response.status).toEqual(200);
      expect(response.text).toEqual(JSON.stringify('testGameID'));
      expect(addGameSpy).toHaveBeenCalledWith('Nim', undefined);
    });

    it('should return 200 with a game ID when successful for Quiz', async () => {
      addGameSpy.mockResolvedValueOnce('testGameID');

      const response = await supertest(app)
        .post('/games/create')
        .send({ gameType: 'Quiz', topic: 'Science' });

      expect(response.status).toEqual(200);
      expect(response.text).toEqual(JSON.stringify('testGameID'));
      expect(addGameSpy).toHaveBeenCalledWith('Quiz', 'Science');
    });
  });

  describe('400 Invalid Request', () => {
    it('should return 400 for an undefined response body', async () => {
      const response = await supertest(app).post('/games/create').send(undefined);

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for an empty response body', async () => {
      const response = await supertest(app).post('/games/create').send({});

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for an invalid game type', async () => {
      const response = await supertest(app).post('/games/create').send({ gameType: 'TicTacToe' });

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });
  });

  describe('500 Server Error Request', () => {
    it('should return 500 if addGame fails', async () => {
      addGameSpy.mockResolvedValueOnce({ error: 'test error' });

      const response = await supertest(app).post('/games/create').send({ gameType: 'Nim' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when creating game: test error');
      expect(addGameSpy).toHaveBeenCalledWith('Nim', undefined);
    });

    it('should return 500 if addGame throws an error', async () => {
      addGameSpy.mockRejectedValueOnce(new Error('test error'));

      const response = await supertest(app).post('/games/create').send({ gameType: 'Nim' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when creating game: test error');
      expect(addGameSpy).toHaveBeenCalledWith('Nim', undefined);
    });
  });
});

describe('POST /join', () => {
  const joinGameSpy = jest.spyOn(mockGameManager, 'joinGame');

  describe('200 OK Requests', () => {
    it('should return 200 with a game state when successful for Nim', async () => {
      const gameState: GameInstance<NimGameState> = {
        state: { moves: [], status: 'WAITING_TO_START', remainingObjects: MAX_NIM_OBJECTS },
        gameID: 'testGameID',
        players: ['user1'],
        gameType: 'Nim',
      };
      joinGameSpy.mockResolvedValueOnce(gameState);

      const response = await supertest(app)
        .post('/games/join')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(gameState);
      expect(joinGameSpy).toHaveBeenCalledWith('testGameID', 'user1');
    });

    it('should return 200 with a game state when successful for Quiz', async () => {
      const gameState: GameInstance<QuizGameState> = {
        state: {
          moves: [],
          status: 'WAITING_TO_START',
          questions: [],
          scores: {},
          topic: 'Science',
          readyToStart: false,
        },
        gameID: 'testGameID',
        players: ['user1'],
        gameType: 'Quiz',
      };
      joinGameSpy.mockResolvedValueOnce(gameState);

      const response = await supertest(app)
        .post('/games/join')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(gameState);
      expect(joinGameSpy).toHaveBeenCalledWith('testGameID', 'user1');
    });
  });

  describe('400 Invalid Request', () => {
    it('should return 400 for an undefined response body', async () => {
      const response = await supertest(app).post('/games/join').send(undefined);

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for an empty response body', async () => {
      const response = await supertest(app).post('/games/join').send({});

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for a missing gameID', async () => {
      const response = await supertest(app).post('/games/join').send({ playerID: 'user1' });

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for a missing playerID', async () => {
      const response = await supertest(app).post('/games/join').send({ gameID: 'testGameID' });

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });
  });

  describe('500 Server Error Request', () => {
    it('should return 500 if joinGame fails', async () => {
      joinGameSpy.mockResolvedValueOnce({ error: 'test error' });

      const response = await supertest(app)
        .post('/games/join')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when joining game: test error');
    });

    it('should return 500 if joinGame throws an error', async () => {
      joinGameSpy.mockRejectedValueOnce(new Error('test error'));

      const response = await supertest(app)
        .post('/games/join')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when joining game: test error');
    });
  });
});

describe('POST /leave', () => {
  const leaveGameSpy = jest.spyOn(mockGameManager, 'leaveGame');

  describe('200 OK Requests', () => {
    it('should return 200 with a success message when successful for Nim', async () => {
      const gameState: GameInstance<NimGameState> = {
        state: { moves: [], status: 'OVER', winners: ['user1'], remainingObjects: MAX_NIM_OBJECTS },
        gameID: 'testGameID',
        players: ['user1'],
        gameType: 'Nim',
      };
      leaveGameSpy.mockResolvedValueOnce(gameState);

      const response = await supertest(app)
        .post('/games/leave')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(gameState);
      expect(leaveGameSpy).toHaveBeenCalledWith('testGameID', 'user1');
    });

    it('should return 200 with a success message when successful for Quiz', async () => {
      const gameState: GameInstance<QuizGameState> = {
        state: {
          moves: [],
          status: 'OVER',
          winners: ['user1'],
          questions: [],
          scores: { user1: 3 },
          topic: 'Science',
          readyToStart: true,
        },
        gameID: 'testGameID',
        players: ['user1'],
        gameType: 'Quiz',
      };
      leaveGameSpy.mockResolvedValueOnce(gameState);

      const response = await supertest(app)
        .post('/games/leave')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(gameState);
      expect(leaveGameSpy).toHaveBeenCalledWith('testGameID', 'user1');
    });
  });

  describe('400 Invalid Request', () => {
    it('should return 400 for an undefined response body', async () => {
      const response = await supertest(app).post('/games/leave').send(undefined);

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for an empty response body', async () => {
      const response = await supertest(app).post('/games/leave').send({});

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for a missing gameID', async () => {
      const response = await supertest(app).post('/games/leave').send({ playerID: 'user1' });

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for a missing playerID', async () => {
      const response = await supertest(app).post('/games/leave').send({ gameID: 'testGameID' });

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });
  });

  describe('500 Server Error Request', () => {
    it('should return 500 if leaveGame fails', async () => {
      leaveGameSpy.mockResolvedValueOnce({ error: 'test error' });

      const response = await supertest(app)
        .post('/games/leave')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when leaving game: test error');
    });

    it('should return 500 if leaveGame throws an error', async () => {
      leaveGameSpy.mockRejectedValueOnce(new Error('test error'));

      const response = await supertest(app)
        .post('/games/leave')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when leaving game: test error');
    });
  });
});

describe('GET /games', () => {
  const findGamesSpy = jest.spyOn(util, 'default');

  describe('200 OK Requests', () => {
    it('should return 200 with a game state array when successful for Nim', async () => {
      const gameState: GameInstance<NimGameState> = {
        state: { moves: [], status: 'WAITING_TO_START', remainingObjects: MAX_NIM_OBJECTS },
        gameID: 'testGameID',
        players: ['user1'],
        gameType: 'Nim',
      };
      findGamesSpy.mockResolvedValueOnce([gameState]);

      const response = await supertest(app)
        .get('/games/games')
        .query({ gameType: 'Nim', status: 'WAITING_TO_START' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([gameState]);
      expect(findGamesSpy).toHaveBeenCalledWith('Nim', 'WAITING_TO_START');
    });

    it('should return 200 with a game state array when successful for Quiz', async () => {
      const gameState: GameInstance<QuizGameState> = {
        state: {
          moves: [],
          status: 'WAITING_TO_START',
          questions: [],
          scores: {},
          topic: 'Science',
          readyToStart: false,
        },
        gameID: 'testGameID',
        players: ['user1'],
        gameType: 'Quiz',
      };
      findGamesSpy.mockResolvedValueOnce([gameState]);

      const response = await supertest(app)
        .get('/games/games')
        .query({ gameType: 'Quiz', status: 'WAITING_TO_START' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([gameState]);
      expect(findGamesSpy).toHaveBeenCalledWith('Quiz', 'WAITING_TO_START');
    });

    it('should return 200 with an empty game state array when successful', async () => {
      findGamesSpy.mockResolvedValueOnce([]);

      const response = await supertest(app)
        .get('/games/games')
        .query({ gameType: 'Quiz', status: 'IN_PROGRESS' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
      expect(findGamesSpy).toHaveBeenCalledWith('Quiz', 'IN_PROGRESS');
    });
  });

  describe('500 Server Error Request', () => {
    it('should return 500 if leaveGame throws an error', async () => {
      findGamesSpy.mockRejectedValueOnce(new Error('test error'));

      const response = await supertest(app)
        .get('/games/games')
        .query({ gameType: 'Nim', status: 'WAITING_TO_START' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when getting games: test error');
    });
  });
});

describe('playMove & socket handlers', () => {
  let httpServer: HTTPServer;
  let io: FakeSOSocket;
  let clientSocket: ClientSocket;
  let serverSocket: ServerSocket;

  let mockNimGame: NimGame;
  let getGameSpy: jest.SpyInstance;
  let applyMoveSpy: jest.SpyInstance;
  let toModelSpy: jest.SpyInstance;
  let saveGameStateSpy: jest.SpyInstance;
  let removeGameSpy: jest.SpyInstance;

  beforeAll(done => {
    httpServer = createServer();
    io = new Server(httpServer);
    gameController(io);

    httpServer.listen(() => {
      const { port } = httpServer.address() as AddressInfo;
      clientSocket = Client(`http://localhost:${port}`);
      io.on('connection', socket => {
        serverSocket = socket;
      });

      clientSocket.on('connect', done);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default Nim game for most tests
    mockNimGame = new NimGame();
    mockNimGame.join('player1');
    mockNimGame.join('player2');

    getGameSpy = jest.spyOn(mockGameManager, 'getGame');
    applyMoveSpy = jest.spyOn(mockNimGame, 'applyMove');
    toModelSpy = jest.spyOn(mockNimGame, 'toModel').mockReturnValue({
      state: {
        moves: [],
        remainingObjects: 0,
        status: 'IN_PROGRESS',
      },
      gameID: '',
      players: [],
      gameType: 'Nim',
    });

    saveGameStateSpy = jest.spyOn(mockNimGame, 'saveGameState').mockResolvedValue(undefined);
    removeGameSpy = jest.spyOn(mockGameManager, 'removeGame');
  });

  afterAll(done => {
    clientSocket.removeAllListeners();
    clientSocket.disconnect();
    if (serverSocket) {
      serverSocket.removeAllListeners();
      serverSocket.disconnect();
    }
    io.close();
    httpServer.close(() => done());
  });

  it('should join a game when "joinGame" event is emitted', async () => {
    const joinGameEvent = new Promise(resolve => {
      serverSocket.once('joinGame', arg => {
        expect(io.sockets.adapter.rooms.has('game123')).toBeTruthy();
        resolve(arg);
      });
    });

    clientSocket.emit('joinGame', 'game123');

    const joinGameArg = await joinGameEvent;

    expect(joinGameArg).toBe('game123');
  });

  it('should leave a game when "leaveGame" event is emitted', async () => {
    const joinGameEvent = new Promise(resolve => {
      serverSocket.once('joinGame', arg => {
        expect(io.sockets.adapter.rooms.has('game123')).toBeTruthy();
        resolve(arg);
      });
    });

    const leaveGameEvent = new Promise(resolve => {
      serverSocket.once('leaveGame', arg => {
        expect(io.sockets.adapter.rooms.has('game123')).toBeFalsy();
        resolve(arg);
      });
    });

    clientSocket.emit('joinGame', 'game123');
    clientSocket.emit('leaveGame', 'game123');

    const [joinGameArg, leaveGameArg] = await Promise.all([joinGameEvent, leaveGameEvent]);

    expect(joinGameArg).toBe('game123');
    expect(leaveGameArg).toBe('game123');
  });

  it('should emit a "gameUpdate" event when a game exists and a valid move is made', async () => {
    getGameSpy.mockReturnValueOnce(mockNimGame);
    const gameMovePayload = {
      gameID: 'game123',
      move: {
        playerID: 'player1',
        gameID: 'game123',
        move: { numObjects: 2 },
      },
    };

    const joinGameEvent = new Promise(resolve => {
      serverSocket.once('joinGame', arg => {
        resolve(arg);
      });
    });

    const makeMoveEvent = new Promise(resolve => {
      serverSocket.once('makeMove', arg => {
        resolve(arg);
      });
    });

    const gameUpdateEvent = new Promise(resolve => {
      clientSocket.once('gameUpdate', arg => {
        resolve(arg);
      });
    });

    clientSocket.emit('joinGame', 'game123');
    clientSocket.emit('makeMove', gameMovePayload);

    const [joinMoveArg, makeMoveArg, gameUpdateArg] = await Promise.all([
      joinGameEvent,
      makeMoveEvent,
      gameUpdateEvent,
    ]);

    expect(joinMoveArg).toBe('game123');
    expect(makeMoveArg).toStrictEqual(gameMovePayload);
    expect(gameUpdateArg).toHaveProperty('gameInstance');
    expect(getGameSpy).toHaveBeenCalledWith('game123');
    expect(applyMoveSpy).toHaveBeenCalledWith({
      playerID: 'player1',
      gameID: 'game123',
      move: { numObjects: 2 },
    });
    expect(toModelSpy).toHaveBeenCalled();
    expect(saveGameStateSpy).toHaveBeenCalled();
    expect(removeGameSpy).not.toHaveBeenCalled();
  });

  it('should remove the game if the game ends after playing a move', async () => {
    getGameSpy.mockReturnValueOnce(mockNimGame);
    applyMoveSpy.mockImplementation(() => {
      mockNimGame.state.status = 'OVER';
    });
    const gameMovePayload = {
      gameID: 'game123',
      move: {
        playerID: 'player1',
        gameID: 'game123',
        move: { numObjects: 2 },
      },
    };

    const joinGameEvent = new Promise(resolve => {
      serverSocket.once('joinGame', arg => {
        resolve(arg);
      });
    });

    const makeMoveEvent = new Promise(resolve => {
      serverSocket.once('makeMove', arg => {
        resolve(arg);
      });
    });

    const gameUpdateEvent = new Promise(resolve => {
      clientSocket.once('gameUpdate', arg => {
        resolve(arg);
      });
    });

    clientSocket.emit('joinGame', 'game123');
    clientSocket.emit('makeMove', gameMovePayload);

    const [joinMoveArg, makeMoveArg, gameUpdateArg] = await Promise.all([
      joinGameEvent,
      makeMoveEvent,
      gameUpdateEvent,
    ]);

    expect(joinMoveArg).toBe('game123');
    expect(makeMoveArg).toStrictEqual(gameMovePayload);
    expect(gameUpdateArg).toHaveProperty('gameInstance');
    expect(getGameSpy).toHaveBeenCalledWith('game123');
    expect(applyMoveSpy).toHaveBeenCalledWith({
      playerID: 'player1',
      gameID: 'game123',
      move: { numObjects: 2 },
    });
    expect(toModelSpy).toHaveBeenCalled();
    expect(saveGameStateSpy).toHaveBeenCalled();
    expect(removeGameSpy).toHaveBeenCalledWith('game123');
  });

  it('should emit "gameError" event when a game does not exist', async () => {
    getGameSpy.mockReturnValue(undefined);
    const gameMovePayload = {
      gameID: 'game123',
      move: {
        playerID: 'player1',
        gameID: 'game123',
        move: { numObjects: 2 },
      },
    };

    const makeMoveEvent = new Promise(resolve => {
      serverSocket.once('makeMove', arg => {
        resolve(arg);
      });
    });

    const gameErrorEvent = new Promise(resolve => {
      clientSocket.once('gameError', arg => {
        resolve(arg);
      });
    });

    clientSocket.emit('joinGame', 'game123');
    clientSocket.emit('makeMove', gameMovePayload);

    const [makeMoveArg, gameErrorArg] = await Promise.all([makeMoveEvent, gameErrorEvent]);

    expect(makeMoveArg).toStrictEqual(gameMovePayload);
    expect(gameErrorArg).toStrictEqual({
      player: 'player1',
      error: 'Game requested does not exist',
    });
    expect(getGameSpy).toHaveBeenCalledWith('game123');
  });

  it('should emit leaderboardUpdate when a move is played in a Quiz game', async () => {
    // Instantiate QuizGame with the required arguments: topic and an empty questions array.
    const mockQuizGame = new QuizGame('Science', []);

    // Override the protected state using a type assertion.
    const quizGameState: QuizGameState = {
      moves: [],
      status: 'IN_PROGRESS',
      topic: 'Science',
      questions: [],
      scores: {},
      readyToStart: false,
    };
    (mockQuizGame as QuizGame & { state: QuizGameState }).state = quizGameState;

    // Ensure applyMove and saveGameState resolve immediately.
    jest.spyOn(mockQuizGame, 'applyMove').mockResolvedValue();
    jest.spyOn(mockQuizGame, 'saveGameState').mockResolvedValue(undefined);

    // Stub the toModel method to return the game model.
    jest.spyOn(mockQuizGame, 'toModel').mockReturnValue({
      state: quizGameState,
      gameID: 'quizGameID',
      players: ['player1'],
      gameType: 'Quiz',
    });

    // Set getGameSpy to return the QuizGame instance.
    getGameSpy.mockReturnValueOnce(mockQuizGame);

    // Spy on the leaderboard service and resolve with a mock leaderboard.
    const leaderboard = [{ username: 'player1', skill: 'Science', score: 10 }];
    const leaderboardSpy = jest
      .spyOn(leaderboardService, 'getLeaderboardBySkill')
      .mockResolvedValue(leaderboard);

    const gameMovePayload = {
      gameID: 'quizGameID',
      move: {
        playerID: 'player1',
        gameID: 'quizGameID',
        move: { answer: 'A' },
      },
    };

    const leaderboardUpdateEvent = new Promise(resolve => {
      clientSocket.once('leaderboardUpdate', arg => {
        resolve(arg);
      });
    });

    clientSocket.emit('makeMove', gameMovePayload);

    const leaderboardUpdate = await leaderboardUpdateEvent;

    expect(leaderboardSpy).toHaveBeenCalledWith('Science', 10);
    expect(leaderboardUpdate).toEqual({ skill: 'Science', leaderboard });
  });
});

describe('POST /getMCQuestion', () => {
  // Tests for lines 200-207 in the getMCQuestion route
  const mockQuestion = {
    question: 'What is the capital of France?',
    answers: ['Paris', 'London', 'Berlin', 'Madrid'],
    correctAnswer: 'Paris',
  };

  beforeEach(() => {
    (getMultipleChoiceQuestion as jest.Mock).mockClear();
  });

  it('should return 200 and the question when getMultipleChoiceQuestion resolves successfully', async () => {
    (getMultipleChoiceQuestion as jest.Mock).mockResolvedValueOnce(mockQuestion);

    const response = await supertest(app)
      .post('/games/getMCQuestion')
      .send({ category: 'geography', difficulty: 'easy' });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockQuestion);
    expect(getMultipleChoiceQuestion).toHaveBeenCalledWith('geography', 'easy');
  });

  it('should return 500 when getMultipleChoiceQuestion throws an error', async () => {
    (getMultipleChoiceQuestion as jest.Mock).mockRejectedValueOnce(new Error('test error'));

    const response = await supertest(app)
      .post('/games/getMCQuestion')
      .send({ category: 'geography', difficulty: 'easy' });

    expect(response.status).toEqual(500);
    expect(response.text).toContain('Error when getting MC question: test error');
    expect(getMultipleChoiceQuestion).toHaveBeenCalledWith('geography', 'easy');
  });
});
