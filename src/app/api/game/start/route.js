import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Game from '@/models/Game';

export async function POST(request) {
  try {
    const email = request.headers.get('x-email');
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { betAmount, minesCount } = await request.json();
    const bet = parseFloat(betAmount);
    
    if (isNaN(bet) || bet < 1 || minesCount < 1 || minesCount > 24) {
      return NextResponse.json({ error: 'Minimum bet is 1 USDT and mines must be 1-24' }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email });
    if (!user || user.balance < bet) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Deduct bet
    user.balance -= bet;
    await user.save();

    // Generate board
    const boardSize = 25;
    const board = Array(boardSize).fill('safe');
    let placedMines = 0;
    while (placedMines < minesCount) {
      const idx = Math.floor(Math.random() * boardSize);
      if (board[idx] === 'safe') {
        board[idx] = 'mine';
        placedMines++;
      }
    }

    const newGame = await Game.create({
      email,
      betAmount: bet,
      minesCount,
      board,
      revealed: [],
      status: 'playing',
    });

    return NextResponse.json({ gameId: newGame._id, balance: user.balance });
  } catch (error) {
    console.error("Game Start Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
