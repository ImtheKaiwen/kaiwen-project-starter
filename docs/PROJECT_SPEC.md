# Kaiwen Project Starter — Codex Tek Oturum Geliştirme Talimatı

> **Durum:** Geliştirme brifi / yürütme talimatı  
> **Hedef ortam:** Windows 11, yerel Kaiwen çalışma alanı  
> **Repo:** `kaiwen-project-starter` — kullanıcı tarafından açılmış bağımsız, **public** GitHub deposu  
> **Uygulama konumu:** `<KAIWEN_ROOT>/apps/desktop/kaiwen-project-starter/`  
> **Çalışma alanı kökü:** Kullanıcının seçtiği `Kaiwen/` klasörü; **Git reposu değil**

## 0. Görevin ve başarı tanımı

Sen kıdemli bir Electron + React + TypeScript mühendisisin. Bu talimatı yalnızca plan olarak cevaplama: **çalışan, test edilmiş, paketlenebilir bir Windows masaüstü uygulamasını yaz ve çalıştır.**

**Kaiwen Project Starter**, iki çekirdek iş yapan küçük bir araçtır:
1. **Project Launcher:** Kaydedilmiş ve mevcut projeleri isimle anında arar; `Enter` ile VS Code'da açar.
2. **Project Creator:** Yeni yazılım projeleri için kategori klasörlerini, Markdown kurallarını, özel dokümanları, `README.md`, `AGENTS.md`, karar kayıtlarını, isteğe bağlı marka logolarını ve Codex başlangıç promptunu **tek tıklamayla** oluşturur. İstenirse **GitHub reposunu önce oluşturur**, ardından yeni yerel proje için `git init`, ilk commit ve `main` push işlemini otomatik yapar.

Başarılı açılışta ana ekran arama odaklıdır. Yeni proje oluşturma ikinci bir hafif görünüm olarak açılır; ayrı büyük proje yönetim uygulaması yapma.

Ürün felsefesi: **ana ekranda en az seçenek, ayarlarda yeterli kontrol, hızlı ve güvenilir tek işlem**. Proje yönetim sistemi, AI sohbet uygulaması veya kapsamlı IDE yapma.

Başlamadan önce çalışma alanını ve varsa mevcut proje dosyalarını incele. Mevcut dosyaları gereksiz yere yeniden yazma. Kullanıcıdan projeyi yeniden anlatmasını isteme; aşağıdaki sınırlar tasarım kararlarıdır.

## 1. Kapsam ve Git sınırları

- `Kaiwen/` ana klasöründe **Git init yapma, `.github/` veya merkezi CI/CD açma**.
- Yalnızca `apps/desktop/kaiwen-project-starter/` kendi Git reposudur.
- `Kaiwen/templates/` klasörü uygulama dışında, kullanıcı tarafından düzenlenebilir Markdown şablonlarının kaynağıdır.
- `Kaiwen/branding/logos/` şirketin çoklu logo varyantlarının kaynağıdır (ör. siyah/beyaz PNG, SVG, WebP). Logo dosyaları **mevcut değilse hiçbirini uydurma veya placeholder'ı gerçek logo gibi göstermeye çalışma**.
- Bu repo kendi kodunu, dahili varsayılan şablonlarını, testlerini ve CI/CD'sini sürümler. **Kullanıcının şirket genelindeki özel Markdown dosyalarını otomatik olarak public repo içine kopyalama veya push etme.**
- Mevcut kullanıcı projelerinin Git dizinlerine dokunma. Starter'ın oluşturduğu projeler bağımsızdır. **GitHub repo oluştur seçiliyse Git init, commit ve push zorunlu akışın parçasıdır**; GitHub seçili değilse yalnızca yerel Git init isteğe bağlı olsun.
- Public GitHub repo zaten kullanıcı tarafından açıldıysa `git remote -v` ile doğrula. Yoksa **repo oluşturduğunu veya push yaptığını iddia etme**. Çalışan yerel uygulamayı tamamla ve eksik remote adımını raporla.

## 2. Teknoloji ve kod standartları

- Electron + React + TypeScript (**strict**) + Vite / electron-vite.
- Yalnızca gerekli, sürdürülen bağımlılıkları ekle. Aşırı büyük UI kitleri veya gereksiz state/database framework'leri ekleme.
- React bileşenlerini küçük ve odaklı tut; domain mantığını ve dosya sistemi işlemlerini renderer'dan ayır.
- Electron **main / preload / renderer** ayrımını uygula.
- `contextIsolation: true`, `nodeIntegration: false`, sandbox, dar kapsamlı typed IPC, IPC sender doğrulaması ve uygun CSP kullan. Renderer'a genel `fs` veya `child_process` yetkisi verme.
- Çevrimdışı çalışabilsin; kullanıcı hesabı, sunucu, analytics veya telemetry ekleme.
- Ayarlar için küçük, sürümlenmiş bir JSON dosyası yeterli; veritabanı kurma. Güvenli okuma/yazma, varsayılanlara dönüş ve bozuk JSON kurtarma yaklaşımı yaz.
- Platforma özgü işlemleri adapter/service arayüzleriyle test edilebilir kıl.
- Kod kalitesi: ESLint, Prettier, TypeScript typecheck, Vitest, kritik akışlar için entegrasyon testi.
- İyi hata mesajları, gereksiz log üretmeme, düşük açılış gecikmesi ve hafif UI. Önce doğruluk; optimizasyonu ölçümle yap.

## 3. Varsayılan yerel klasör yapısı

İlk çalıştırmada kullanıcıdan **Kaiwen kök klasörünü** seçmesini iste; mevcut klasörü kullan veya yeni konum seçimine izin ver. Kök varsayılanı Masaüstü `Kaiwen/` olabilir; **masaüstü yolunu hardcode etme**, Windows redirected/OneDrive Desktop olasılığına dikkat et.

