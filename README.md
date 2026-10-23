# Kaiwen Project Starter

Kaiwen çalışma alanındaki projeleri hızlıca bulup VS Code'da açan ve seçili Markdown şablonlarıyla güvenli yeni proje iskeletleri oluşturan hafif Windows masaüstü uygulaması.

## Özellikler

- Cache-first proje kataloğu, Türkçe karakter destekli anlık arama ve `Ctrl+K`, oklar, `Enter`, `Esc` klavye akışı
- Electron main/preload/renderer güven ayrımı; `contextIsolation`, sandbox, CSP ve dar tipli IPC
- Sistem, açık ve koyu tema; merkezi CSS token'ları ve reduced-motion desteği
- `common` + kategori şablonlarını seçme, projeye özel düzenleme, güvenli Markdown önizleme ve çoklu özel belge ekleme
- Hedefi ezmeden atomik proje oluşturma, dinamik `README.md`, `AGENTS.md`, karar kaydı, başlangıç promptu ve `.kaiwen/project.json`
- Gerçekte bulunan PNG/SVG/WebP logo varyantlarını isteğe bağlı ve içeriği değiştirmeden kopyalama
- Resmî GitHub CLI ile uzak repo → yerel dosyalar → `main` ilk commit → push sıralaması
- Ayarlanabilir kategoriler, editor yolu, Windows başlangıcı ve proje kataloğu yönetimi

## Gereksinimler

