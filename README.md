# Proje Takip Uygulaması

Modern ve kapsamlı bir proje ve görev yönetimi uygulaması.

## Özellikler

- **Kullanıcı Yönetimi**: Google, GitHub ve Email/Şifre ile giriş
- **Rol Tabanlı Erişim Kontrolü**: Dinamik roller ve izinler
- **Proje Yönetimi**: Proje oluşturma, üye ekleme, workflow yönetimi
- **Kanban Board**: Sürükle-bırak görev yönetimi
- **İstatistikler**: Detaylı performans grafikleri ve raporlar

## Teknoloji Stack

### Backend
- Node.js + Express.js
- MySQL + Knex.js
- Passport.js (JWT, Google OAuth, GitHub OAuth)
- Joi (validation)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- @dnd-kit (drag & drop)
- Recharts (grafikler)

## Kurulum

### Gereksinimler
- Node.js 18+
- MySQL 8.0+
- npm veya yarn

### Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle ve veritabanı bilgilerini gir

# Veritabanını oluştur (MySQL'de)
# CREATE DATABASE project_tracking;

# Migration'ları çalıştır
npm run migrate

# Seed verilerini yükle
npm run seed

# Sunucuyu başlat
npm run dev
```

### Frontend Kurulumu

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# .env.local dosyasını oluştur
cp .env.local.example .env.local

# Geliştirme sunucusunu başlat
npm run dev
```

## Ortam Değişkenleri

### Backend (.env)

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=project_tracking

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/refresh` - Token yenileme
- `GET /api/auth/me` - Mevcut kullanıcı
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth

### Users
- `GET /api/users` - Kullanıcı listesi
- `GET /api/users/:id` - Kullanıcı detayı
- `PUT /api/users/:id` - Kullanıcı güncelle
- `DELETE /api/users/:id` - Kullanıcı sil

### Roles
- `GET /api/roles` - Rol listesi
- `POST /api/roles` - Rol oluştur
- `PUT /api/roles/:id` - Rol güncelle
- `DELETE /api/roles/:id` - Rol sil
- `GET /api/roles/permissions` - İzin listesi

### Projects
- `GET /api/projects` - Proje listesi
- `POST /api/projects` - Proje oluştur
- `GET /api/projects/:id` - Proje detayı
- `PUT /api/projects/:id` - Proje güncelle
- `DELETE /api/projects/:id` - Proje sil
- `GET /api/projects/:id/members` - Proje üyeleri
- `POST /api/projects/:id/members` - Üye ekle
- `DELETE /api/projects/:id/members/:userId` - Üye çıkar
- `GET /api/projects/:id/stages` - Workflow aşamaları
- `POST /api/projects/:id/stages` - Aşama ekle

### Tasks
- `GET /api/tasks` - Görev listesi
- `GET /api/tasks/project/:projectId` - Proje görevleri (Kanban)
- `POST /api/tasks` - Görev oluştur
- `GET /api/tasks/:id` - Görev detayı
- `PUT /api/tasks/:id` - Görev güncelle
- `DELETE /api/tasks/:id` - Görev sil
- `PATCH /api/tasks/:id/move` - Görev taşı
- `GET /api/tasks/:id/comments` - Yorumlar
- `POST /api/tasks/:id/comments` - Yorum ekle

### Statistics
- `GET /api/statistics/dashboard` - Dashboard istatistikleri
- `GET /api/statistics/tasks-by-status` - Duruma göre görevler
- `GET /api/statistics/tasks-by-priority` - Önceliğe göre görevler
- `GET /api/statistics/completion-trend` - Tamamlama trendi
- `GET /api/statistics/productivity` - Verimlilik
- `GET /api/statistics/deadlines` - Yaklaşan tarihler

## Varsayılan Roller

1. **Admin** - Tam yetki
2. **Project Manager** - Proje ve görev yönetimi
3. **Developer** - Görev oluşturma ve düzenleme
4. **Viewer** - Sadece görüntüleme

## Lisans

MIT
