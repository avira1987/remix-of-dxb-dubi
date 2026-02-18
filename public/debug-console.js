/**
 * اسکریپت تشخیصی - در کنسول کروم (F12 > Console) paste کنید و Enter بزنید.
 * خروجی را برای پیدا کردن مشکل استفاده کنید.
 *
 * کد زیر را کپی کنید و در Console بچسبانید:
 */
(function () {
  function log(t) { console.log(t); }
  log("=== تشخیص مشکل لود سایت ===");
  log("آدرس: " + location.href);
  var scripts = document.querySelectorAll('script[type="module"][src]');
  log("اسکریپت‌های module: " + scripts.length);
  scripts.forEach(function (s, i) {
    var src = s.src;
    log("  [" + (i + 1) + "] " + src);
    if (src.indexOf("/src/") !== -1) log("      ❌ لینک به /src/ است؛ روی هاست باید /assets/xxx.js باشد.");
    if (src.indexOf("/assets/") !== -1) log("      ✓ آدرس بیلد درست است.");
  });
  var root = document.getElementById("root");
  log("#root: " + (root ? "موجود، طول محتوا=" + root.innerHTML.length : "وجود ندارد"));
  var first = scripts[0];
  if (first && first.src) {
    log("تست دریافت JS...");
    fetch(first.src, { method: "HEAD" }).then(function (r) {
      var ct = r.headers.get("Content-Type") || "";
      log("  HTTP: " + r.status + ", Content-Type: " + ct);
      if (r.status !== 200) log("  ❌ فایل پیدا نشد (404 یا خطای سرور).");
      else if (ct.indexOf("javascript") === -1 && ct.indexOf("octet-stream") !== -1) log("  ❌ مشکل MIME: باید application/javascript باشد. راه‌حل: .htaccess یا تنظیم Nginx.");
      else if (ct.indexOf("javascript") !== -1) log("  ✓ MIME درست است.");
      log("=== پایان تشخیص ===");
    }).catch(function (e) {
      log("  ❌ خطا: " + e.message);
      log("=== پایان تشخیص ===");
    });
  } else {
    log("اسکریپت با src برای تست پیدا نشد.");
    log("=== پایان تشخیص ===");
  }
})();
