# Mimari

## Güven sınırları

```text
React renderer
  └─ window.kaiwen (dar ve tipli API)
       └─ sandbox preload / contextBridge
            └─ doğrulanan ipcMain handler'ları
                 ├─ Settings / JSON stores
                 ├─ Template service
                 ├─ Project catalog + discovery
                 ├─ Project creation state machine
                 └─ GitHub / Git / editor command adapters
```

Renderer Node entegrasyonu içermez. Dosya seçimi Electron dialog'larıyla, dosya okuma/yazma ve alt süreçler main process servisleriyle yürür. Komutlar `shell: false` ve argüman dizisiyle başlatılır. IPC çağrıları pencerenin webContents/sender kaynağı ve girdi sınırlarıyla doğrulanır.

## Veri modeli

Electron `userData` altında üç atomik JSON bulunur:

- `settings.json`: sürümlü uygulama ayarları ve kategori eşlemeleri
- `projects.json`: proje yolu, kategori, son açılma ve eksik konum durumu
- `operations.json`: GitHub proje oluşturma durumları ve kurtarma bilgisi

Bozuk JSON zaman damgalı `.corrupt-*` dosyasına taşınır ve varsayılan oluşturulur. Kişisel Markdown içeriği loglanmaz.

## Proje oluşturma

GitHub açıkken durumlar `VALIDATING → CREATING_REMOTE → CREATING_LOCAL → INITIAL_COMMIT → PUSHING → COMPLETED` şeklindedir. Remote oluşturma başarısızlığı `REMOTE_FAILED` olarak kaydedilir ve hedef klasör yoktur. Remote sonrasındaki yerel veya push hatası repo URL'siyle kaydedilir; otomatik remote silme yapılmaz.

Dosyalar hedefin kardeşi bir staging dizininde `wx` ile hazırlanır. Kaynak şablonlar, özel belgeler ve gerçek logolar doğrulanır; manifest SHA-256 snapshot bilgisi taşır. Hazır staging hedefe rename edilir. Var olan hedef hiçbir zaman ezilmez.

## Proje keşfi ve arama

UI önce cache'i gösterir. Arka plan yenilemesi yalnız etkin kategori köklerinin doğrudan proje dizinlerini okur; symlink/junction ve ağır klasörleri izlememesi amaçlanır. Arama disk kullanmaz; bellekte Türkçe katlama, exact/prefix/partial puanı ve son açılma sırasıyla çalışır.

## Tema

Renk, radius, spacing ve gölge değerleri `styles.css` kök token'larındadır. `system`, `light`, `dark`, `prefers-color-scheme` ve reduced-motion tek kaynaktan uygulanır.