Varsayılan kategori → proje dizini eşleşmeleri:

| Kategori | Kök altındaki göreli dizin | Şablon profili |
|---|---|---|
| Mobile | `apps/mobile` | `mobile` |
| Web | `apps/web` | `web` |
| Desktop | `apps/desktop` | `desktop` |
| Cross-platform | `apps/cross-platform` | `cross-platform` |
| Library / SDK | `packages` | `library` |
| Service / API | `services` | `service` |
| AI / Speech | `kaiwen-ai/speech` | `ai-speech` |
| AI / Language | `kaiwen-ai/language` | `ai-language` |
| AI / Vision | `kaiwen-ai/vision` | `ai-vision` |
| Client Project | `clients` | kullanıcı seçimi / `common` |

Kategorileri kullanıcı ayarlardan yeniden adlandırabilsin, kategori ekleyip devre dışı bırakabilsin, her biri için hedef göreli klasörü ve şablon profilini değiştirebilsin. Kategori kimliği (ID) görünen addan bağımsız ve kararlı olsun.

**Ayar değişikliği var olan projeleri taşımasın.** Yeni proje oluştururken güncel ayarları kullan. Hedef konumu son onay ekranında/ana ekranda göster. Dizin haritalamasını yalnızca ayarlanan çalışma alanı köküne göre yap; kullanıcı ayrıca açıkça seçmedikçe kök dışına dosya yazma.

## 4. Arayüz — minimal OpenAI esintili, Kaiwen kimlikli

### Ana ekran — arama odaklı, sidebar kapalı

İlk ekranda yalnızca şunlar görünmeli:

1. Üst kısımda küçük Kaiwen logosu / ad, sağda **Ayarlar** simgesi. **Varsayılan olarak sidebar yok / kapalı**.
2. Büyük ama sade bir **Proje ara…** alanı, açıldığında odak aramada.
3. Altında en son açılan birkaç proje; aramaya yazdıkça anlık filtrelenen sonuçlar.
4. Tek belirgin alt/sağ eylem: **+ Yeni Proje**.

**Klavyeyle hızlı akış:** `Ctrl+K` arama kutusuna odaklanır, `↑/↓` sonuç seçer, `Enter` vurgulanan ilk/aktif projeyi VS Code'da açar, `Esc` aramayı temizler. Boş listede Enter hiçbir yanlış dosyayı açmasın. Fare ile çift tıklama veya açık bir "VS Code'da Aç" eylemi de desteklensin.

**Yeni Proje görünümü** (ayrı sade ekran/dialog; ana aramayı kalabalıklaştırma):
1. **Proje adı** — tek giriş alanı.
2. **Proje türü** — sade dropdown.
3. **Proje belgeleri** — otomatik seçimler, gerektiğinde açılan bölüm.
4. **Özel Markdown ekle** — çoklu dosya seçme/drag-and-drop ve yeni `.md` yazma.
5. **Include Kaiwen logos** — tek toggle; açıkken mevcut marka varyantlarını projeye dahil eder; varsayılan **kapalı** (ayarlar kısmından değiştirilebilir).
6. **Hedef klasör önizlemesi**.
7. **GitHub reposu oluştur** toggle: varsayılan **kapalı**. Açıldığında yalnızca **Private / Public** seçenekleri görünsün (Private varsayılan). **Ayrı bir repo adı girdisi veya proje ekranında owner seçimi olmasın.** Repo adı, yukarıda girilmiş proje adından üretilen güvenli klasör slug'ıyla **birebir aynı** olsun; read-only küçük bir özet/önizlemede gösterilebilir. GitHub owner olarak yetkilendirilmiş varsayılan hesap kullanılsın; gerekirse hesap/organizasyon seçimi yalnızca Ayarlar > GitHub altında yapılsın. Hesap bağlanmamışsa oraya yönlendir.
8. Tek ana CTA: **Projeyi Oluştur**; GitHub toggle açıksa aynı tıklamada GitHub + yerel proje + ilk push gerçekleştirilir.

Hazır şablon listesinde her `.md` belge için checkbox, kaynak/profil etiketi ve **Görüntüle / Düzenle** imkânı olmalı. Belgeyi çıkarıp başka özel `.md` eklemek tek işlem olmalı.

Belge editörü başta basit olsun: Markdown textarea + güvenli önizleme; karmaşık rich text/CodeMirror/Monaco IDE kurma. Önizlemede gömülü HTML/script çalıştırma, XSS'i engelle.

### Project Launcher — keşif, indeksleme ve VS Code

- Yeni oluşturulan projeleri otomatik yerel kataloğa ekle. Mevcut projeler (Starter ile oluşturulmamış Git repoları dahil) için kategori hedef dizinleri altında **sınırlı, iptal edilebilir ve arka planda keşif/tarama** yap; ilk açılışta tek tek tüm dosyaları okumaya çalışma.
- Öncelikle proje dizinleri ve `.kaiwen/project.json`, varsa `.git`/`README.md` gibi hafif ipuçlarına bak. `node_modules`, `.git` içeriği, `dist`, `build`, `.venv`, checkpoint/dataset/asset dizinlerine girme; tarama derinliği ve sayısını sınırla. Junction/symlink döngüsü ve klasör yetki hatalarını yönet.
- Proje kayıtlarını (ad, gerçek yol, kategori, son açılma zamanı) kullanıcı verisi alanında yerel JSON olarak önbelleğe al. Uygulama açılırken **cache'i önce göster**, gerekirse arkada güncelle. `Projeleri Yenile`, `Manuel Proje Ekle`, `Listeden Kaldır` eylemleri ayarlar altında olsun; kaldırma asla gerçek klasörü silmesin.
- Arama isim ve klasör yolunda Türkçe karakterleri desteklesin; önce tam/prefix eşleşme, sonra kısmi eşleşme, ardından son açılma sırasını değerlendir. Tuş başına disk taraması yok; sonuçlar bellekteki indeksle anlık hesaplanmalı.
- Windows'ta VS Code başlatma: `code` CLI veya kullanıcı ayarlarında seçilmiş güvenilir editör yürütülebilir dosyasıyla **argüman dizisi** kullan (shell string birleştirip çalıştırma); hedef klasörü güvenli biçimde geçir. `code --new-window <path>` ve istenirse `--reuse-window` modunu destekle. PATH'te yoksa VS Code'un konumunu seçtirebil / anlaşılır hata sun. Proje kaydı veya dosyalar açılış başarısız diye silinmesin.
- Yol bulunamazsa "Proje taşınmış/silinmiş" durumunu göster, yeniden konumlandırmayı teklif et; kullanıcının diskini sessizce arama. Çoklu kök/dışarıda proje desteklemek için manuel ekleme yeterli; yeni proje oluşturma kuralını değiştirme.
- Sidebar, ağır proje önizlemesi, Git activity feed, görev takibi, global arka plan daemon'u veya VS Code extension'ı V1'e ekleme.

### Tema

- Açık, koyu ve sistem teması; sistem modu varsayılan.
- **Tek merkezden tasarım token'ları:** CSS custom properties (`--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-accent`, `--radius-*`, `--spacing-*` vb.).
- Tüm bileşenler ortak token'lardan beslensin; sayfalara dağılmış sabit renk kodları olmasın.
- Tipografi sistem fontu veya paketlenmiş ve lisansı uygun font. İnternetten zorunlu font çekme.
- Açık/koyu temada kontrast, keyboard focus, disabled/hata durumları; reduced-motion desteği.
- UI'da tutarlı input, button, checkbox, dialog ve typography bileşenleri. Gösterişçi animasyon yok.

### Splash

- `Kaiwen/branding/logos/` altındaki seçilmiş logo varyantını (tema ile uyumlu açık/koyu) güvenli şekilde uygulama splash'inde kullan; yoksa şık yerleşik fallback göster. Dosya adını `logo.png` diye sabitleme.
- Hafif fade/float hareketi olabilir; **uygulamayı bekletmek için yapay süre ekleme**. İlk pencere hazır olduğunda kaybolsun.
- Tema ve reduced-motion ile uyumlu olsun.
- Uygulama paketlendiğinde dışarıdaki marka dosyası bulunmayabilir; bu durumda fallback sorunsuz çalışsın.

## 5. Ayarlar ekranı

Tek sayfada sade gruplar; karmaşık sekme labirenti oluşturma:

### Çalışma alanı
- Kaiwen kök dizini: göster, Explorer üzerinden seç, kaydet.
- Seçilen konumun varlığını ve yazılabilirliğini kontrol et.
- `branding/logos/` klasörü konumunu ve bulunan varyantları göster; gerektiğinde farklı marka varlıkları klasörü seçtir. Birden çok logo / tema varyantını destekle.

### Kategoriler / hedef yollar
- Kategori listesi: görünen ad, hedef göreli klasör, şablon profili.
- Yeni kategori ekleme; ad ve yol değiştirme; eski projeleri taşımama.
- Geçersiz dizinleri ve Windows'ta sorunlu klasör adlarını reddet.

### Şablon yönetimi
- `Kaiwen/templates/common`, `mobile`, `web`, `desktop`, `cross-platform`, `library`, `service`, `ai-speech`, `ai-language`, `ai-vision`, `custom` klasörlerini tarayabilsin.
- Her kategoriye varsayılan seçili şablonları ayarlamaya izin ver.
- Kaynak Markdown'ı görüntüle, düzenle ve açık bir **Kaydet** eylemiyle şablon kütüphanesine yaz.
- Projeye eklemeden önce yalnızca o proje için içerik değiştirilebilsin; kaynak şablon sessizce değişmesin.
- Kendi `.md` dosyalarını `custom` kütüphanesine ekleyebil; dosya yedeği/çakışma davranışı belli olsun.
- Şablon bulunmadığında uygulama çökmesin; okunabilir bir durum göster.

### Başlangıç ve proje açma
- **Windows oturum açıldığında başlat:** toggle, varsayılan **kapalı**. Kullanıcı açarsa Windows packaged app üzerinde Electron `app.setLoginItemSettings` ile uygula; ayar ve OS gerçek durumunu `app.getLoginItemSettings` ile tutarlı göster. Dev ortamında kendiliğinden startup kaydı oluşturma.
- Startup'ta normal **küçük, aramaya odaklı pencereyi aç**; gizli tray daemon'u, otomatik VS Code açma, otomatik proje seçimi yok.
- Editör: varsayılan VS Code; editor yolu, **yeni pencere / mevcut pencereyi kullan** tercihi. Desteklenmeyen editörleri listede çalışıyor gibi gösterme.
- Proje kataloğunu yeniden tara, elle proje ekle, kaydı kaldır (fiziksel klasörü asla silme). Kategori klasör yolları değiştiğinde yeni klasörleri tarayabilsin, önceki manuel kayıtları korusun.

