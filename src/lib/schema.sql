-- ========================================================
-- VnE Reader English - PostgreSQL Database Schema
-- Compatible with PostgreSQL 13+, Supabase, Neon, AWS RDS
-- ========================================================

-- 1. Bảng lưu trữ Người dùng (Users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar TEXT,
    provider VARCHAR(32) NOT NULL, -- 'google', 'facebook', 'credentials'
    provider_id VARCHAR(255),
    role VARCHAR(32) DEFAULT 'learner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);

-- 2. Bảng lưu trữ Sổ từ vựng cá nhân hóa (Saved Words)
CREATE TABLE IF NOT EXISTS saved_words (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    word VARCHAR(128) NOT NULL,
    ipa VARCHAR(128),
    part_of_speech VARCHAR(64),
    meaning TEXT NOT NULL,
    context_sentence TEXT,
    article_title TEXT,
    article_url TEXT,
    cefr VARCHAR(10),
    mastery VARCHAR(32) DEFAULT 'new', -- 'new', 'learning', 'mastered'
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_words_user ON saved_words(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_words_word ON saved_words(word);

-- 3. Bảng theo dõi Tiến độ & Thống kê học tập (Learning Progress)
CREATE TABLE IF NOT EXISTS learning_progress (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    streak_days INTEGER DEFAULT 1,
    words_learned INTEGER DEFAULT 0,
    articles_read INTEGER DEFAULT 0,
    daily_goal INTEGER DEFAULT 5,
    last_active_date DATE DEFAULT CURRENT_DATE,
    read_article_ids TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
