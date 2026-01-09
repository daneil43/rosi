# Platinum Store Pro — نسخة ثابتة جاهزة للنشر

ملخص سريع:
- هذه نسخة ثابتة (HTML/CSS/JS) تعمل دون build وهي معدلة لتعمل على GitHub Pages تحت المسار `/rosi/`.
- الملفات: `index.html`, `index.css`, `app.js`, `products.json`, `404.html`, `README.md`.

نشر سريع:
1. انسخ الملفات إلى جذ�� المستودع أو إلى مجلد `docs/`.
2. ادفع التغييرات إلى GitHub.
3. في المستودع → Settings → Pages: اختر Source = `main / root` أو `main / docs` حسب المكان الذي وضعت الملفات به.
4. انتظر دقائق ثم افتح: `https://<username>.github.io/rosi/`

ملاحظة:
- إذا لديك مخرجات build من Angular (مجلد `dist/` أو ملفات `main.js`...)، انسخها إلى نفس المكان وستُحمّل تلقائياً (المتصفح يجرب تحميلها أولًا).
- إن أردت، أستطيع تجهيز نسخة جاهزة التي تضع محتويات مجلد `dist/` مع تعديل المسارات أو عمل GitHub Action لنشر build تلقائياً.