### GitHub entegrasyonu
- Bir defalık bağlantı için **resmi GitHub CLI (`gh`)** kullan. `gh auth status` ile durum denetle; kullanıcıyı gerekirse `gh auth login` akışına yönlendir. Token/parola toplayan özel bir React giriş formu yazma ve kimlik bilgilerini uygulama JSON'una saklama. Kurum hesapları için yetki ve uygun sahipliği göster.
- Proje oluşturma ekranında **GitHub reposu oluştur** toggle'ı bulunmalı. Varsayılan olarak kapalı olsun; kullanıcı açabilsin, tercihini ayarlardan değiştirebilsin. GitHub kullanılmıyorsa yerel proje oluşturma mümkün olmalı.
- **Tek ad kaynağı:** Proje adı hem yerel klasör hem GitHub repository adı için aynı normalize edilmiş slug'a dönüştürülür (örn. `Kaiwen Notes` → `kaiwen-notes/` ve `owner/kaiwen-notes`). Repo adını ayrıca soran/düzenleten bir alan **yapma**; önizleme salt okunur olabilir. Aynı adla repo açılamazsa hiçbir başka ad deneme, hata göster ve proje adını değiştirmesini öner. Repo sahibi, bağlı GitHub hesabından alınır; organizasyon tercihi gerekirse Ayarlar altında. Toggle açıkken **yalnızca Private (varsayılan) / Public** görünür, kapalıyken ikisi de gizlenir. Public seçeneğinin özel belge, logo ve kuralların dışarı açılması anlamına geldiğini belirt.
- Yeni oluşturulan repoya mevcut dosyaları **ilk commit ve `main` push** ile göndermek GitHub toggle açıkken otomatik ve zorunlu. Ancak **otomatik release/deploy kapalı**.
- `gh` eksik, kimlik doğrulama yok veya izin hatası varsa anlaşılır hata ve kurulum/binding adımları sun. GitHub'a bağlanmadan önce yeni proje için geçerli Git ayarlarını (`user.name`, `user.email`) kontrol et.
- Başarı ekranında GitHub repo bağlantısını, ilk commit SHA'sını ve push durumunu göster.

### Oluşturma tercihleri
- Oluşturulduktan sonra VS Code'da aç: **varsayılan açık**.
- Başlangıç promptunu panoya kopyala: **varsayılan açık**.
- Yeni proje için GitHub repo oluştur: **varsayılan kapalı**. Toggle açıkken Private/Public görünür (varsayılan **Private**); toggle kapalıyken bu seçenekler gizlenir. GitHub devre dışıysa tek başına Git init seçeneği **varsayılan kapalı**. Repo sahibi ve GitHub bağlantısı Ayarlar bölümünden yönetilebilir.
- **Yeni projeye şirket logolarını ekle (Include logos): varsayılan kapalı**. Proje oluşturma görünümünde tek toggle ile override edilebilsin.
- Tema ve (varsa) splash hareketi.
- Ayarlar atomik ve kalıcı kaydedilsin.

## 6. Şablon seçimi ve birleşim kuralları

- Varsayılan olarak `common` temel belgeleri ve kategoriye özel belgeleri seç.
- Kullanıcı her belgeyi **tek tek kaldırabilsin**, yeni belge ekleyebilsin ve seçilen dosyaları önizleyebilsin.
- Çoklu yerel Markdown içe aktarma desteklensin. Kaynak dosyalar **taşınmasın**, projeye kopyalansın.
- Aynı adda `common/PERFORMANCE.md` ve `mobile/PERFORMANCE.md` varsa ikisi de korunabilsin; hedef klasörler farklı olsun.
- Aynı hedef klasör içinde dosya çakışması varsa **sessizce üzerine yazma**; seçim ekranında çözüm iste veya güvenli şekilde farklı isim öner.
- Seçilen şablonlar proje oluşturulurken **snapshot** olarak kopyalansın. Global şablon sonradan değişince eski projeler otomatik değişmesin.
- Kopyalanan belge kökenini ve mümkünse hash/sürüm bilgisini `.kaiwen/project.json` içinde tut.
- Şablonların `TODO` işaretli taslaklar olabileceğini unutma; bunları tamamlanmış şirket politikası olarak tanımlama.


## 6A. Branding / logo varlıkları (çoklu varyant)

- Kaynak `Kaiwen/branding/logos/`; örneğin `kaiwen-black.png`, `kaiwen-white.png`, ileride yeni `.png`, `.svg`, `.webp` varyantları olabilir. İsimlerini ve toplam sayısını hardcode etme.
- "Include logos" açıkken **yalnız kaynakta gerçekten bulunan desteklenen görsel dosyalarını** yeni proje içinde `branding/logos/` altına **kopyala**. Kaynakları taşıma, silme, optimize edip bozma; aynı ad/kopya çakışmasında güvenli hata ver.
- Kaynakta logo yoksa seçeneğin yanında bilgi göster; boş bir logo üretme ve başarılı kopyalandı iddiasında bulunma. Proje oluşturma bu nedenle başarısız olmak zorunda değil; durumu açıkça raporla.
- Sadece gerçekten kopyalanan varlıkları `.kaiwen/project.json` `assets` alanına kaydet. `README.md` içinde marka klasörüne kısa açıklama eklemek mümkün.
- Uygulamanın kendi fallback splash görseli kaynak repoda olabilir. **Şirketin gerçek/özel logolarını public Starter reposuna otomatik dahil etme.** Kamuya açık projelere marka logolarının dahil edilmesi ancak toggle açıkken olsun.
- Güvenlik: path traversal'ı önle; desteklenmeyen dosyaları reddet; uzantıyla yetinmeyip mümkünse içerik/tür sınırlarını doğrula; SVG'leri React tarafında kontrolsüz inline HTML olarak çalıştırma. Boyut sınırı ve okunamayan dosya hatası uygula.

## 7. Tek tıkla proje oluşturma işlemi

Örnek: `Kaiwen Notes` adlı mobil proje:

```text
Kaiwen/apps/mobile/kaiwen-notes/
├── README.md
├── AGENTS.md
├── .gitignore
├── branding/                  # Include logos açık ise
│   └── logos/                # Mevcut logo varyantları
├── docs/
│   ├── START_PROMPT.md
│   ├── standards/
│   │   ├── common/
│   │   │   ├── ENGINEERING.md
│   │   │   ├── SECURITY.md
│   │   │   └── TESTING.md
│   │   └── mobile/
│   │       ├── DESIGN.md
│   │       ├── PERFORMANCE.md
│   │       └── PLATFORM.md
│   ├── custom/
│   │   ├── PROJECT_PLAN.md
│   │   └── [kullanıcının ekledikleri].md
│   └── decisions/
│       └── README.md
└── .kaiwen/
    └── project.json
```

