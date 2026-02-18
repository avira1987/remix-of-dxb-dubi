# راهنمای تنظیم Nginx برای پروژه

این فایل راهنمای استفاده از فایل کانفیگ Nginx برای پروژه است.

## فایل کانفیگ

فایل `nginx.conf` در ریشه پروژه قرار دارد و شامل تنظیمات زیر است:

- پشتیبانی از React Router (SPA routing)
- فشرده‌سازی Gzip
- Cache برای فایل‌های استاتیک
- Security headers

## نحوه استفاده

### 1. کپی فایل روی سرور

فایل `nginx.conf` را روی سرور خود کپی کنید. معمولاً در یکی از این مسیرها:

```bash
# برای یک سایت خاص
/etc/nginx/sites-available/your-site

# یا برای استفاده مستقیم
/etc/nginx/conf.d/your-site.conf
```

### 2. تنظیم مسیر root

در فایل `nginx.conf`، مسیر `root` را مطابق با مسیر واقعی روی سرور تنظیم کنید:

```nginx
root /app/dist;  # یا مسیر واقعی شما، مثلاً /var/www/html/dist
```

### 3. فعال‌سازی سایت (اگر از sites-available استفاده می‌کنید)

```bash
sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/
```

### 4. تست کانفیگ

```bash
sudo nginx -t
```

### 5. راه‌اندازی مجدد Nginx

```bash
sudo systemctl reload nginx
# یا
sudo service nginx reload
```

## نکات مهم

- مطمئن شوید که پوشه `dist` روی سرور وجود دارد و محتویات آن شامل `index.html` است.
- اگر از Docker استفاده می‌کنید، مسیر `/app/dist` معمولاً درست است.
- برای HTTPS، باید یک بلوک `server` جداگانه با `listen 443 ssl` اضافه کنید.

## مثال برای Docker

اگر از Docker استفاده می‌کنید، می‌توانید این کانفیگ را در `docker-compose.yml` یا Dockerfile استفاده کنید:

```yaml
services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./dist:/app/dist
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "80:80"
```
