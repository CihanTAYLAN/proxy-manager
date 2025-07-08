# Proxy Manager

Caddy Server REST API kullanarak proxy yönlendirmeleri, SSL sertifikaları, API kullanıcıları ve Dashboard kullanıcı yönetimini içeren kapsamlı bir web yönetim panelidir.

## Özellikler

- **Proxy Yönetimi**: Caddy Server üzerinden proxy konfigürasyonları oluşturma, düzenleme ve silme
- **SSL Sertifika Yönetimi**: ACME sertifika durumları, geçerlilik tarihleri ve otomatik yenileme
- **API Token Yönetimi**: Güvenli API anahtarları oluşturma ve yönetimi
- **Kullanıcı Yönetimi**: Dashboard kullanıcıları için authentication ve authorization
- **HOST-based Routing**: Environment değişkeni ile dinamik hostname routing
- **Modern UI**: Next.js + TypeScript + Tailwind ile responsive ve modern arayüz
- **Dark/Light Mode**: Tema değiştirme desteği

## Teknolojiler

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **UI Framework**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: Tanstack Query
- **Database**: SQLite + Prisma ORM
- **Proxy Server**: Caddy v2
- **Containerization**: Docker + Docker Compose
- **Authentication**: JWT

## Environment Variables

### HOST (Zorunlu)

Container'ın hangi hostname üzerinden çalışacağını belirtir. Bu değer proxy routing için kritik öneme sahiptir.

**Development:**

```bash
HOST=localhost
```

**Production:**

```bash
HOST=example.com
```

**Routing Mantığı:**

- `example.com` → Dashboard'a yönlendirilir
- `test.example.com` → Caddy proxy ayarlarına göre yönlendirilir
- `*.example.com` → Dinamik proxy kurallarına göre routing

## Proje Yapısı

```
proxy-manager/
├── docker-compose.yml          # Docker servislerin tanımı
├── caddy/                      # Caddy Server konfigürasyonu
│   ├── Caddyfile              # Caddy temel config
│   ├── data/                  # Caddy verileri (volumes)
│   │   ├── acme/             # SSL sertifikalar
│   │   └── logs/             # Caddy logları
│   └── config.json           # Caddy REST API config
├── dashboard/                  # Next.js Dashboard uygulaması
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   │   ├── api/          # Backend API routes
│   │   │   │   ├── auth/     # Authentication endpoints
│   │   │   │   ├── proxies/  # Proxy CRUD endpoints
│   │   │   │   ├── ssl/      # SSL status endpoints
│   │   │   │   └── tokens/   # API token endpoints
│   │   │   ├── dashboard/    # Dashboard sayfaları
│   │   │   └── login/        # Login sayfası
│   │   ├── components/       # React UI bileşenleri
│   │   ├── context/          # React Context (tema, auth)
│   │   ├── lib/              # Yardımcı fonksiyonlar
│   │   └── styles/           # Tailwind tema dosyaları
│   ├── prisma/               # Prisma ORM
│   │   ├── schema.prisma     # Veritabanı şeması
│   │   └── migrations/       # DB migration dosyaları
│   └── package.json          # Dashboard dependencies
├── scripts/                   # Yardımcı scriptler
│   ├── setup.sh              # Proje kurulum
│   ├── dev-start.sh          # Development başlatma
│   └── migrate.sh            # Database migration
└── README.md                 # Bu dosya
```

## Kurulum

### Gereksinimler

- Docker ve Docker Compose
- Node.js 18+ (development için)

### Hızlı Başlangıç

1. **Projeyi klonlayın:**

   ```bash
   git clone <repo-url>
   cd proxy-manager
   ```

2. **Environment değişkenlerini ayarlayın:**

   ```bash
   # Development için (docker-compose.yml'de varsayılan: localhost)
   export HOST=localhost

   # Production için
   export HOST=yourdomain.com
   ```

3. **Kurulum scriptini çalıştırın:**

   ```bash
   ./scripts/setup.sh
   ```

4. **Uygulamayı başlatın:**

   ```bash
   docker-compose up -d
   ```

5. **Dashboard'a erişin:**
   - Development: http://localhost
   - Production: https://yourdomain.com (HOST değişkeni ile belirlenen domain)
   - Caddy Admin API: http://localhost:2019

### Development Modu

Development modunda çalışmak için:

```bash
# HOST değişkenini ayarlayın
export HOST=localhost

# Development scriptini çalıştırın
./scripts/dev-start.sh
```

Bu script:

- Caddy server'ı Docker'da başlatır
- Dashboard'u development modunda (hot reload) çalıştırır
- HOST değişkenini kullanarak routing yapar

### Production Deployment Örneği

Production sunucunuzda (IP: 123.123.123.123):

```bash
# Domain'inizi ayarlayın
export HOST=example.com
export NODE_ENV=production

# Container'ı başlatın
docker-compose up -d
```

**Sonuç:**

- `example.com` → Dashboard'a yönlendirilir
- `test.example.com` → Proxy ayarlarınıza göre yönlendirilir
- SSL sertifikaları otomatik olarak ACME ile alınır

## API Endpoints

### Dashboard API (/api/)

- **Authentication**

  - `POST /api/auth/login` - Kullanıcı girişi
  - `POST /api/auth/logout` - Çıkış işlemi

- **Proxy Management**

  - `GET /api/proxies` - Proxy listesi
  - `POST /api/proxies` - Yeni proxy oluştur
  - `PUT /api/proxies` - Proxy güncelle
  - `DELETE /api/proxies` - Proxy sil

- **SSL Management**

  - `GET /api/ssl` - SSL sertifika durumları

- **Token Management**
  - `GET /api/tokens` - API token listesi
  - `POST /api/tokens` - Yeni token oluştur
  - `DELETE /api/tokens` - Token sil

### Caddy Admin API

- `GET :2019/config/` - Mevcut konfigürasyon
- `PUT :2019/config/` - Konfigürasyon güncelle

## Database

Proje SQLite veritabanı kullanır. Database işlemleri için:

```bash
# Prisma client oluştur
./scripts/migrate.sh generate

# Migration'ları uygula
./scripts/migrate.sh deploy

# Database'i sıfırla (dikkat: veri kaybolur)
./scripts/migrate.sh reset

# Seed data ekle
./scripts/migrate.sh seed
```

## Development

### Klasör Yapısı Kuralları

- `dashboard/src/app/api/` - Next.js API Routes (backend)
- `dashboard/src/app/dashboard/` - Dashboard sayfaları
- `dashboard/src/components/` - Reusable React bileşenleri
- `dashboard/src/lib/` - Yardımcı fonksiyonlar ve Caddy API client
- `dashboard/src/context/` - React Context'ler (tema, auth)

### Coding Standards

- TypeScript kullanılır
- ESLint + Prettier ile kod formatting
- Tailwind CSS ile styling
- JSDoc ile fonksiyon dokümantasyonu
- Clean Code ve SOLID principles

### Testing

```bash
cd dashboard
npm run test       # Unit testler
npm run test:e2e   # E2E testler
```

## Deployment

Production için:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Lisans

MIT License

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın
