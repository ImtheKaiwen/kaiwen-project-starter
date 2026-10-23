# Geliştirme

## Modüller

- `src/main/`: Electron yaşam döngüsü ve güvenli IPC
- `src/main/services/`: platform ve domain servisleri
- `src/preload/`: renderer'a açılan tek tipli köprü
- `src/renderer/`: React görünümleri ve merkezi tema
- `src/shared/`: Node bağımlılığı olmayan sözleşmeler, slug ve arama
- `tests/`: unit ve geçici dosya sisteminde integration testleri

## Komutlar

Temiz kurulumda `npm ci` kullanın. Değişiklikten önce ve sonra:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

Windows installer kontrolü için `npm run dist:win` çalıştırılır. Çıktı `release/` altındadır ve sertifika yoksa imzasızdır.

## Yeni IPC ekleme

1. `src/shared/contracts.ts` içine en dar istek/yanıt tipini ekleyin.
2. Preload'da yalnız bu çağrıyı expose edin.
3. Main handler'da sender ve bütün girdileri tekrar doğrulayın.
4. Renderer'a genel amaçlı dosya sistemi veya süreç çalıştırma yetkisi vermeyin.
5. Yetkisiz ve bozuk girdi testini ekleyin.

## Test yaklaşımı

Dosya sistemi testleri OS temp kökü kullanır ve kaynakları değiştirmez. GitHub senaryoları gerçek repo oluşturmayan `CommandRunner` test doubles üzerinden ad çakışması, auth/yetki ve sıra garantisini doğrular. Gerçek kullanıcı Git ve GitHub durumu yalnız uygulamada açık kullanıcı eylemiyle kullanılır.

## Git sınırı

Üst `Kaiwen/` klasörü repo değildir. Yalnız bu uygulama kendi bağımsız reposunu kullanır. `Kaiwen/templates/` ve dış marka dosyalarını uygulama reposuna eklemeyin. Test/build başarısızsa veya `origin` doğru public repo değilse push yapmayın.
