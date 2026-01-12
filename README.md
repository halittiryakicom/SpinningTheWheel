# 🎯 Çekiliş Çarkı (Spinning The Wheel)

Modern ve kullanıcı dostu bir çekiliş çarkı uygulaması. Öğretmenler, eğitimciler ve grup organizatörleri için adil seçim ve sıralama yapmanızı sağlar.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 📖 İçindekiler

- [Özellikler](#-özellikler)
- [Demo](#-demo)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Teknolojiler](#-teknolojiler)
- [Roadmap](#-roadmap)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)
- [İletişim](#-iletişim-ve-linkler)

## ✨ Özellikler

### 🎲 Temel Özellikler

- **Katılımcı Yönetimi**: Kolayca katılımcı ekleyin, silin ve yönetin
- **Çekiliş Çarkı**: Animasyonlu çark ile adil seçim yapın
- **Otomatik Sıralama**: Tüm katılımcıları otomatik olarak sıralayın
- **Sonuç İndirme**: Sıralama sonuçlarını TXT formatında indirin

### 🎨 Kullanıcı Deneyimi

- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Modern Arayüz**: Minimalist ve kullanıcı dostu tasarım
- **Renkli Görsellik**: 10 farklı renk paleti ile çekici görünüm
- **Akıcı Animasyonlar**: GSAP ile profesyonel animasyonlar

### ⚡ Hızlı İşlemler

- **Enter ile Ekleme**: Klavye kısayolları ile hızlı kullanım
- **Gerçek Zamanlı Güncelleme**: Anında görsel geri bildirim
- **Tek Tıkla Silme**: Katılımcıları kolayca yönetin

## 🎮 Demo

Uygulamayı yerel olarak çalıştırarak canlı demo'yu görebilirsiniz.

## 🚀 Kurulum

### Gereksinimler

- Modern bir web tarayıcısı (Chrome, Firefox, Safari, Edge)
- Yerel web sunucusu (isteğe bağlı)

### Adımlar

1. **Projeyi klonlayın**

```bash
git clone https://github.com/kullaniciadi/SpinningTheWheel.git
cd SpinningTheWheel
```

2. **Dosyaları açın**
   - `index.html` dosyasını doğrudan tarayıcınızda açabilirsiniz
   - veya yerel bir sunucu kullanın:

```bash
# Python ile
python -m http.server 8000

# Node.js ile (live-server)
npx live-server
```

3. **Tarayıcınızda açın**

```
http://localhost:8000
```

## 📝 Kullanım

### Katılımcı Ekleme

1. Sol taraftaki input alanına katılımcı adını yazın
2. "Ekle" butonuna tıklayın veya Enter tuşuna basın
3. Katılımcı listeye ve çarka otomatik olarak eklenir

### Çekiliş Yapma

1. En az bir katılımcı ekleyin
2. "Çarkı Çevir" butonuna tıklayın
3. Çark döner ve kazanan otomatik olarak seçilir
4. Seçilen kişi listeden çıkarılır

### Sıralama Yapma

1. Tüm katılımcıları ekleyin
2. "Sıralama Yap" butonuna tıklayın
3. Çark otomatik olarak tüm katılımcıları sıralar
4. Sonuçları "📥 İndir" butonu ile TXT formatında indirebilirsiniz

### Katılımcı Silme

- Her katılımcının yanındaki "Sil" butonuna tıklayın

## 🛠️ Teknolojiler

### Frontend

- **HTML5**: Yapılandırma ve canvas elementi
- **CSS3**: Modern ve responsive tasarım
- **JavaScript (Vanilla)**: Tüm uygulama mantığı

### Kütüphaneler

- **[Winwheel.js](https://github.com/zarocknz/javascript-winwheel)**: Çark oluşturma ve animasyon
- **[GSAP](https://greensock.com/gsap/)**: Profesyonel animasyonlar

## 🗂️ Proje Yapısı

```
SpinningTheWheel/
│
├── index.html          # Ana HTML dosyası
├── README.md           # Proje dokümantasyonu
├── roadmap.md          # Geliştirme yol haritası
│
├── css/
│   └── style.css       # Stil dosyası
│
├── js/
│   └── main.js         # Ana JavaScript dosyası
│
└── script/             # Gelecekteki script'ler için
```

## 🗺️ Roadmap

Detaylı geliştirme planı için [roadmap.md](roadmap.md) dosyasına bakın.

### Yakında Gelecekler

- ⏳ Sıralama geçmişini yerel depolamada kaydetme
- ⏳ Önceki sıralamalar arasında geçiş
- 📋 Kullanıcı hesapları ve kimlik doğrulama
- 📋 Sınıf/grup yönetimi
- 📋 İstatistik ve raporlama
- 📋 Sesli geri bildirim

## 🤝 Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! Katkıda bulunmak için:

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Pull Request oluşturun

### Katkı Kuralları

- Kod standartlarına uyun
- Değişikliklerinizi açıklayıcı şekilde belgelendirin
- Test edin ve çalıştığından emin olun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🔗 İletişim ve Linkler

Aşağıdaki kanallar üzerinden bana ulaşabilirsiniz:

- 🌐 **Web Sitesi**: [https://www.halittiryaki.com/](https://www.halittiryaki.com/)
- 🐦 **X (Twitter)**: [@halittiryakicom](https://x.com/halittiryakicom)
- 📸 **Instagram**: [@halittiryakicom](https://instagram.com/halittiryakicom)
- 💼 **LinkedIn**: [in/halittiryaki](https://linkedin.com/in/halittiryaki)

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ by [Halit Tiryaki](https://www.halittiryaki.com)

</div>
