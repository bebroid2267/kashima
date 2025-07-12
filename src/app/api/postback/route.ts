import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // Check if supabase client is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    // Get URL parameters
    const url = new URL(request.url);
    
    // Support for multiple parameter formats
    let user_id: string | null = null;
    let deposit: string | null = null;
    let event: string | null = null;
    
    // Format 1: Original format
    // ?event={status}&amount={conversion_revenue}&player_id={sub_id_12}
    const player_id = url.searchParams.get('player_id');
    const amount = url.searchParams.get('amount');
    const eventParam = url.searchParams.get('event');
    
    // Format 2: New format
    // ?subid={clickid}&fields.user_id={id}&tracker.event=sale&fields.summ={profit}&status=sale&tracker.currency=usd
    // Format 3: Extended format with last_deposit
    // ?subid={clickid}&fields.user_id={id}&tracker.event=sale&fields.last_deposit=100.00&status=sale&tracker.currency=usd
    const subid = url.searchParams.get('subid');
    const fieldsUserId = url.searchParams.get('fields.user_id');
    const fieldsSum = url.searchParams.get('fields.summ');
    const fieldsLastDeposit = url.searchParams.get('fields.last_deposit');
    const trackerEvent = url.searchParams.get('tracker.event');
    const status = url.searchParams.get('status');
    const currency = url.searchParams.get('tracker.currency');
    
    // Determine which format is being used and extract values
    if (player_id && amount) {
      // Original format
      user_id = player_id;
      deposit = amount;
      event = eventParam;
      console.log('Using original format:', { user_id, deposit, event });
    } else if ((subid || fieldsUserId) && (fieldsSum || fieldsLastDeposit || trackerEvent === 'registration')) {
      // New format - allow registration without fieldsSum
      user_id = fieldsUserId || subid; // Prefer fields.user_id, fallback to subid
      
      // Use fields.last_deposit if available, otherwise use fields.summ, default to 0 for registration
      deposit = fieldsLastDeposit || fieldsSum || '0';
      
      // Map tracker.event and status to our event types
      if (trackerEvent === 'registration') {
        event = 'reg'; // Registration
      } else if (trackerEvent === 'sale' || status === 'sale') {
        event = 'dep'; // First deposit
      } else {
        event = trackerEvent || status || 'dep'; // Default to dep
      }
      
      console.log('Using new format:', { 
        user_id, 
        deposit, 
        event, 
        fieldsLastDeposit, 
        fieldsSum, 
        trackerEvent, 
        status 
      });
    }

    // Validate required fields
    if (!user_id || deposit === null) {
      return NextResponse.json(
        { 
          error: 'Missing required fields. Expected either (player_id + amount) or (subid/fields.user_id + fields.summ/fields.last_deposit) or (subid/fields.user_id + tracker.event=registration)',
          receivedParams: {
            player_id,
            amount,
            event: eventParam,
            subid,
            'fields.user_id': fieldsUserId,
            'fields.summ': fieldsSum,
            'fields.last_deposit': fieldsLastDeposit,
            'tracker.event': trackerEvent,
            status,
            'tracker.currency': currency
          }
        },
        { status: 400 }
      );
    }
    
    // Parse deposit amount to ensure it's a number
    const depositAmount = parseFloat(deposit);
    if (isNaN(depositAmount)) {
      return NextResponse.json(
        { error: 'Invalid deposit amount. Must be a number.' },
        { status: 400 }
      );
    }

    // Only check for positive amount if it's not a registration event
    if (event !== 'reg' && depositAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount. Must be a positive number for deposits.' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('mb_id', user_id)
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
    let energy = 0; // Default energy for new users (will be 0 for registration, 10 for first deposit)
    const currentDate = new Date().toISOString();
    let isFirstDeposit = false;
    
    // If user exists, update their deposit and recalculate chance
    if (existingUser) {
      totalDeposit = (existingUser.deposit_amount || 0) + depositAmount;
      currentChance = existingUser.chance || 30;
      energy = existingUser.energy || 0; // Default to 0 for existing users too
      
      // Check if this is the first deposit (user exists but has no previous deposits)
      isFirstDeposit = (existingUser.deposit_amount || 0) === 0 && depositAmount > 0;
      console.log('Existing user - isFirstDeposit:', isFirstDeposit, 'previous deposit:', existingUser.deposit_amount, 'new deposit:', depositAmount, 'current energy:', energy);
    } else {
      // New user making their first deposit
      isFirstDeposit = depositAmount > 0;
      console.log('New user - isFirstDeposit:', isFirstDeposit, 'deposit:', depositAmount, 'event:', event);
    }
    
    // Calculate new chance based on event type and total deposit amount
    let newChance = currentChance;
    if (event === 'redep') {
      newChance = calculateChance(totalDeposit);
    } else if (event === 'dep') {
      newChance = calculateChance(totalDeposit); // Calculate chance for first deposit too
    }
    
    // Update energy based on event type
    if (event === 'reg') {
      // Registration: energy = 0
      energy = 0;
      console.log('Registration event: setting energy to 0');
    } else if (isFirstDeposit && depositAmount > 0) {
      // First deposit: energy = 10
      energy = 10;
      console.log('First deposit: setting energy to 10');
    } else {
      // Other cases: keep current energy
      console.log('Energy remains:', energy, '(isFirstDeposit:', isFirstDeposit, 'depositAmount:', depositAmount, 'event:', event, ')');
    }
    
    // Prepare user data
    const userData = {
      mb_id: user_id,
      deposit_amount: totalDeposit,
      chance: newChance,
      energy: energy,
      last_login_date: event === 'reg' || event === 'dep' ? currentDate : existingUser?.last_login_date || null
    };
    
    // Upsert user (insert if not exists, update if exists)
    const { error: upsertError } = await supabase
      .from('users')
      .upsert(userData, { 
        onConflict: 'mb_id',
        ignoreDuplicates: false
      });
    
    if (upsertError) {
      console.error('Error upserting user:', upsertError);
      return NextResponse.json(
        { error: 'Database error when updating user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user_id: user_id,
      deposit_amount: totalDeposit,
      chance: newChance,
      energy: energy,
      event: event,
      is_first_deposit: isFirstDeposit,
      format_detected: player_id && amount ? 'original' : 'new',
      deposit_source: fieldsLastDeposit ? 'fields.last_deposit' : fieldsSum ? 'fields.summ' : 'amount',
      original_deposit_value: deposit
    });
    
  } catch (error) {
    console.error('Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Keep POST method for backward compatibility
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const url = new URL(request.url);
    url.searchParams.set('user_id', data.user_id);
    url.searchParams.set('deposit', data.deposit);
    url.searchParams.set('event', data.event);
    
    // Create a new request with the constructed URL
    const newRequest = new Request(url.toString(), {
      method: 'GET',
      headers: request.headers
    });
    
    // Call the GET handler with the new request
    return GET(newRequest);
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