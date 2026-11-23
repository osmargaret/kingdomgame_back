import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ArenaPlayer {
  id: string;
  name: string;
  team: string;
  score: number;
}

interface ArenaQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  scriptureRef: string;
}

interface ArenaRoom {
  code: string;
  title: string;
  status: 'LOBBY' | 'QUESTION_ACTIVE' | 'ROUND_RESULTS';
  questionIndex: number;
  players: Record<string, ArenaPlayer>;
}

const STAGE_QUESTIONS: ArenaQuestion[] = [
  {
    id: 'stage-1',
    prompt:
      'Which prophet confronted King David with a parable about a rich man taking a poor man’s only lamb?',
    options: ['Elijah', 'Nathan', 'Samuel', 'Isaiah'],
    correctIndex: 1,
    scriptureRef: '2 Samuel 12:1-7',
  },
  {
    id: 'stage-2',
    prompt: 'Who found the Book of the Law in the temple during King Josiah’s reign?',
    options: ['Hilkiah', 'Ezra', 'Nehemiah', 'Baruch'],
    correctIndex: 0,
    scriptureRef: '2 Kings 22:8',
  },
  {
    id: 'stage-3',
    prompt: 'In Acts 15, in which city did the apostles and elders gather for the first church council?',
    options: ['Antioch', 'Corinth', 'Jerusalem', 'Ephesus'],
    correctIndex: 2,
    scriptureRef: 'Acts 15:1-6',
  },
];

@WebSocketGateway({
  namespace: '/arena',
  cors: { origin: '*' },
})
export class ArenaGateway {
  @WebSocketServer()
  server!: Server;

  private readonly rooms = new Map<string, ArenaRoom>([
    [
      'KQ-7429',
      {
        code: 'KQ-7429',
        title: 'Grace Fellowship — Sunday Bible Cup',
        status: 'LOBBY',
        questionIndex: 0,
        players: {
          'seed-1': { id: 'seed-1', name: 'Daniel O.', team: 'Team Judah', score: 240 },
          'seed-2': { id: 'seed-2', name: 'Esther A.', team: 'Team Berea', score: 210 },
        },
      },
    ],
  ]);

  private getSnapshot(room: ArenaRoom) {
    const q = STAGE_QUESTIONS[room.questionIndex] ?? STAGE_QUESTIONS[0];
    const leaderboard = Object.values(room.players).sort((a, b) => b.score - a.score);
    return {
      code: room.code,
      title: room.title,
      status: room.status,
      questionIndex: room.questionIndex,
      totalQuestions: STAGE_QUESTIONS.length,
      question: {
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        scriptureRef: q.scriptureRef,
      },
      leaderboard,
    };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { code: string; name?: string; team?: string },
  ) {
    const code = (payload?.code ?? 'KQ-7429').toUpperCase().trim();
    let room = this.rooms.get(code);
    if (!room) {
      room = {
        code,
        title: `Kingdom Room ${code}`,
        status: 'LOBBY',
        questionIndex: 0,
        players: {},
      };
      this.rooms.set(code, room);
    }

    if (payload?.name) {
      room.players[client.id] = {
        id: client.id,
        name: payload.name,
        team: payload.team ?? 'Explorers',
        score: room.players[client.id]?.score ?? 0,
      };
    }

    void client.join(code);
    const snapshot = this.getSnapshot(room);
    this.server.to(code).emit('roomState', snapshot);
    return snapshot;
  }

  @SubscribeMessage('hostStartQuestion')
  handleHostStartQuestion(
    @MessageBody() payload: { code: string; questionIndex?: number },
  ) {
    const code = (payload?.code ?? 'KQ-7429').toUpperCase().trim();
    const room = this.rooms.get(code);
    if (!room) return null;

    if (typeof payload?.questionIndex === 'number') {
      room.questionIndex = payload.questionIndex % STAGE_QUESTIONS.length;
    }
    room.status = 'QUESTION_ACTIVE';
    const snapshot = this.getSnapshot(room);
    this.server.to(code).emit('roomState', snapshot);
    return snapshot;
  }

  @SubscribeMessage('submitAnswer')
  handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { code: string; answerIndex: number },
  ) {
    const code = (payload?.code ?? 'KQ-7429').toUpperCase().trim();
    const room = this.rooms.get(code);
    if (!room) return { correct: false };

    const q = STAGE_QUESTIONS[room.questionIndex] ?? STAGE_QUESTIONS[0];
    const correct = payload?.answerIndex === q.correctIndex;
    const player = room.players[client.id];
    if (player && correct) {
      player.score += 100;
    }

    const snapshot = this.getSnapshot(room);
    this.server.to(code).emit('roomState', snapshot);
    return { correct, correctIndex: q.correctIndex, scriptureRef: q.scriptureRef };
  }
}

