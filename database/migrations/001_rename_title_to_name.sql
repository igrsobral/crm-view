-- Migration: Rename 'title' column to 'name' and 'description' to 'notes' in deals table
-- This aligns the database schema with the frontend code expectations

-- First, check if the columns exist and rename them
DO $$
BEGIN
    -- Rename title to name if title column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' 
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.deals RENAME COLUMN title TO name;
    END IF;

    -- Rename description to notes if description column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.deals RENAME COLUMN description TO notes;
    END IF;

    -- Add name column if it doesn't exist (for fresh installations)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' 
        AND column_name = 'name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.deals ADD COLUMN name VARCHAR(200) NOT NULL DEFAULT 'Untitled Deal';
    END IF;

    -- Add notes column if it doesn't exist (for fresh installations)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' 
        AND column_name = 'notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.deals ADD COLUMN notes TEXT;
    END IF;
END $$;