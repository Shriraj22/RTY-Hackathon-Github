-- MargDarshak Gurugram: Supabase Database Schema

-- 1. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('garbage', 'pothole')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'moderate', 'low')),
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'in-progress', 'resolved')),
    landmark TEXT NOT NULL,
    sector TEXT NOT NULL,
    ward INTEGER NOT NULL,
    zone_id TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    image_url TEXT,
    official_assigned TEXT,
    official_phone TEXT,
    escalated_to TEXT,
    upvotes INTEGER DEFAULT 1,
    reported_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3. Public read policy
CREATE POLICY "Public reports are viewable by everyone" 
ON public.reports FOR SELECT USING (true);

-- 4. Authenticated users can insert reports
CREATE POLICY "Authenticated users can create reports" 
ON public.reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Authenticated users can update reports (upvote or mark status)
CREATE POLICY "Anyone can update report upvotes and status" 
ON public.reports FOR UPDATE USING (true);
