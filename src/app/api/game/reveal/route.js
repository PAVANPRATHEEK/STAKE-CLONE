import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Game from '@/models/Game';

function getMultiplier(mines, revealedCount) {
  if (revealedCount === 0) return 1;
  let multiplier = 1;
  let remainingTiles = 25;
  let remainingSafe = 25 - mines;
  for (let i = 0; i < revealedCount; i++) {
    multiplier *= remainingTiles / remainingSafe;
    remainingTiles--;
    remainingSafe--;
  }
  return multiplier * 0.99; // 1% house edge
}

export async function POST(request) {
  try {
    const email = request.headers.get('x-email');
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { gameId, tileIndex } = await request.json();

    await connectToDatabase();
    const game = await Game.findById(gameId);

    if (!game || game.email !== email || game.status !== 'playing') {
      return NextResponse.json({ error: 'Invalid game' }, { status: 400 });
    }

    if (game.revealed.includes(tileIndex) || tileIndex < 0 || tileIndex > 24) {
      return NextResponse.json({ error: 'Invalid tile' }, { status: 400 });
    }

    const isMine = game.board[tileIndex] === 'mine';
    game.revealed.push(tileIndex);

    if (isMine) {
      game.status = 'bust';
      await game.save();
      return NextResponse.json({ 
        status: 'bust', 
        board: game.board, // reveal all
        revealed: game.revealed
      });
    } else {
      const multiplier = getMultiplier(game.minesCount, game.revealed.length);
      await game.save();
      return NextResponse.json({ 
        status: 'playing', 
        tile: 'safe',
        multiplier,
        revealed: game.revealed
      });
    }
  } catch (error) {
    console.error("Reveal Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
