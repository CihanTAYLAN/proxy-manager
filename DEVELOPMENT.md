# 🔥 Development Guide - Hot Reload Setup

Bu doküman, Proxy Manager projesinin hot reload desteği ile geliştirme sürecini açıklamaktadır.

## 🚀 Hızlı Başlangıç

### Development Ortamını Başlatma

```bash
# Repository'yi klonlayın
git clone <repository-url>
cd proxy-manager

# Development script'ini çalıştırın
./scripts/dev-start.sh
```

### Sistem Erişimi

- **Dashboard**: http://localhost/
- **Caddy Admin API**: http://localhost:2019 (container içi)

## 🔥 Hot Reload Özellikler

### Otomatik Güncellenecek Dosyalar

- `dashboard/src/**` - Tüm kaynak kodlar
- `dashboard/public/**` - Statik dosyalar
- `dashboard/tailwind.config.js` - Tailwind konfigürasyonu
- `dashboard/next.config.ts` - Next.js konfigürasyonu
- `dashboard/tsconfig.json` - TypeScript konfigürasyonu

### Container Restart Gerektiren Değişiklikler

- `dashboard/package.json` - Yeni dependency eklemeleri
- `dashboard/prisma/schema.prisma` - Database şema değişiklikleri
- Docker configuration dosyaları

## 🛠 Development Workflow

### 1. Kod Geliştirme

```bash
# Herhangi bir dosyayı düzenleyin
vim dashboard/src/components/MyComponent.tsx

# Değişiklikler otomatik olarak yansır (2-3 saniye)
# Browser'da http://localhost/ sayfasını yenileyin
```

### 2. Yeni Package Ekleme

```bash
# Container'ı durdur
docker compose down

# Package.json'ı düzenle
vim dashboard/package.json

# Container'ı yeniden başlat
./scripts/dev-start.sh
```

### 3. Database Schema Değişiklikleri

```bash
# Container içine gir
docker exec -it proxy-manager-dev sh

# Dashboard klasörüne git
cd /app/dashboard

# Schema değişikliğini uygula
npx prisma db push

# Prisma client'ı güncelle
npx prisma generate
```

## 📂 Volume Mount Yapısı

```
Host Machine                    Container
./dashboard/src/           →    /app/dashboard/src/
./dashboard/public/        →    /app/dashboard/public/
./dashboard/package.json   →    /app/dashboard/package.json
./dashboard/next.config.ts →    /app/dashboard/next.config.ts
./dashboard/tailwind.config.js → /app/dashboard/tailwind.config.js
./dashboard/prisma/        →    /app/dashboard/prisma/
./caddy/data/             →    /data/
```

## 🎯 Performance Optimizasyonları

### File Watching

- `CHOKIDAR_USEPOLLING=true` - Docker'da dosya değişikliklerini algılar
- `WATCHPACK_POLLING=true` - Webpack dosya izleme optimizasyonu

### Turbopack

- Next.js dev komutu `--turbopack` flag'i ile çalışır
- Daha hızlı build ve hot reload sağlar

### Node Modules Cache

- `dashboard-node-modules` named volume ile node_modules cache'lenir
- Container restart'ında npm install süresini azaltır

## 🐛 Troubleshooting

### Hot Reload Çalışmıyor

```bash
# Container'ı tamamen yeniden başlat
docker compose down -v
./scripts/dev-start.sh
```

### Port Çakışması

```bash
# 80 veya 443 portlarının kullanıp kullanılmadığını kontrol et
sudo lsof -i :80
sudo lsof -i :443

# Çakışan servisleri durdur
sudo service apache2 stop
sudo service nginx stop
```

### Database Bağlantı Hatası

```bash
# Prisma client'ı yeniden generate et
docker exec -it proxy-manager-dev sh
cd /app/dashboard
npx prisma generate
npx prisma db push
```

## 📋 Useful Commands

### Container Yönetimi

```bash
# Container'ı başlat
./scripts/dev-start.sh

# Container'ı durdur
docker compose down

# Container'ı restart et
docker compose restart proxy-manager

# Container'ı rebuild et
docker compose up --build

# Container'a gir
docker exec -it proxy-manager-dev sh
```

### Log İzleme

```bash
# Tüm container logları
docker compose logs -f

# Sadece dashboard logları
docker compose logs -f proxy-manager | grep "Dashboard"

# Sadece Caddy logları
docker compose logs -f proxy-manager | grep "Caddy"
```

### Development Database Yönetimi

```bash
# Prisma Studio başlat (container içinde)
docker exec -it proxy-manager-dev sh
cd /app/dashboard
npx prisma studio

# Database'i reset et
npx prisma db push --force-reset
```

## ⚡ Pro Tips

1. **IDE Setup**: VS Code'da Docker extension'ı kurun ve container içine attach olun
2. **Browser DevTools**: React DevTools extension'ını aktif edin
3. **Network Tab**: API çağrılarını izlemek için browser network tab'ını kullanın
4. **Console Logs**: Next.js logları hem terminal'de hem browser console'da görünür

## 🔐 Security Notes

- Development modunda `NODE_ENV=development`
- Caddy development configuration kullanılır
- Hot reload sadece development amaçlıdır, production'da disable edilir
- API endpoints'ler development'ta daha verbose logging yapar
