-- Tabela de interações do usuário
create table user_interactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  interaction_type text not null,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb
);

-- Tabela de preferências do usuário
create table user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de padrões de uso
create table usage_patterns (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  pattern_type text not null,
  frequency integer not null default 1,
  last_used timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb
);

-- Índices para melhor performance
create index idx_user_interactions_user_id on user_interactions(user_id);
create index idx_user_interactions_type on user_interactions(interaction_type);
create index idx_usage_patterns_user_id on usage_patterns(user_id);
create index idx_usage_patterns_type on usage_patterns(pattern_type);

-- Função para atualizar timestamp de preferências
create or replace function update_preferences_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar timestamp
create trigger update_preferences_timestamp
  before update on user_preferences
  for each row
  execute function update_preferences_timestamp(); 