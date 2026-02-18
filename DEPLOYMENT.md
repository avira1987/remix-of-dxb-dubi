# راهنمای Deployment

## اگر روی لوکال کار می‌کند ولی روی هاست اینترنتی نه

احتمالاً به خاطر **مسیر پایه (base path)** بوده است. در این پروژه اصلاح شده است:

- **vite.config.ts**: مقدار `base` برای استقرار در **root دامنه** روی `'/'` تنظیم شده است.
- **public/.htaccess**: `RewriteBase` برای root دامنه روی `'/'` است تا روتینگ React Router (مثلاً `/admin`, `/auth`) روی سرور درست کار کند.

اگر سایت را داخل **زیرپوشه** قرار می‌دهید (مثلاً `https://example.com/shop/`):
- در `vite.config.ts` مقدار `base` را به `'/shop/'` تغییر دهید.
- در `public/.htaccess` مقدار `RewriteBase` را به `'/shop/'` و قانون آخر را به `RewriteRule . /shop/index.html [L]` تغییر دهید.
- بعد از تغییر، دوباره `npm run build` بزنید و محتویات `dist` را آپلود کنید.

## مشکل MIME Type در Production

اگر در production با خطای زیر مواجه شدید:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream"
```

این یعنی سرور فایل‌های JavaScript را با MIME type اشتباه سرو می‌دهد. (نام فایل `main.tsx` در خطا به‌خاطر منبع کد باندل‌شده است؛ در واقع فایل `assets/index-xxx.js` با MIME اشتباه سرو می‌شود.)

## راه حل‌ها

### 1. اگر سرور شما Apache است:

در پروژه یک `.htaccess` با **AddType** و **Header set Content-Type** برای فایل‌های `.js` و `.mjs` قرار داده شده تا MIME type را اصلاح کند.

- فایل `.htaccess` داخل `public` به‌صورت خودکار موقع بیلد به `dist` کپی می‌شود.
- **مهم:** روی هاست، `.htaccess` باید **دقیقاً در همان پوشه‌ای** باشد که `index.html` قرار دارد (معمولاً root دامنه). اگر در زیرپوشه آپلود کرده‌اید، `.htaccess` را در همان زیرپوشه بگذارید.

اگر بعد از آپلود هنوز خطا بود:
- دستی فایل `public/.htaccess` را در `dist` کپی کنید و دوباره فقط محتویات `dist` را آپلود کنید.
- از پنل هاست مطمئن شوید **AllowOverride** برای Apache فعال است تا `.htaccess` خوانده شود.
- اگر هاست Nginx است، `.htaccess` کار نمی‌کند؛ به بخش Nginx همین راهنما بروید.

### 2. اگر سرور شما Netlify/Vercel است:

فایل `_headers` که در پوشه `public` قرار دارد، به صورت خودکار به `dist` کپی می‌شود.

### 3. اگر سرور شما Nginx است:

یک فایل `nginx.conf` یا تنظیمات زیر را اضافه کنید:

```nginx
location ~* \.(js|mjs)$ {
    add_header Content-Type application/javascript;
}

location ~* \.(css)$ {
    add_header Content-Type text/css;
}
```

### 4. اگر نمی‌دانید سرور شما چیست:

با پشتیبانی هاست تماس بگیرید و از آنها بخواهید:
- فایل‌های `.js` را با MIME type `application/javascript` سرو کنند
- فایل‌های `.mjs` را با MIME type `application/javascript` سرو کنند
- فایل‌های `.css` را با MIME type `text/css` سرو کنند

## مراحل Build و Deploy

1. Build پروژه:
   ```bash
   npm run build
   ```

2. بررسی کنید که فایل‌های زیر در پوشه `dist` وجود دارند:
   - `index.html`
   - `assets/` (پوشه فایل‌های JavaScript و CSS)
   - `.htaccess` یا `_headers` (بسته به نوع سرور)

3. تمام محتویات پوشه `dist` را به هاست آپلود کنید

4. مطمئن شوید که:
   - فایل `index.html` در root directory هاست قرار دارد
   - فایل `.htaccess` یا `_headers` در root directory هاست قرار دارد
   - پوشه `assets` به درستی آپلود شده است

## بررسی مشکلات

اگر هنوز صفحه سفید است:

1. Console مرورگر را باز کنید (F12)
2. به تب Network بروید
3. صفحه را Refresh کنید
4. بررسی کنید که:
   - فایل‌های `.js` با چه MIME type لود می‌شوند
   - آیا خطای 404 برای فایل‌ها وجود دارد
   - آیا فایل‌ها با موفقیت لود می‌شوند

5. لاگ‌های `[DEBUG]` در Console را بررسی کنید
