/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    // Em produção, permitir apenas origens específicas se configurado
    // Em desenvolvimento, permitir todas as origens (incluindo app mobile)
    const isProduction = process.env.NODE_ENV === 'production'
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
    
    // Para app mobile, sempre permitir (não tem origem específica)
    // Em produção, você pode querer restringir, mas apps mobile não enviam Origin header
    const corsOrigin = isProduction && allowedOrigins.length > 0 && !allowedOrigins.includes('*')
      ? allowedOrigins[0] // Usar primeira origem permitida
      : '*' // Permitir todas (necessário para app mobile)
    
    return [
      {
        // Aplicar CORS para todas as rotas de API
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: corsOrigin,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