- Windows 11
- Node.js 22.12 veya üzeri ve npm 10+
- Proje açmak için VS Code `code` CLI veya ayarlardan seçilmiş güvenilir editör çalıştırılabilir dosyası
- GitHub akışı için Git, [GitHub CLI](https://cli.github.com/) ve bir kez çalıştırılmış `gh auth login`

## Kurulum ve geliştirme

```powershell
npm ci
npm run dev
```

Kalite ve üretim komutları:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run dist:win
```

`dist:win`, `release/` altında NSIS kurulumu üretir. Kod imzalama sertifikası yapılandırılmadığı sürece çıktı imzasızdır; Windows SmartScreen uyarı gösterebilir. Bu uyarı imzalı yayın iddiasıyla gizlenmez.

## İlk kullanım

Uygulama ilk ayarını Windows Masaüstü altındaki `Kaiwen` klasörüne göre hazırlar. Ayarlar > Çalışma alanı bölümünden OneDrive yönlendirmeli Masaüstü dahil gerçek kökü seçebilirsiniz. Kategori hedefleri köke göre göreli tutulur; bir yolu değiştirmek eski projeleri taşımaz.

Uygulama önce yerel proje cache'ini gösterir, ardından etkin kategori köklerini sınırlı şekilde yeniler. `node_modules`, `.git`, `dist`, `build`, sanal ortam, dataset ve benzeri ağır klasörlerin içine girmez. Ayarlarda **Projeleri yenile**, **Manuel proje ekle** ve **Listeden kaldır** bulunur. Listeden kaldırma fiziksel klasörü silmez.

Ana ekranda:

- `Ctrl+K`: aramaya odaklan
- `↑` / `↓`: sonucu seç
- `Enter`: seçili projeyi editörde aç
- `Esc`: sorguyu temizle
- Çift tıklama: projeyi aç

## Şablonlar ve marka varlıkları

Şablon kaynağı varsayılan olarak `<Kaiwen>/templates/` dizinidir. `common/` belgeleri kategori profiliyle birlikte listelenir. Aynı adlı belgeler `docs/standards/common/` ve `docs/standards/<profil>/` altında ayrı tutulur. Kaynak şablonlardaki `TODO` maddeleri taslaktır; tamamlanmış şirket politikası sayılmaz.

Ayarlar > Şablon yönetimi kaynak dosyayı açık bir **Kaydet** eylemiyle değiştirir. Yeni Proje ekranındaki düzenleme yalnız oluşturulan proje snapshot'ını etkiler. Özel belgeler kopyalanır; kaynakları taşınmaz.

Logoları `<Kaiwen>/branding/logos/` altına yerleştirin veya Ayarlar'dan başka klasör seçin. **Kaiwen logolarını ekle** varsayılan olarak kapalıdır. Açıldığında yalnız gerçekten bulunan `.png`, `.svg` ve `.webp` dosyaları `branding/logos/` altına kopyalanır. Logo yoksa placeholder üretilmez.

## GitHub akışı

Önce terminalde bir kez:

```powershell
gh auth login
git config --global user.name "Ad Soyad"
git config --global user.email "mail@example.com"
```

Yeni Proje ekranında **GitHub reposu oluştur** kapalı gelir. Açıldığında Private (varsayılan) veya Public seçilir; ayrı repo adı alanı yoktur. Proje adı tek bir güvenli slug'a çevrilir ve hem klasör hem repo adı olur. Owner bağlı hesaptan gelir; organizasyon tercihi Ayarlar > GitHub bölümündedir.

Servis sırası şöyledir:

1. Ad, yollar, şablonlar, Git/`gh`, auth ve public içerik güvenliği doğrulanır.
2. Boş uzak repo oluşturulur. Ad çakışması, 403 veya auth hatasında hedef yerel proje klasörü oluşmaz.
3. Dosyalar geçici staging dizininde hazırlanıp hedefe atomik taşınır.
4. `git init -b main`, ilk commit, doğrulanmış `origin` ve `git push -u origin main` çalışır.
5. Uzak repo sonrası yerel/commit/push hatası kullanıcı veri dizinindeki operasyon kaydına yazılır; uzak repo otomatik silinmez.

Public seçiminde özel Markdown belgeleri ve logolar da görünür olur. Basit gizli anahtar kontrolüne ek olarak içeriği kendiniz gözden geçirin. `.env`, private key ve benzeri dosyalar `.gitignore` kapsamındadır.

GitHub kapalıyken oluşturma tamamen çevrimdışı çalışır. Yerel `git init` bağımsız ve varsayılan olarak kapalıdır. Bu uygulama reposunun Git geçmişi ile üretilen her projenin Git geçmişi birbirinden bağımsızdır.

## Sürüm ve otomatik güncelleme

Uygulama `electron-updater` ile GitHub Releases kanalını denetler. Yeni sürüm bulunduğunda sidebar'da modern indirme simgesi görünür; indirme yüzdesi aynı alanda izlenir. İndirme tamamlanınca **Kur ve yeniden başlat** eylemi uygulamayı kapatıp NSIS kurulumunu başlatır. İndirme sırasında ana pencere kapatılırsa uygulama sistem tepsisinde çalışmayı sürdürür; tepsi menüsünden tekrar gösterilebilir.

Sürüm yayınlamak için önce `package.json` sürümünü artırıp commit'i `main` dalına gönderin. Ardından GitHub Actions içindeki **Release** iş akışını `Run workflow` ile bilinçli olarak başlatın. İş akışı yalnız `workflow_dispatch` ile çalışır; push veya etiket yeni sürümü otomatik yayınlamaz.

Manuel `Release` çalışması lint, typecheck ve testler başarılıysa Windows installer, blockmap ve `latest.yml` dosyalarını aynı sürüm numarasıyla GitHub Release'e yayınlar. Kod imzalama sertifikası ayarlanmadıysa installer imzasızdır ve SmartScreen uyarısı gösterebilir.

## Mimari ve güvenlik

Detaylar [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), geliştirme akışı [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) dosyasındadır. Uygulama telemetry, analytics, hesap sunucusu veya veritabanı kullanmaz. Ayarlar ve katalog Electron `userData` altında atomik JSON olarak tutulur; bozuk dosya kurtarma kopyasına çevrilip güvenli varsayılan oluşturulur.

## Bilinen sınırlar

- V1 yalnız VS Code uyumlu `--new-window` / `--reuse-window` argümanlarını destekler.
- GitHub girişinin interaktif kısmı uygulama içinde token formuyla değil terminalde `gh auth login` ile yapılır.
- Windows installer varsayılan olarak imzasızdır.
- Gerçek GitHub entegrasyon testleri repo oluşturmaz; CLI adapter'ı test doubles ile doğrulanır.

CI sonuçları GitHub Actions içindeki **CI** iş akışında; manuel sürüm çıktıları **Release** iş akışında görülür.
