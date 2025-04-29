import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.user_id || !data.deposit) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id and deposit' },
        { status: 400 }
      );
    }
    
    // Parse deposit amount to ensure it's a number
    const depositAmount = parseFloat(data.deposit);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount. Must be a positive number.' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('mb_id', data.user_id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means not found
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { error: 'Database error when fetching user' },
        { status: 500 }
      );
    }
    
    let totalDeposit = depositAmount;
    let currentChance = 30; // Default chance for new users
    let energy = 1; // Default energy for new users
    
    // If user exists, update their deposit and recalculate chance
    if (existingUser) {
      totalDeposit = (existingUser.deposit_amount || 0) + depositAmount;
      currentChance = existingUser.chance || 30;
      energy = existingUser.energy || 1;
    }
    
    // Calculate new chance based on total deposit amount
    const newChance = calculateChance(totalDeposit);
    
    // Prepare user data
    const userData = {
      mb_id: data.user_id,
      deposit_amount: totalDeposit,
      chance: newChance,
      energy: energy,
      // Don't override these fields if they already exist
      last_login_date: existingUser?.last_login_date || null
    };
    
    // Upsert user (insert if not exists, update if exists)
    const { error: upsertError } = await supabase
      .from('users')
      .upsert(userData, { 
        onConflict: 'mb_id',  // Указываем колонку, которая является уникальным идентификатором
        ignoreDuplicates: false // Обновляем существующие записи
      })
      .select();
    
    if (upsertError) {
      console.error('Error upserting user:', upsertError);
      return NextResponse.json(
        { error: 'Database error when updating user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user_id: data.user_id,
      deposit_amount: totalDeposit,
      chance: newChance
    });
    
  } catch (error) {
    console.error('Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate chance based on deposit amount according to the following logic:
 * $0-$100 → chance 30-50% (+1% for every $5)
 * $100-$300 → chance 50-70% (+1% for every $10)
 * $300-$950 → chance 70-85% (+1% for every $50)
 */
function calculateChance(depositAmount: number): number {
  let chance = 30; // Starting chance
  
  if (depositAmount <= 100) {
    // For deposits up to $100, each $5 gives +1% (up to 50%)
    chance = 30 + Math.floor(Math.min(depositAmount, 100) / 5);
  } else if (depositAmount <= 300) {
    // Base 50% plus additional for deposits between $100 and $300
    // Each $10 gives +1% (up to 70%)
    chance = 50 + Math.floor(Math.min(depositAmount - 100, 200) / 10);
  } else {
    // Base 70% plus additional for deposits above $300
    // Each $50 gives +1% (up to 85%)
    chance = 70 + Math.floor(Math.min(depositAmount - 300, 750) / 50);
  }
  
  return Math.min(chance, 85); // Cap at 85%
} 