Bu ağaç **örnek**: gerçekte yalnız seçilen Markdown'lar üretilsin. Başka proje türünde doğru kategori dizinleri ve belgeler kullanılsın.

Tek düğmeye basınca:
1. Adı doğrula, Türkçe karakterleri güvenli slug'a dönüştür, boş ad / Windows ayrılmış adlar / geçersiz karakterler / `..` gibi traversal girişimlerini reddet.
2. Hedef klasörü hesapla; resolve/realpath, symlink/junction olasılığı ve kök sınırını kontrol et. Kullanıcıya hedefi göster.
3. Çakışma varsa mevcut proje klasörünü **silme veya üzerine yazma**; hata/yeniden adlandırma çözümü göster. **Yeni GitHub reposu seçiliyse, uzak repo oluşturulmadan hedef proje klasörü veya geçici proje klasörü oluşturma.**
4. Ön kontrollerden sonra GitHub entegrasyonu seçiliyse **önce uzak repoyu oluştur**. Aynı isimde repo varsa, yetki yoksa veya GitHub repo oluşturma başarısızsa: **işlemi durdur, hedef proje klasörü/dosya üretme, hiçbir kullanıcı dosyasını değiştirme.** Çakışan repo adına yeniden adlandırma öner; mevcut repoyu otomatik kullanma veya üzerine push etme.
5. Uzak repo gerçekten oluşturulduktan sonra geçici çalışma klasöründe dosyaları üret, kontrol et ve hedefe güvenli şekilde taşı; başarısızlıkta yarım proje bırakma. Yarış durumlarını da düşün. Uzak repo oluşturulduysa ve sonraki adım başarısızsa onu **otomatik silme**; kurtarma/yeniden deneme göster.
6. Seçili standartları `docs/standards/<kaynak>/` içine, özel belgeleri `docs/custom/` içine kaydet; "Include logos" açıksa var olan desteklenen logoları `branding/logos/` altına kopyala.
7. `docs/decisions/README.md` oluştur: ADR'nin amacı, ne zaman kaydedileceği ve örnek dosya adı `0001-...md` açıklansın; sahte ADR oluşturma.
8. `README.md`: proje adı, türü, kısa açıklama, kuruluma başlanacak yer.
9. **Dinamik `AGENTS.md`**: proje tipi, bütün gerçekten oluşturulan `.md` yolları, görev başında ilgili belgelerin okunması, varsa çelişkilerin bildirilmesi, test ve Git kuralları. **Seçilmemiş** belgelere referans verme.
10. `docs/START_PROMPT.md`: Codex için kısa, projenin türüne ve seçili belgelere uyarlanmış başlangıç komutu; ayrıca panoya kopyalanabilsin.
11. `.kaiwen/project.json`: şema sürümü, kategori ID, proje slug, belge listesi, kaynak yolu/şablon kimliği/hash, oluşturma zamanı; gizli bilgi içermesin.
12. **GitHub seçiliyse** `git init -b main` yap, güvenli dosyaları `git add`, `git commit -m "chore: initialize project"`, GitHub tarafından dönen repoyu `origin` olarak bağla ve `git push -u origin main` yap. **GitHub seçili değilse** yalnız tercih edildiğinde yerel `git init` yap. Ardından VS Code'da aç ve başlangıç promptunu kopyala.
13. Başarılı yeni projeyi yerel proje kataloğuna ekle; **Son projeler** listesinin başında görünsün.
14. Sonuç ekranında gerçek oluşturulan yolu, belge ve kopyalanmış logo sayısını, varsa GitHub URL/commit/push durumunu ve **Klasörü Göster / VS Code'da Aç / Promptu Kopyala** aksiyonlarını göster. Push başarısızsa "tamamlandı" iddiasında bulunma; **Push'u Tekrar Dene** seçeneği sun.

`AGENTS.md` ile bağlantısı verilen belgelerin Codex tarafından her zaman kendiliğinden okunacağını varsayma; giriş promptunda ilgili dosyaların gerçekten açılması gerektiğini açıkça yaz.

## 7B. GitHub repo yaratma — güvenli ve tekrar denenebilir işlem sözleşmesi

Kullanıcının özellikle istediği garanti: **Repo zaten mevcutsa veya yeni repo oluşturma GitHub tarafından reddedilirse yeni yerel proje klasörü/dosyaları oluşturulmayacak.** Bunu uygulama tarafında UI mesajına güvenerek değil, main-process hizmet katmanında test edilebilir bir durum makinesiyle uygula.

Önerilen durumlar:

`VALIDATING → CREATING_REMOTE → CREATING_LOCAL → INITIAL_COMMIT → PUSHING → COMPLETED`

Hata durumları `REMOTE_FAILED` (yerel klasör **yok**), `LOCAL_FAILED_AFTER_REMOTE` (uzak repo var, güvenli kurtarma gerekir), `PUSH_FAILED` (yerel commit ve uzak repo var, tekrar push gerekir).

