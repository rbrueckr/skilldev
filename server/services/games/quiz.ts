import { nanoid } from 'nanoid';
import { GameMove, MCQuestion, QuizGameState, QuizMove, QuizQuestion } from '../../types/types';
import Game from './game';
import getMultipleChoiceQuestion from '../multipleChoiceQuestion.service';
import { updateLeaderboard } from '../leaderboard.service';

/**
 * Represents a Quiz game, extending the generic Game class.
 *
 * This class contains the specific game logic for playing a Quiz game.
 */
class QuizGame extends Game<QuizGameState, QuizMove> {
  /**
   * Constructor for the QuizGame class, initializes the game state and type.
   * @param topic The topic for the quiz game.
   */
  public constructor(topic: string, questions: QuizQuestion[]) {
    super(
      {
        status: 'WAITING_TO_START',
        moves: [],
        questions,
        scores: {},
        currentQuestion: undefined,
        topic,
        player1: undefined,
        readyToStart: false,
      },
      'Quiz',
    );
  }

  /**
   * Factory method to create a QuizGame instance with async initialization.
   * @param topic The topic for the quiz game.
   * @returns A promise resolving to an instance of QuizGame.
   */
  public static async create(topic: string): Promise<QuizGame> {
    // Sample questions, implement quizapi.io later for Sprint 2
    const mcQuestionResponses = await Promise.all([
      await getMultipleChoiceQuestion(topic),
      await getMultipleChoiceQuestion(topic),
      await getMultipleChoiceQuestion(topic),
    ]);

    const mcQuestions: MCQuestion[] = mcQuestionResponses.map(mcQuestionResponse => {
      if ('error' in mcQuestionResponse) {
        throw Error(`Error when getting questions: ${mcQuestionResponse.error}`);
      }
      return mcQuestionResponse;
    });
    const questions = mcQuestions.map(questionJsonFormat =>
      QuizGame._formatMCQuestionForQuiz(questionJsonFormat),
    );
    // You can add any asynchronous operations you need here (like fetching data from an API)
    // await someAsyncOperation();

    return new QuizGame(topic, questions); // Create and return the QuizGame instance
  }

  /**
   * Starts the game if conditions are met.
   * @param playerID The ID of the player trying to start the game.
   * @throws Will throw an error if the game cannot be started.
   */
  public startGame(playerID: string): void {
    if (playerID !== this.state.player1) {
      throw new Error('Only the host can start the game');
    }

    if (Object.keys(this.state.scores).length < 2) {
      throw new Error('Need at least 2 players to start');
    }
    this.state.readyToStart = true;
    const [firstQuestion] = this.state.questions;
    this.state.currentQuestion = firstQuestion;
    this.state.status = 'IN_PROGRESS';
  }

  /**
   * Applies a move (answer) to the game state.
   * @param move The move containing the player's answer.
   */
  public async applyMove(move: GameMove<QuizMove>): Promise<void> {
    const { playerID } = move;

    // Handle game start action
    if ('type' in move.move && move.move.type === 'START_GAME') {
      this.startGame(playerID);
      return;
    }

    if (this.state.status !== 'IN_PROGRESS') {
      throw new Error('Game has not started yet');
    }

    const { answer, questionId, timeExpired } = move.move;
    // Initialize player's score if not exists
    if (!this.state.scores[playerID]) {
      this.state.scores[playerID] = 0;
    }

    // Find the current question
    const currentQuestion = this.state.questions.find(q => q.id === questionId);
    if (!currentQuestion) {
      throw new Error('Invalid question ID');
    }

    // If time expired, move to the next question without giving points
    if (timeExpired) {
      // Only proceed if this is the first timeExpired event for this question
      // to avoid multiple clients triggering the same action
      const isFirstTimeExpiredEvent = !this.state.moves.some(
        m => m.questionId === questionId && 'timeExpired' in m && m.timeExpired === true,
      );

      if (isFirstTimeExpiredEvent) {
        const currentQuestionIndex = this.state.questions.findIndex(q => q.id === questionId);
        if (currentQuestionIndex < this.state.questions.length - 1) {
          this.state.currentQuestion = this.state.questions[currentQuestionIndex + 1];
        } else {
          this.state.currentQuestion = undefined;
          this.state.status = 'OVER';
          const maxScore = Math.max(...Object.values(this.state.scores));
          this.state.winners = Object.entries(this.state.scores)
            .filter(([_, score]) => score === maxScore)
            .map(([playerId]) => playerId);
        }
        // Add the move to the history to track that time expired for this question
        this.state.moves = [...this.state.moves, move.move];
      }
      return;
    }

    if (this.state.status !== 'IN_PROGRESS') return;

    // Check if the answer is correct and update score
    if (answer && currentQuestion.correctAnswers.includes(answer)) {
      this.state.scores[playerID] += 1;

      // Update leaderboard and wait for it to complete
      await updateLeaderboard(playerID, this.state.topic, 1);

      // Move to the next question or end the game
      const currentQuestionIndex = this.state.questions.findIndex(q => q.id === questionId);
      if (currentQuestionIndex < this.state.questions.length - 1) {
        this.state.currentQuestion = this.state.questions[currentQuestionIndex + 1];
      } else {
        this.state.currentQuestion = undefined;
        this.state.status = 'OVER';
        const maxScore = Math.max(...Object.values(this.state.scores));
        this.state.winners = Object.entries(this.state.scores)
          .filter(([_, score]) => score === maxScore)
          .map(([playerId]) => playerId);
      }
    }
    // If the answer is incorrect, the game state (currentQuestion) remains unchanged
    // Add the move to the history
    this.state.moves = [...this.state.moves, move.move];
  }

