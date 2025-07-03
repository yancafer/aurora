/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // Removido API_FOOTBALL_KEY pois não é mais utilizado
    // Se precisar expor a chave RapidAPI para o frontend, use NEXT_PUBLIC_RAPID_API_KEY
  },
};

module.exports = nextConfig;
