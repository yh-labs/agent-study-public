-- ============================================================
-- PetLog 초기 스키마 (001_initial_schema.sql)
-- Supabase SQL Editor 또는 supabase db push로 실행
-- ============================================================

-- -------------------------------------------------------
-- 1. users
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       VARCHAR(255) NOT NULL,
  provider    VARCHAR(20)  NOT NULL CHECK (provider IN ('kakao', 'google')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email      ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users (deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select_own ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_insert_own ON public.users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (id = auth.uid());

-- -------------------------------------------------------
-- 2. pets
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  species      VARCHAR(10)  NOT NULL CHECK (species IN ('dog', 'cat')),
  breed        VARCHAR(100),
  birth_date   DATE,
  gender       VARCHAR(10)  CHECK (gender IN ('male', 'female')),
  is_neutered  BOOLEAN      NOT NULL DEFAULT FALSE,
  photo_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets (user_id);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY pets_select_own ON public.pets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY pets_insert_own ON public.pets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY pets_update_own ON public.pets FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY pets_delete_own ON public.pets FOR DELETE USING (user_id = auth.uid());

-- -------------------------------------------------------
-- 3. weight_logs
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         UUID         NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id        UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recorded_date  DATE         NOT NULL,
  weight_kg      NUMERIC(4,1) NOT NULL CHECK (weight_kg >= 0.1 AND weight_kg <= 99.9),
  is_anomaly     BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_weight_logs_pet_date UNIQUE (pet_id, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_pet_date ON public.weight_logs (pet_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id  ON public.weight_logs (user_id);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY weight_logs_select_own ON public.weight_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY weight_logs_insert_own ON public.weight_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY weight_logs_update_own ON public.weight_logs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY weight_logs_delete_own ON public.weight_logs FOR DELETE USING (user_id = auth.uid());

-- -------------------------------------------------------
-- 4. water_logs
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.water_logs (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         UUID    NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id        UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recorded_date  DATE    NOT NULL,
  amount_ml      INTEGER NOT NULL CHECK (amount_ml >= 0 AND amount_ml <= 9999),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_water_logs_pet_date UNIQUE (pet_id, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_water_logs_pet_date ON public.water_logs (pet_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_id  ON public.water_logs (user_id);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY water_logs_select_own ON public.water_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY water_logs_insert_own ON public.water_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY water_logs_update_own ON public.water_logs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY water_logs_delete_own ON public.water_logs FOR DELETE USING (user_id = auth.uid());

-- -------------------------------------------------------
-- 5. monthly_reports
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id                   UUID         NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id                  UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  year                     INTEGER      NOT NULL CHECK (year >= 2024),
  month                    INTEGER      NOT NULL CHECK (month >= 1 AND month <= 12),
  avg_weight_kg            NUMERIC(5,2),
  avg_water_ml             INTEGER,
  prev_weight_change_kg    NUMERIC(5,2),
  prev_weight_change_pct   NUMERIC(5,2),
  prev_water_change_ml     INTEGER,
  prev_water_change_pct    NUMERIC(5,2),
  anomaly_count            INTEGER      NOT NULL DEFAULT 0,
  record_days              INTEGER      NOT NULL DEFAULT 0,
  daily_weight_data        JSONB,
  daily_water_data         JSONB,
  anomaly_dates            JSONB        NOT NULL DEFAULT '[]',
  pdf_url                  TEXT,
  status                   VARCHAR(20)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_monthly_reports_pet_year_month UNIQUE (pet_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_reports_pet_id ON public.monthly_reports (pet_id, year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_user_id ON public.monthly_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_status ON public.monthly_reports (status) WHERE status = 'pending';

ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY monthly_reports_select_own ON public.monthly_reports FOR SELECT USING (user_id = auth.uid());

-- -------------------------------------------------------
-- 6. user_settings
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID    NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bowl_capacity_ml      INTEGER NOT NULL DEFAULT 300,
  reminder_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_time         TIME    NOT NULL DEFAULT '20:00',
  anomaly_alert_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  report_alert_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_settings_select_own ON public.user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY user_settings_insert_own ON public.user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_settings_update_own ON public.user_settings FOR UPDATE USING (user_id = auth.uid());

-- -------------------------------------------------------
-- 7. push_subscriptions
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID     NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint    TEXT     NOT NULL,
  p256dh      TEXT     NOT NULL,
  auth        TEXT     NOT NULL,
  user_agent  VARCHAR(255),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY push_subscriptions_select_own ON public.push_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY push_subscriptions_insert_own ON public.push_subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY push_subscriptions_update_own ON public.push_subscriptions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY push_subscriptions_delete_own ON public.push_subscriptions FOR DELETE USING (user_id = auth.uid());

-- -------------------------------------------------------
-- 8. updated_at 자동 갱신 트리거
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at             BEFORE UPDATE ON public.users             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_pets_updated_at              BEFORE UPDATE ON public.pets              FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_weight_logs_updated_at       BEFORE UPDATE ON public.weight_logs       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_water_logs_updated_at        BEFORE UPDATE ON public.water_logs        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_monthly_reports_updated_at   BEFORE UPDATE ON public.monthly_reports   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_user_settings_updated_at     BEFORE UPDATE ON public.user_settings     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_push_subscriptions_updated_at BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