  /**
   * Handles a player joining the game.
   * @param playerID The ID of the player joining.
   */
  protected _join(playerID: string): void {
    if (Object.keys(this.state.scores).length >= 4) {
      throw new Error('Game is full');
    }

    if (this.state.status !== 'WAITING_TO_START') {
      throw new Error('Cannot join game in progress');
    }

    // Set player1 if not set
    if (!this.state.player1) {
      this.state.player1 = playerID;
    }

    // Initialize player's score
    this.state.scores[playerID] = 0;
  }

  /**
   * Handles a player leaving the game.
   * @param playerID The ID of the player leaving.
   */
  protected _leave(playerID: string): void {
    // Remove player's score
    delete this.state.scores[playerID];

    // If player1 leaves, assign to next player if available
    if (playerID === this.state.player1) {
      const remainingPlayers = Object.keys(this.state.scores);
      this.state.player1 = remainingPlayers.length > 0 ? remainingPlayers[0] : undefined;
    }

    // If there's only one player left, end the game
    if (Object.keys(this.state.scores).length <= 1 && this.state.status === 'IN_PROGRESS') {
      this.state.status = 'OVER';
      // The remaining player is the winner
      const remainingPlayer = Object.keys(this.state.scores).find(
        (player: string) => player !== playerID,
      );
      if (remainingPlayer) {
        this.state.winners = [remainingPlayer];
      }
    }
  }

  /**
   * Transforms an MCQuestion object into a format suitable for use in a quiz game.
   * This involves converting the question's properties into a simplified structure that includes the question text, options, and correct answers.
   *
   * @param question The MCQuestion raw object that contains the question and answers from api.
   * @returns An object representing the question with formatted options and correct answers, ready to be used in the quiz game.
   */
  private static _formatMCQuestionForQuiz(question: MCQuestion): QuizQuestion {
    const resultId = nanoid();
    const resultText = question.question;
    const resultOptions = [
      question.answers.answer_a,
      question.answers.answer_b,
      question.answers.answer_c,
      question.answers.answer_d,
      question.answers.answer_e,
      question.answers.answer_f,
    ].filter((answer): answer is string => answer !== null);
    // i.e 'answer_a', 'answer_e'
    const correctAnswerKeys = Object.entries(question.correct_answers)
      .filter(([key, value]) => value === 'true')
      .map(([key]) => key.slice(0, 8));
    const answersMap = new Map(Object.entries(question.answers));

    // Using .get() and returning an empty string if the key is not found
    const resultCorrectAnswers = correctAnswerKeys.map(key => answersMap.get(key) || '');
    return {
      id: resultId,
      text: resultText,
      options: resultOptions,
      correctAnswers: resultCorrectAnswers,
    };
  }
}

export default QuizGame;
