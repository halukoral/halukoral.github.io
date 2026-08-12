# Haluk Oral — Site Kaynak Projesi

Bu klasör artık düzenlenebilir bir statik site kaynak projesidir. Herhangi bir paket kurulumu gerekmez; yalnızca Node.js yeterlidir.

## İçerik düzenleme

- Ana sayfa: `src/pages/index.html`
- Cats sayfası: `src/pages/cats/index.html`
- FAB arşivi: `src/pages/fab/index.html`
- Yazılar: `src/pages/writing/`
- FAB yazıları: `src/pages/posts/`
- Ana tasarım: `src/styles/site.css`
- Ek sayfa stilleri: `src/styles/`
- Cats etkileşimi: `src/scripts/cats.js`
- Görseller: `assets/img/`

Kaynak HTML dosyaları çok satırlıdır ve doğrudan VS Code ile düzenlenebilir.

## Bilgisayarda önizleme

```powershell
npm run dev
```

Ardından `http://127.0.0.1:8000` adresini açın. Kaynak dosyalardaki değişiklikler otomatik olarak yeniden derlenir; tarayıcıyı yenilemeniz yeterlidir.

## Tek seferlik derleme

```powershell
npm run build
```

Yayınlanacak temiz site `dist/` klasöründe oluşur. Bu klasör kaynak değildir; doğrudan düzenlemeyin.

Build işlemi sayfalara canonical URL, Open Graph/Twitter etiketleri ve JSON-LD yapılandırılmış veri ekler; ayrıca `robots.txt` ile `sitemap.xml` dosyalarını otomatik üretir. Sayfa bazlı SEO verileri `scripts/build.mjs` içindeki `seoPages` tablosunda tutulur.

## Görsel optimizasyonu

`assets/img/` altına yeni bir JPG veya PNG ekledikten sonra responsive WebP türevlerini ve görsel manifestini yenileyin:

```powershell
python scripts/optimize-images.py
```

Orijinal dosyalar yüksek çözünürlüklü galeri hedefleri olarak korunur. Build, sayfa içindeki görseller için optimize edilmiş 640/1280 px WebP dosyalarını, `srcset` bilgisini ve gerçek en-boy ölçülerini otomatik kullanır.

## Yayınlama

`main` dalına gönderilen her değişiklik GitHub Actions tarafından derlenir ve GitHub Pages'a yayınlanır.

```powershell
git add .
git commit -m "Site içeriğini güncelle"
git push origin main
```

> `scripts/import-current-export.mjs` yalnızca ilk dönüşüm için tutulmaktadır. Yeniden çalıştırılması `src/pages` ve `src/styles` içeriğini mevcut eski çıktıdan tekrar oluşturur.
