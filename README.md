# Kampüs — Kampüs İçi İkinci El Pazaryeri

Öğrencilerin kampüs içinde ikinci el ürün alıp satması ve takas yapması için tasarlanan responsive web arayüzü.

## Aşama 1: Arayüz ve mobil tasarım

Bu sürüm, ürün tasarımını ve temel etkileşimleri test etmek için hazırlanmış bir frontend prototipidir.

### İçerik
- Responsive ana sayfa ve mobil menü
- Kategori kartları ve kategoriye göre filtreleme
- Arama, fiyat sıralama ve ilan kartları
- İlan detay penceresi
- Kaydedilen ilanlar
- Acil satılık ve takas filtreleri
- Demo giriş ve ilan oluşturma formları
- Örnek ilan verileri

## Bilgisayarda çalıştırma

1. Bu depoyu IntelliJ IDEA ile aç.
2. Proje klasöründeki `index.html` dosyasını tarayıcıda aç.
3. Dosyaları değiştirdikten sonra tarayıcıyı yenile.

İlk tasarım prototipi için Node.js kurulumu gerekmez.

## Önemli not

Şu an giriş, ilan oluşturma ve kullanıcı verileri gerçek bir backend'e bağlı değildir. Formlar tasarım önizlemesidir ve örnek ilanlar `data.js` içindedir.

## Yol haritası

1. Profesyonel arayüz ve mobil tasarım
2. Supabase/PostgreSQL, e-posta doğrulama, kimlik doğrulama ve Row Level Security
3. Gerçek çalışan MVP: kayıt, giriş, ilan ekleme, arama, filtreleme ve ilan detayları
4. Sonraki sürümler: öğrenci doğrulaması, güvenli buluşma noktaları, takas akışı, moderasyon ve ilan öne çıkarma

## Güvenlik yaklaşımı

Üniversite e-posta alan adı tek başına yüzde yüz güvenlik garantisi değildir. Gerçek sürümde e-posta doğrulaması, sunucu tarafı kontrolleri, erişim politikaları, kötüye kullanım önlemleri ve raporlama akışı uygulanmalıdır.