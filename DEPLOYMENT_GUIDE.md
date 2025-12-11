# دليل نشر تطبيق مزود على VPS خارجي

## المتطلبات الأساسية

### 1. متطلبات الخادم (VPS)
- **نظام التشغيل:** Ubuntu 22.04 أو أحدث
- **الذاكرة:** 2GB RAM على الأقل (4GB مُوصى به)
- **المعالج:** 1 vCPU على الأقل
- **التخزين:** 20GB SSD على الأقل
- **Node.js:** الإصدار 20 أو أحدث
- **PostgreSQL:** الإصدار 14 أو أحدث

---

## الخطوة 1: إعداد الخادم

### الاتصال بالخادم عبر SSH
```bash
ssh root@YOUR_SERVER_IP
```

### تحديث النظام
```bash
apt update && apt upgrade -y
```

### تثبيت Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
node --version  # يجب أن يظهر v20.x.x
```

### تثبيت PostgreSQL
```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### إنشاء قاعدة البيانات
```bash
sudo -u postgres psql
```

داخل PostgreSQL:
```sql
CREATE USER mazoud_user WITH PASSWORD 'YOUR_STRONG_PASSWORD';
CREATE DATABASE mazoud_db OWNER mazoud_user;
GRANT ALL PRIVILEGES ON DATABASE mazoud_db TO mazoud_user;
\q
```

### تثبيت أدوات إضافية
```bash
apt install -y git nginx certbot python3-certbot-nginx
```

---

## الخطوة 2: رفع ملفات المشروع

### الطريقة 1: باستخدام Git
```bash
cd /var/www
git clone YOUR_GITHUB_REPO_URL mazoud
cd mazoud
```

### الطريقة 2: رفع الملفات يدوياً (SCP)
من جهازك المحلي:
```bash
scp -r ./mazoud-project root@YOUR_SERVER_IP:/var/www/mazoud
```

أو استخدم FileZilla/WinSCP لرفع الملفات إلى `/var/www/mazoud`

---

## الخطوة 3: إعداد متغيرات البيئة

### إنشاء ملف .env
```bash
cd /var/www/mazoud
nano .env
```

أضف المحتوى التالي:
```env
# قاعدة البيانات
DATABASE_URL=postgresql://mazoud_user:YOUR_STRONG_PASSWORD@localhost:5432/mazoud_db

# مفاتيح API
WAVERIFY_API_KEY=YOUR_WAVERIFY_API_KEY

# WhatsApp (اختياري)
WHATSAPP_ACCESS_TOKEN=YOUR_WHATSAPP_TOKEN
WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID

# EasySendSMS (اختياري)
EASYSENDSMS_API_KEY=YOUR_API_KEY
EASYSENDSMS_USERNAME=YOUR_USERNAME
EASYSENDSMS_PASSWORD=YOUR_PASSWORD
EASYSENDSMS_SENDER=YOUR_SENDER_ID

# إعدادات الخادم
NODE_ENV=production
PORT=5000
```

اضغط `Ctrl+X` ثم `Y` ثم `Enter` للحفظ.

---

## الخطوة 4: تثبيت التطبيق

```bash
cd /var/www/mazoud

# تثبيت المكتبات
npm install

# إنشاء جداول قاعدة البيانات
npm run db:push

# بناء التطبيق للإنتاج
npm run build
```

---

## الخطوة 5: إعداد PM2 لتشغيل التطبيق

### تثبيت PM2
```bash
npm install -g pm2
```

### إنشاء ملف ecosystem
```bash
nano ecosystem.config.js
```

أضف المحتوى:
```javascript
module.exports = {
  apps: [{
    name: 'mazoud',
    script: 'dist/index.js',
    cwd: '/var/www/mazoud',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

### تشغيل التطبيق
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### أوامر PM2 المفيدة
```bash
pm2 status          # عرض حالة التطبيق
pm2 logs mazoud     # عرض السجلات
pm2 restart mazoud  # إعادة تشغيل
pm2 stop mazoud     # إيقاف
```

---

## الخطوة 6: إعداد Nginx

### إنشاء ملف التكوين
```bash
nano /etc/nginx/sites-available/mazoud
```

أضف المحتوى (استبدل YOUR_DOMAIN.COM بنطاقك):
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.COM www.YOUR_DOMAIN.COM;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # لرفع الملفات الكبيرة
        client_max_body_size 50M;
    }
}
```

### تفعيل الموقع
```bash
ln -s /etc/nginx/sites-available/mazoud /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## الخطوة 7: إعداد SSL (HTTPS)

```bash
certbot --nginx -d YOUR_DOMAIN.COM -d www.YOUR_DOMAIN.COM
```

اتبع التعليمات وأدخل بريدك الإلكتروني.

### تجديد الشهادة تلقائياً
```bash
certbot renew --dry-run
```

---

## الخطوة 8: إعداد جدار الحماية

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## الخطوة 9: إعداد DNS

في لوحة تحكم نطاقك (نيم شيب أو غيره):

| النوع | الاسم | القيمة |
|-------|-------|--------|
| A | @ | YOUR_SERVER_IP |
| A | www | YOUR_SERVER_IP |

---

## استكشاف الأخطاء

### التطبيق لا يعمل
```bash
pm2 logs mazoud --lines 50
```

### مشكلة في قاعدة البيانات
```bash
sudo -u postgres psql -d mazoud_db
\dt  # عرض الجداول
```

### مشكلة في Nginx
```bash
nginx -t
tail -f /var/log/nginx/error.log
```

### إعادة نشر التحديثات
```bash
cd /var/www/mazoud
git pull  # إذا كنت تستخدم Git
npm install
npm run build
pm2 restart mazoud
```

---

## ملاحظات مهمة

1. **النسخ الاحتياطي:** احتفظ بنسخة من قاعدة البيانات بانتظام
   ```bash
   pg_dump -U mazoud_user mazoud_db > backup_$(date +%Y%m%d).sql
   ```

2. **التخزين السحابي:** إذا كنت تستخدم رفع الصور، تحتاج إعداد مجلد للتخزين:
   ```bash
   mkdir -p /var/www/mazoud/uploads
   chown -R www-data:www-data /var/www/mazoud/uploads
   ```

3. **الأمان:** تأكد من:
   - تغيير كلمة مرور قاعدة البيانات
   - عدم مشاركة ملف .env
   - تحديث الخادم بانتظام

---

## الدعم الفني

إذا واجهت أي مشكلة، تأكد من:
1. قراءة سجلات الأخطاء (`pm2 logs`)
2. التحقق من صحة متغيرات البيئة
3. التأكد من تشغيل PostgreSQL (`systemctl status postgresql`)
