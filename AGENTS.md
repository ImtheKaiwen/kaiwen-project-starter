# Kaiwen Project Starter — Katkı Rehberi

Önce `docs/PROJECT_SPEC.md`, `docs/ARCHITECTURE.md` ve `docs/DEVELOPMENT.md` dosyalarını oku.

- Electron `main`, `preload` ve React `renderer` güven sınırlarını koru. Renderer'a `fs`, `child_process` veya geniş kapsamlı IPC açma.
- Dosya sistemi ve süreç işlemlerini `src/main/services/` altında, test edilebilir adapter'lar üzerinden yürüt.
- Ortak sözleşmeleri `src/shared/` altında tut; Node bağımlılıklarını renderer'a taşıma.
- Tüm görsel değerler `src/renderer/src/styles.css` içindeki merkezi token'lardan beslensin. Açık, koyu, sistem teması ve klavye erişilebilirliğini koru.
- Üst `Kaiwen/templates/` dosyaları kullanıcı verisidir. Bu public uygulama reposuna kopyalama; testlerde geçici örnekler üret.
- Proje oluştururken mevcut hedefi asla ezme. GitHub seçiliyse uzak repo oluşturma başarısız olduğunda yerel proje klasörü oluşturma.
- Gizli değerleri loglama veya ayar JSON'una yazma. GitHub kimliği için yalnız resmi `gh` CLI kullan.
- Değişiklikten sonra `npm run lint`, `npm run typecheck`, `npm run test` ve `npm run build` çalıştır.
- Doğru `origin` remote'u yoksa push yapma. Release yalnız manuel iş akışıyla yapılır.
