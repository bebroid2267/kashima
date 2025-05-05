import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Таблица для хранения информации о циклах обновления энергии
const ENERGY_CYCLES_TABLE = 'energy_update_cycles';

export async function POST(request: Request) {
  try {
    // Проверяем доступность Supabase
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const data = await request.json();
    
    // Проверяем наличие ID цикла
    if (!data.cycleId) {
      return NextResponse.json(
        { error: 'Missing required fields: cycleId' },
        { status: 400 }
      );
    }
    
    const cycleId = data.cycleId;
    
    // Проверяем, не обрабатывался ли уже этот цикл обновления
    const { data: existingCycle, error: cycleCheckError } = await supabase
      .from(ENERGY_CYCLES_TABLE)
      .select('*')
      .eq('cycle_id', cycleId)
      .single();
    
    if (cycleCheckError && cycleCheckError.code !== 'PGRST116') {
      console.error('Error checking cycle:', cycleCheckError);
      return NextResponse.json(
        { error: 'Database error when checking cycle' },
        { status: 500 }
      );
    }
    
    // Если цикл уже был обработан, возвращаем соответствующее сообщение
    if (existingCycle) {
      return NextResponse.json({
        success: true,
        message: 'Energy already awarded for this cycle',
        alreadyProcessed: true,
        cycleId
      });
    }
    
    // Получаем всех пользователей
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('mb_id, energy');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Database error when fetching users' },
        { status: 500 }
      );
    }
    
    // Если пользователей нет, ничего не делаем
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found to update',
        updatedCount: 0,
        cycleId
      });
    }
    
    // Создаем записи обновлений для каждого пользователя
    const updates = users.map(user => {
      const currentEnergy = user.energy || 0;
      const newEnergy = Math.min(currentEnergy + 1, 100);
      
      return {
        mb_id: user.mb_id,
        energy: newEnergy
      };
    });
    
    // Выполняем массовое обновление
    let success = false;
    let error = null;
    
    // Если пользователей слишком много, обновляем их небольшими группами
    const BATCH_SIZE = 50;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      
      // Для каждого пользователя выполняем отдельное обновление
      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ energy: update.energy })
          .eq('mb_id', update.mb_id);
        
        if (updateError) {
          console.error(`Error updating user ${update.mb_id}:`, updateError);
          error = updateError;
        }
      }
    }
    
    // Записываем информацию о выполненном цикле обновления
    const { error: cycleCreateError } = await supabase
      .from(ENERGY_CYCLES_TABLE)
      .insert({
        cycle_id: cycleId,
        created_at: new Date().toISOString(),
        users_updated: updates.length,
        success: !error
      });
    
    if (cycleCreateError) {
      console.error('Error recording cycle:', cycleCreateError);
    }
    
    return NextResponse.json({
      success: !error,
      message: error ? 'Partial update completed with errors' : 'Energy updated for all users',
      updatedCount: updates.length,
      cycleId
    });
    
  } catch (error) {
    console.error('Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 