1. **Doğrula:** kategori, proje adından otomatik türetilen ortak yerel klasör/repo slug'ı, görünürlük, hedef yol, dosya izinleri, tüm şablon kaynakları, boyutlar, Git/`gh` kurulumu ve auth durumu. Gizli anahtarların/özel içeriklerin public repo içinde kazara gönderilmesini engelleyecek kontrol ekle. Repo varlığını önceden sorgulamak iyi UX sağlar fakat kesin karar **oluşturma çağrısının sonucu** olmalı; iki işlem arasında yarış olabilir.
2. **Uzağı önce yarat:** Electron main process'te güvenli `spawn` + argüman dizisiyle `gh repo create OWNER/REPO --private` veya `--public` çalıştır. `--clone`, `--source`, `--push`, `--add-readme` kullanma; repo bu noktada boş oluşturulur. Terminalde GitHub hesabının bir defa `gh auth login` ile oturum açması gerekir. Repo sahibi organizasyonsa uygun izinlerini kontrol et. Kullanıcıya net hata nedenini göster.
3. **Repo oluşturma başarısızsa hiçbir yerel proje kurma.** Mevcut uzak repoya push, var olan klasörü silme, otomatik alternatif isim kullanma veya isim çakışmasında üstüne yazma yasak.
4. **Yereli oluştur:** Uzak repo başarılıysa proje dosyalarını geçici staging alanında hazırla; güvenli şekilde kesin hedefe taşı. `git init -b main`, `git add`, `git commit`, `git remote add origin <returned HTTPS remote>`, `git push -u origin main` uygula. Repo sahibini/URL'yi kullanıcı girdisinden körlemesine üretme; başarılı CLI sonucunu doğrula. Alt süreçler shell string interpolation kullanmasın, timeout ve hata kodu ayrıştırması olsun. Git erişim bilgilerini hiçbir loga yazma.
5. **Kurtarma:** Uzak repo başarıyla açılıp dosya yazımı, commit veya push başarısız olursa uzaktaki repoyu **otomatik silme**. Uygulamanın kullanıcı-veri dizininde gizli olmayan işlem kimliği ve repo URL'siyle operasyon durumunu kaydet. Kullanıcıya "Tekrar dene / GitHub'da aç / Kaldığı yerden devam et" seçenekleri göster. Yeniden deneme **ikinci GitHub reposu açmasın**, mevcut repo sadece **bu oluşturma işleminin kaydedilmiş kimliğiyle eşleşiyorsa** devam edebilsin; rastgele aynı isimli mevcut repo devralınmasın.
6. **Başarılı ilk push:** `main` dalındaki ilk commit GitHub'a ulaşınca başarı göster; oluşturulmuş projenin lokal kataloğunu güncelle, istenirse VS Code'da aç ve başlangıç promptunu kopyala. Repo içinde uygun başlangıç CI dosyaları varsa push onları tetikleyebilir; CI sonucu başka bir adımdır. Otomatik GitHub Release veya deploy yok.
7. **Public güvenliği:** Kullanıcının `custom/*.md`, şirket logoları, `AGENTS.md` içeriği public repoya gideceği için Public seçiminin etkisini göster. `.env`, API anahtarı, şifre veya kullanıcı veri dizinleri asla commit'e girmemeli; uygun `.gitignore` ve pre-push kontrolleri uygulansın.
8. **GitHub bağlantısı kullanılmıyorsa:** GitHub yokken de eski tek tuş yerel scaffold akışı çalışmalı. Git init bağımsız isteğe bağlıdır; GitHub operasyonunu taklit eden sahte başarılı durum gösterme.

CLI örneği (**uygulama içinde doğrudan PowerShell script çalıştırma zorunlu değil**):

```powershell
# GitHub'da bir kez oturum aç:
gh auth login

# Yalnız yeni ve boş uzak repo: (yerel proje henüz yaratılmamış olabilir)
gh repo create OWNER/kaiwen-notes --private

# Sadece uzak repo gerçekten oluşturulduktan sonra yerel klasörde:
git init -b main
git add .
git commit -m "chore: initialize project"
git remote add origin https://github.com/OWNER/kaiwen-notes.git
git push -u origin main
```

Yukarıdaki OWNER örnektir, uygulama gerçek yetkilendirilmiş kullanıcı veya organizasyonu kullanmalı. CLI kullanımı için resmi belgeleri esas al: `https://cli.github.com/manual/gh_repo_create`.

## 8. Örnek Codex başlangıç promptu davranışı

```text
Bu projenin AGENTS.md dosyasını oku. Özellikle aşağıdaki
mevcut belgeleri aç: [uygulamanın oluşturduğu gerçek yollar].
Projenin amacını, işlevsel gereksinimlerini ve kısıtlarını belirle.
Birbiriyle çelişen kurallar veya doldurulmamış TODO alanları varsa bildir.
Kısa uygulanabilir bir geliştirme sırası oluştur, ardından ilk
çalışan ve test edilebilir aşamayı geliştir. Test sonuçlarını raporla.
Mevcut dosyaları gereksiz yere silme; bu proje için özel yetki
verilmedikçe git push veya release yapma.
```

## 9. Performans ve güvenilirlik hedefleri

- Ana ekran mümkün olduğunca çabuk kullanılabilir olsun; bilinçli uzun splash beklemesi olmasın. Paketlenmiş Windows build'inde soğuk açılış ve aranabilir hale gelme süresini ölç, hedef olarak birkaç saniyeyi aşmamayı amaçla; ölçülmemiş kesin süre vaat etme.
- Arama **önbellekteki indeks** üzerinde çalışmalı; tipik birkaç yüz proje için tuştan liste güncellemesine hedef <100 ms, farklı donanımda gerçek benchmark sonucu raporlanmalı.
- Açılışta bütün repoları yeniden indeksleme zorunluluğu yaratma; cached-first, deferred scan.
- Dizin taraması ve dosya yazımı React render döngüsünü bloke etmesin.
- Büyük `.md` dosyaları seçildiğinde makul boyut sınırı/hata mesajı uygula.
- Dosya sistemi işlemlerini tek bir test edilebilir `projectCreationService` altında topla.
- Tema değişiminde gereksiz re-render ve beyaz flaş üretmemeye çalış.
- Hata durumlarını (izin reddi, yok dizin, bozuk şablon, çakışma, VS Code bulunamadı) ayrı ele al.
- Kayıtları yerel ve minimal tut, kişisel dosya içeriklerini loglara dökme.
- Önce doğru/kararlı çalışmayı sağla; ölçülmeyen performans iddiaları yazma.

## 10. Test kapsamı (zorunlu)

