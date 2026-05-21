import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
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

    const { gameId } = await request.json();

    await connectToDatabase();
    
    const game = await Game.findById(gameId);
    const user = await User.findOne({ email });

    if (!game || game.email !== email || game.status !== 'playing') {
      return NextResponse.json({ error: 'Invalid game' }, { status: 400 });
    }

    if (game.revealed.length === 0) {
      return NextResponse.json({ error: 'Cannot cashout without playing' }, { status: 400 });
    }

    const multiplier = getMultiplier(game.minesCount, game.revealed.length);
    const payout = game.betAmount * multiplier;

    game.status = 'cashed_out';
    user.balance += payout;

    await game.save();
    await user.save();

    return NextResponse.json({ 
      status: 'cashed_out',
      payout,
      balance: user.balance,
      board: game.board
    });
  } catch (error) {
    console.error("Cashout Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
