-- Migration: Ensure Supabase Auth automatically creates a Profile
-- Action: Creates a trigger on auth.users to insert into public.profiles

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    user_id, 
    name, 
    email, 
    role, 
    status, 
    profile_complete, 
    created_at, 
    updated_at
  ) VALUES (
    gen_random_uuid(), -- Mantém o comportamento original do ID da tabela
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'customer', -- Hardcoded. Role nunca mais virá do signup.
    'approved', 
    false, 
    NOW(), 
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop da trigger se já existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criação da trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
