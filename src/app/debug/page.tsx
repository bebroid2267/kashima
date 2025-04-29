'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMbId, setSearchMbId] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Проверка подключения...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Проверка подключения к Supabase...');
        console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Ключ:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Установлен' : 'Отсутствует');
        
        // Проверяем подключение, запрашивая информацию о таблице
        const { data, error } = await supabase
          .from('users')
          .select('count');
        
        if (error) {
          console.error('Ошибка подключения к Supabase:', error);
          setConnectionStatus(`Ошибка подключения: ${error.message}`);
          setError(`Ошибка подключения к базе данных: ${error.message}`);
        } else {
          console.log('Подключение к Supabase успешно');
          setConnectionStatus('Подключение успешно');
          fetchUsers();
        }
      } catch (err: any) {
        console.error('Исключение при проверке подключения:', err);
        setConnectionStatus(`Исключение: ${err.message}`);
        setError(`Ошибка: ${err.message}`);
      }
    };
    
    checkConnection();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Запрос всех пользователей...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('Результат запроса пользователей:', { data, error });
      
      if (error) {
        console.error('Ошибка при получении пользователей:', error);
        throw error;
      }
      
      console.log(`Получено пользователей: ${data?.length || 0}`);
      setUsers(data || []);
    } catch (err: any) {
      console.error('Ошибка при получении пользователей:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchMbId.trim()) {
      setSearchError('Пожалуйста, введите MB ID');
      return;
    }
    
    try {
      setSearchLoading(true);
      setSearchError(null);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('mb_id', searchMbId)
        .single();
      
      if (error) {
        throw error;
      }
      
      setSearchResult(data);
    } catch (err: any) {
      console.error('Error searching user:', err);
      setSearchError(err.message || 'Ошибка при поиске пользователя');
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    fetchUsers();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'radial-gradient(circle at 50% 30%, #0a1a2f 60%, #07101e 100%)',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        padding: '32px',
        color: '#fff',
      }}
    >
      <h1
        style={{
          color: '#38e0ff',
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 32,
          letterSpacing: 1.2,
        }}
      >
        Страница отладки
      </h1>
      
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        {/* Поиск пользователя */}
        <div
          style={{
            background: 'rgba(20, 40, 70, 0.5)',
            borderRadius: 12,
            border: '1.5px solid #1e3557',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h2
            style={{
              color: '#7ecbff',
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Поиск пользователя по MB ID
          </h2>
          
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <input
              type="text"
              value={searchMbId}
              onChange={(e) => setSearchMbId(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 8,
                border: '1.5px solid #1e3557',
                background: 'rgba(20, 40, 70, 0.3)',
                color: '#fff',
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              placeholder="Введите MB ID"
            />
            
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                background: searchLoading
                  ? 'linear-gradient(90deg, #a0a0a0 0%, #808080 100%)'
                  : 'linear-gradient(90deg, #1e9fff 0%, #38e0ff 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                border: 'none',
                cursor: searchLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px #1e9fff44',
                transition: 'background 0.2s',
              }}
            >
              {searchLoading ? 'Поиск...' : 'Найти'}
            </button>
          </div>
          
          {searchError && (
            <div
              style={{
                color: '#ff7eb9',
                fontSize: 14,
                padding: '12px',
                background: 'rgba(255, 126, 185, 0.1)',
                borderRadius: 6,
                marginBottom: 16,
              }}
            >
              {searchError}
            </div>
          )}
          
          {searchResult && (
            <div
              style={{
                background: 'rgba(30, 60, 100, 0.3)',
                borderRadius: 8,
                padding: '16px',
                border: '1px solid #2a4a7a',
              }}
            >
              <h3
                style={{
                  color: '#38e0ff',
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Результат поиска
              </h3>
              
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ color: '#7ecbff', fontSize: 14, marginBottom: 4 }}>ID</div>
                  <div style={{ fontSize: 16 }}>{searchResult.id}</div>
                </div>
                
                <div>
                  <div style={{ color: '#7ecbff', fontSize: 14, marginBottom: 4 }}>MB ID</div>
                  <div style={{ fontSize: 16 }}>{searchResult.mb_id}</div>
                </div>
                
                <div>
                  <div style={{ color: '#7ecbff', fontSize: 14, marginBottom: 4 }}>Энергия</div>
                  <div style={{ fontSize: 16 }}>
                    {searchResult.energy !== undefined && searchResult.energy !== null
                      ? `${searchResult.energy} / 100`
                      : 'Не установлено'}
                  </div>
                </div>
                
                <div>
                  <div style={{ color: '#7ecbff', fontSize: 14, marginBottom: 4 }}>Последний вход</div>
                  <div style={{ fontSize: 16 }}>
                    {searchResult.last_login_date
                      ? formatDate(searchResult.last_login_date)
                      : 'Никогда'}
                  </div>
                </div>
                
                <div>
                  <div style={{ color: '#7ecbff', fontSize: 14, marginBottom: 4 }}>Дата создания</div>
                  <div style={{ fontSize: 16 }}>
                    {searchResult.created_at
                      ? formatDate(searchResult.created_at)
                      : 'Неизвестно'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Список всех пользователей */}
        <div
          style={{
            background: 'rgba(20, 40, 70, 0.5)',
            borderRadius: 12,
            border: '1.5px solid #1e3557',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h2
            style={{
              color: '#7ecbff',
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Все пользователи
          </h2>
          
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '32px',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: '3px solid #38e0ff',
                  borderTop: '3px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              ></div>
            </div>
          ) : error ? (
            <div
              style={{
                color: '#ff7eb9',
                fontSize: 16,
                padding: '16px',
                background: 'rgba(255, 126, 185, 0.1)',
                borderRadius: 8,
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          ) : users.length === 0 ? (
            <div
              style={{
                color: '#7ecbff',
                fontSize: 16,
                padding: '16px',
                background: 'rgba(30, 60, 100, 0.3)',
                borderRadius: 8,
                textAlign: 'center',
              }}
            >
              Пользователи не найдены
            </div>
          ) : (
            <div
              style={{
                overflowX: 'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: 'rgba(30, 60, 100, 0.5)',
                      color: '#38e0ff',
                    }}
                  >
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid #2a4a7a',
                      }}
                    >
                      ID
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid #2a4a7a',
                      }}
                    >
                      MB ID
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid #2a4a7a',
                      }}
                    >
                      Энергия
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid #2a4a7a',
                      }}
                    >
                      Последний вход
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid #2a4a7a',
                      }}
                    >
                      Дата создания
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid rgba(42, 74, 122, 0.3)',
                      }}
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                        }}
                      >
                        {user.id}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                        }}
                      >
                        {user.mb_id}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                        }}
                      >
                        {user.energy !== undefined && user.energy !== null
                          ? `${user.energy} / 100`
                          : 'Не установлено'}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                        }}
                      >
                        {user.last_login_date
                          ? formatDate(user.last_login_date)
                          : 'Никогда'}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                        }}
                      >
                        {user.created_at
                          ? formatDate(user.created_at)
                          : 'Неизвестно'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 