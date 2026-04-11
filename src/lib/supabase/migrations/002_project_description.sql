-- Migration 002 — Description projet (dérivée du brainstorm)
-- À exécuter dans Supabase Dashboard > SQL Editor

alter table projects add column if not exists description text;