**Unit:**
- Unicode/Türkçe slug dönüşümü ve Windows dosya adı kuralları.
- Kategori → yol / şablon eşleştirmesi.
- Ortak + kategori şablonlarının varsayılan seçimi, kaldırılması, tekrar eklenmesi.
- Aynı adlı farklı kaynak dosyalarının çakışmadan çıktı konumuna dağıtılması.
- `AGENTS.md` ve başlangıç promptunda yalnız gerçekten seçilen dosyaların listelenmesi.
- Tema token'ları ve ayarların okuma/yazma/bozulma toparlama davranışı.
- Arama sıralaması, Türkçe isimler, kısmi eşleşme, klavye seçimi, Enter davranışı ve son proje sıralaması.
- "Include logos" kapalı/açık ve birden çok varyant, eksik kaynak, dosya boyutu ve hedef klasör davranışı.
- Startup ayarının OS ile senkronizasyonu; development build'in kendini otomatik başlangıca eklememesi.

**Integration / smoke:**
- Geçici bir test kökünde mobil + desktop + library projelerinin uçtan uca oluşturulması.
- Çoklu özel Markdown içe aktarımı, içerik kopyalama, kaynak dosyanın korunması.
- Aynı proje adıyla yeniden oluşturma denemesinde mevcut verinin korunması.
- Path traversal, symlink/junction ve izin hatası senaryoları (uygulanabilenler).
- Başarısız yazım sonrası yarım klasör/bozuk dosya kalmaması.
- VS Code bulunamaması durumunda projenin yine başarıyla oluşturulması ve doğru uyarı verilmesi.
- Electron IPC'ye yetkisiz/bozuk istek geldiğinde kontrollü ret.
- Mevcut manuel Git reposunun keşfi, indeks önbelleği, silinmiş/taşınmış klasör durumları ve ağır klasörlerden kaçınan tarama.
- Arama sonucundan proje açma, VS Code yolu boş/yanlışsa anlaşılır hata; `Enter` yanlış projeye gitmemeli.
- Logo açıkken siyah/beyaz varyantların dosya içeriğinin değiştirilmeden kopyalanması, kapalıyken branding klasörünün oluşturulmaması.
- Mock `gh` kullanılarak **repo adı çakışması, 403 yetki hatası, kimlik doğrulama hatası ve uzak repo oluşturma reddi** durumunda hedef proje klasörünün **hiç oluşmaması**.
- Uzak repo oluşturulup yerel dosya/commit/push başarısız olunca durum kaydının ve "Tekrar Dene" akışının doğru olması; ikinci repo oluşturulmaması; başka bir mevcut repo üzerine push yapılmaması.
- GitHub toggle kapalıyken görünürlük seçeneğinin gizlenmesi; açıkken Private/Public seçimi, GitHub repo adının yerel klasör slug'ıyla zorunlu eşitliği (ayrı isim alanının bulunmaması), varsayılan owner hesabının kullanılması, ilk commit'in `main` dalında olması ve ilk push doğrulaması. Testlerde gerçek GitHub reposu oluşturma zorunluluğu yok; CLI adapter mock/test doubles kullan.
- GitHub seçeneği kapalıyken tamamen çevrimdışı yerel proje oluşturmanın çalışması.

Yerelde şu komutların tamamı çalışır olmalı:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Windows installer/package işlemi için ayrı `npm run dist:win` komutu oluştur. CI ortamında unsigned installer üretimi ve olası Windows SmartScreen uyarısını README'de açıkla; imzalı uygulama gibi sunma.

## 11. GitHub Actions / yayın düzeni

Bağımsız uygulama reposunda en az şunları oluştur:

```text
.github/workflows/ci.yml
.github/workflows/release.yml
.gitignore
.editorconfig
README.md
AGENTS.md
docs/ARCHITECTURE.md
docs/DEVELOPMENT.md
```

### CI (`ci.yml`)
- `push` ve `pull_request` olaylarında çalışsın.
- `npm ci`, ESLint, typecheck, test ve build çalıştırsın.
- Windows paketleme için mümkünse ayrı Windows runner/job ekle; maliyeti ve gereksiz tekrarları düşük tut.
- GitHub Actions'ı `npm` lockfile ile sabit ve tekrarlanabilir çalıştır.
- Başarısız testte başarılı CI izlenimi verme.
- Cache, izinler ve action sürümlerini güncel ve minimum gerekli kapsamda tut.

### Release (`release.yml`)
- Yalnızca **manuel tetikleme** (`workflow_dispatch`) veya açıkça onaylanmış sürüm etiketi üzerinden yayın.
- Önce kalite kontrolleri, ardından Windows paketleme.
- Başarılı çıktıları GitHub Actions artifact olarak sakla.
- Yayın yetkisi varsa ve kullanıcı bilinçli tetiklediyse GitHub Release oluştur/ekle; push olur olmaz otomatik prod release yapma.
- Sürüm notları ve bilinen kısıtlar dahil edilsin.
- Kod imzalama kimliği yoksa imzasız build olduğunu belirt.

### İlk push davranışı
- Kullanıcı **bu uygulama projesinin** public GitHub reposunu oluşturup `origin` tanımlamış olacak.
- Uygulama tamamlanınca önce bütün yerel testleri ve production build'i çalıştır.
- Başarılıysa değişiklikleri yalnız **bu projenin Git reposunda** commit et ve tanımlı `origin`'e push et. Bu talimat, **bu uygulama kodunun ilk push'u için açık yetkidir**.
- Git remote yanlış/eksikse, kimlik doğrulama yoksa veya testler başarısızsa zorla push yapma. Yapılamayan adımı raporla.
- GitHub'daki CI durumunu gerçekten doğrulayabiliyorsan kontrol et; doğrulayamıyorsan sadece yerel test sonuçlarını söyle. **Otomatik GitHub Release oluşturma; manuel onay bekle.**
- **Asla** `Kaiwen/` altındaki başka projeleri veya `Kaiwen/templates/` kişisel içeriklerini bu public repoya dahil etme.

## 12. README ve teslimat

README Türkçe olsun. Şunları anlat:
- Gereksinimler (desteklenen Node.js / Windows sürümleri), kurulum ve ilk çalıştırma.
- `npm run dev`, test, lint, typecheck, build, Windows installer.
- Şirket kök klasörünü seçme, kategori yolu değiştirme, şablon ekleme/düzenleme.
- Proje kataloğu keşfi, arama kısayolları, son projeler, VS Code editör seçimi ve Windows başlangıcında açılma ayarı.
- Logo varyantlarını `Kaiwen/branding/logos/` altına yerleştirme ve Include logos seçeneği.
- Proje üretme ve VS Code entegrasyonu.
- Yeni projede **GitHub repo oluştur → yerel dosyalar → initial commit → push** akışı; Public/Private seçimi; `gh auth login` ilk kurulum; repo adı çakışması ve push kurtarma işlemleri.
- Uygulama kodunun Git'i ile üretilen projelerin bağımsız Git'i arasındaki fark.
- İmzasız Windows uygulaması uyarısı ve güvenlik sınırları.
- Bilinen eksikler, yerel test ve CI sonuçlarını nasıl görüntüleyeceği.

## 13. Geliştirme sırası

1. Mevcut çalışma alanı, şablon dosyaları ve Git remote'u denetle.
2. Minimal Electron/React/TS iskeleti ve ortak tema token'larını kur; **arama + son projeler** ilk ekranını oluştur.
3. Ayar modeli + kategori haritalama + şablon yükleme/seçme geliştir.
4. Tek tıkla güvenli proje oluşturma motorunu, **GitHub repo önce oluşturulacak şekilde güvenli/tekrar denenebilir uzak repo + ilk push iş akışını** ve testlerini bitir.
5. Dinamik AGENTS / Codex promptu / VS Code işlemlerini, **proje kataloğu/arama/Enter ile açma** ve logo dahil etme akışını ekle.
6. Minimal ana ekran, yeni proje görünümü, ayarlar (startup/editor/branding dahil), Markdown düzenleyici ve splash arayüzünü tamamla.
7. Lint + typecheck + tests + build + mümkünse Windows installer'ı doğrula.
8. CI/CD ve dokümanları tamamla, public repo için gizli veri taraması yap.
9. Yalnız doğru remote bağlı ve testler başarılıysa commit/push yap; sonucu raporla.

**Öncelik:** Tek tıkla çalışan doğru ürün. Gereksiz animasyon, yeni altyapı katmanları, ikinci uygulama veya yönetim paneli ekleme.

## 14. Kabul kriterleri

- [ ] Açıldığında **arama kutusu + son projeler + Yeni Proje** içeren temiz ana ekran görünür; sidebar varsayılan olarak kapalıdır.
- [ ] Var olan projeler güvenli şekilde keşfedilebilir; `Ctrl+K`, ok tuşları ve `Enter` ile doğru proje VS Code'da açılır.
- [ ] İndeks cache'i ve geçersiz proje yolları yönetilir; tuş başına dosya taraması yapılmaz.
- [ ] Windows oturumunda başlangıç ayarı kullanıcı tarafından açılıp kapatılabilir; varsayılan kapalıdır.
- [ ] Kök dizin ve kategori konumu ayarlardan değiştirilebilir; kalıcıdır.
- [ ] Seçili genel + platform belgeleri listelenir, tek tek kaldırılabilir.
- [ ] Birden fazla özel Markdown dosyası eklenebilir / oluşturulabilir.
- [ ] `Kaiwen/branding/logos/` altındaki mevcut tüm desteklenen varyantlar isteğe bağlı olarak yeni projenin `branding/logos/` alanına kopyalanır; toggle varsayılan kapalıdır.
- [ ] Markdown kaynakları görüntülenebilir / düzenlenebilir / önizlenebilir.
- [ ] Proje oluşturma tek tuşta gerçek klasör ve içerikleri üretir.
- [ ] "GitHub reposu oluştur" seçiliyse **önce boş uzak repo oluşturulur**, isim çakışması/izin hatası varsa **hiç yerel proje klasörü oluşturulmaz**.
- [ ] Başarılı uzak repo sonrasında yerelde `main` ilk commit hazırlanır ve `origin`'e push edilir; tamamlanma gerçek push sonucuna bağlıdır.
- [ ] Push/local aşama başarısızsa uzak repo otomatik silinmez; güvenilir kaldığı yerden devam seçenekleri vardır ve ikinci repo oluşturulmaz.
- [ ] Repo adı ayrı girilmez; proje adından türetilen **aynı slug** klasörde ve GitHub reposunda kullanılır. GitHub toggle kapalıysa görünürlük seçenekleri gizlenir; açıksa Private/Public görünür ve Public için belge/logo görünürlüğü uyarısı vardır.
- [ ] GitHub kapalıysa yerel scaffold işlemi çevrimdışı çalışır.
- [ ] `docs/decisions/README.md`, dinamik `AGENTS.md`, prompt ve proje kaydı oluşur.
- [ ] Mevcut proje dosyaları korunur ve hatalar kontrollü yönetilir.
- [ ] VS Code isteğe bağlı açılır, prompt panoya kopyalanır.
- [ ] Açık/koyu/sistem tema ortak CSS token'larından yönetilir.
- [ ] Unit/integration testleri, build ve CI dosyaları bulunur.
- [ ] Başarılı yerel testlerden sonra **yalnız doğru public repo** için commit/push yapılır; release manuel kalır.

---

**Başlangıç komutu:** Bu Markdown dosyasını ve `Kaiwen/AGENTS.md` belgesini okuyarak uygulamayı üret. Eksik olan şablon içeriklerini uydurup tamamlanmış şirket standardı gibi sunma. Gereksiz onay döngüsü oluşturma; yetki ve Git sınırlarına uyarak işi uçtan uca bitir.
