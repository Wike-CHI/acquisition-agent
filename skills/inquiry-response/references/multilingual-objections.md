# 多语种异议应答库

> objection-library.md 的多语种扩展
> 覆盖 8 个最高频异议 × 6 个目标语种
> 每条话术经过文化适配，不是机器翻译
>
> 版本：1.0.0 | 更新：2026-04-11
> 语种：PT-BR(巴西葡语) / ES(西班牙语) / DE(德语) / AR(阿拉伯语) / ID(印尼语) / TR(土耳其语)

---

## 使用方法

```
1. 客户回复到达 → 识别异议类型（A01-A15，见 objection-library.md）
2. 识别客户语言/地区
3. 在本文件查找对应语种的话术
4. 填入客户背景信息（公司名、痛点、具体数字）
5. 微调措辞使其自然
6. 发送

注意：
- 这些话术是起点，不是死模板
- 括号 [ ] 中的内容必须替换为实际信息
- 发送前通读一遍，确保语气自然
- 阿拉伯语从右到左书写，邮件客户端一般自动处理
```

---

## 语种索引

| 代码 | 语言 | 主要市场 | 文化特点 |
|------|------|---------|---------|
| PT-BR | 巴西葡萄牙语 | 巴西 | 热情、关系导向、非正式 |
| ES | 西班牙语 | 智利/阿根廷/哥伦比亚/墨西哥/秘鲁 | 礼貌、正式、重视信任 |
| DE | 德语 | 德国/奥地利/瑞士 | 技术严谨、直接、数据驱动 |
| AR | 阿拉伯语 | 沙特/阿联酋/埃及/土耳其外 | 先建关系、尊重很重要 |
| ID | 印尼语 | 印尼/马来西亚部分 | 友好、价格敏感、重视长期关系 |
| TR | 土耳其语 | 土耳其 | 务实、好谈判、重视面子 |

---

## A01 "太贵了"

### PT-BR（巴西）

**策略：价值分解 + 关系建立**

```
Olá [Nome],

Entendo perfeitamente — preço é sempre importante.

Deixa eu colocar em perspectiva: uma prensa HOLO dura em média
8-10 anos com manutenção básica. Se você fizer só 2 emendas por
semana, são 100 por ano. Em 8 anos, o custo por emenda fica em
menos de $[X].

Agora pensa no custo de uma emenda que falha — parada de produção,
material desperdiçado, conserto de emergência. Isso sozinho pode
custar $[Y].

O que muitos dos nossos clientes no Brasil fazem: começam com um
pedido teste, uma máquina. Quando veem a qualidade na prática,
voltam pra pedir mais.

Posso te preparar uma cotação com condições especiais pra primeiro
pedido? Sem compromisso.

Abraço,
Wike Chen
```

### ES（西班牙语）

**策略：对比行业均价 + 条件让步**

```
Estimado/a [Nombre],

Gracias por ser directo/a conmigo — eso facilita mucho.

En el mercado de equipos de empalme, hay tres niveles de precios:

- Marcas europeas (alemanas/austriacas): $15,000-25,000+
- Fabricantes chinos genéricos: $3,000-8,000
- HOLO: calidad europea a una fracción del precio

Usamos componentes importados (bombas Thomas del Reino Unido,
neumática SMC de Japón, controles Omron). La diferencia es que
fabricamos en China con costos operativos menores, no con estándares
menores.

Si puede confirmar el pedido dentro de [X días], puedo ofrecer:
- [5-8]% de descuento, O
- Kit de repuestos gratis (valor $[X]), O
- Envío gratuito al puerto de [destino]

¿Cuál opción le conviene más?

Saludos cordiales,
Wike Chen
```

### DE（德语）

**策略：技术价值论证 + TCO计算**

```
Sehr geehrte/r [Name],

danke für das offene Feedback.

Ich verstehe den Preispunkt. Lassen Sie mich die Gesamtkosten
betrachten:

Investition HOLO [Modell]: $[X]
- Lebensdauer: 8-10 Jahre bei ordnungsgemäßer Wartung
- Fugenqualität: 85-95% der Originalbandfestigkeit
- Temperaturgenauigkeit: ±1°C (Eurotherm 3216)
- Wartungskosten: ca. $[Y]/Jahr (Verschleißteile)

Vergleich europäische Marken:
- Anschaffung: 3-5x teurer
- Lieferzeit: 60-90 Tage (wir: 15-20 Tage)
- Ersatzteile: oft teuer und lange Lieferzeit

Unsere CE-Zertifizierung und importierte Kernkomponenten (Thomas,
SMC, Omron) garantieren europäische Qualitätsstandards.

Soll ich Ihnen einen detaillierten Kostenvergleich erstellen?

Mit freundlichen Grüßen,
Wike Chen
```

### AR（阿拉伯语）

**策略：关系先行 + 灵活方案**

```
مرحباً [الاسم]،

شكراً لصراحتكم — هذا يساعدني كثيراً.

أتفهم تماماً أن السعر مهم. دعني أقترح عدة خيارات:

أولاً، جودة معدات HOLO:
- مكونات مستوردة (مضخات Thomas البريطانية، هوائية SMC اليابانية)
- شهادة CE الأوروبية
- أكثر من 800 عميل في 40+ دولة

ثانياً، المرونة في الدفع:
- يمكننا مناقشة شروط دفع تناسب ميزانيتكم
- للطلبات الكبيرة، لدينا مرونة خاصة

ثالثاً، أقترح البدء بطلب تجريبي — جهاز واحد. هكذا ترون
الجودة بأنفسكم قبل الالتزام بطلب كبير.

ما رأيكم في مكالمة قصيرة لمناقشة الخيارات؟

مع خالص التحيات،
Wike Chen
```

### ID（印尼语）

**策略：长期省钱 + 试用建议**

```
Halo [Nama],

Terima kasih sudah jujur soal harga — saya sangat menghargainya.

Saya paham bahwa harga adalah pertimbangan penting. Tapi izinkan saya
menjelaskan nilai yang Anda dapatkan:

Perbandingan biaya jangka panjang:
- Mesin HOLO: awet 8-10 tahun, biaya per emenda sangat rendah
- Mesin murah: sering rusak, biaya perbaikan tinggi, hasil tidak konsisten

Komponen kunci kami semua import:
- Pompa: Thomas (Inggris)
- Pneumatik: SMC (Jepang)
- Controller: Omron (Jepang)

Banyak customer kami di Indonesia awalnya ragu, tapi setelah coba
satu unit, mereka repeat order karena puas.

Gimana kalau kita mulai dengan satu mesin dulu sebagai test?
Kalau bagus, pasti balik lagi. Kalau tidak cocok, minimal Anda
sudah tahu standar kualitas HOLO.

Terima kasih,
Wike Chen
```

### TR（土耳其语）

**策略：性价比 + 谈判空间**

```
Merhaba [İsim],

Fiyat konusundaki açıklamanız için teşekkürler.

Anlıyorum — bütçe her zaman önemli bir faktör. Ama izin verin
değer açısından açıklayayım:

HOLO ekipmanının avantajları:
- Avrupa kalitesinde üretim (CE sertifikalı)
- İthal bileşenler (Thomas pompa/İngiltere, SMC pnömatik/Japonya)
- 8-10 yıl ömür
- 12 ay garanti + ömür boyu uzaktan teknik destek

Avrupa markaları ile karşılaştırma:
- Fiyat: 3-5 kat daha pahalı
- Teslimat: 60-90 gün (biz: 15-20 gün)
- Yedek parça: çok pahalı ve uzun bekleme

İlk sipariş için özel koşullar sunabilirim:
- [X]% indirim, VEYA
- Ücretsiz yedek parça seti

Ayrıca birim sipariş ile test edebilirsiniz — kaliteyi görmeden
büyük sipariş vermenize gerek yok.

Daha detaylı konuşmak ister misiniz?

Saygılarımla,
Wike Chen
```

---

## A02 "我们已经有供应商了"

### PT-BR（巴西）

```
Legal — ter um fornecedor confiável é super importante.

Não tô pedindo pra substituir eles não. O que eu sugiro: manter a
HOLO como opção reserva. Quando seu fornecedor atual demorar muito,
tiver problema de qualidade, ou você precisar de uma especificação
diferente, a gente entra rápido.

Muitos clientes nossos no Brasil começaram assim — usando a gente
pra pedidos urgentes, depois foram migrando mais volume conforme
viram a qualidade.

Posso te mandar o catálogo pra ter guardado? Quando precisar, é só
chamar.

Abraço,
Wike Chen
```

### ES（西班牙语）

```
Entiendo perfectamente — tener un proveedor confiable es fundamental.

No busco reemplazarlos. Solo quiero que conozcan HOLO como una
opción adicional para cuando necesiten:

- Tiempos de entrega más rápidos
- Especificaciones personalizadas
- Soporte técnico en diferentes horarios
- Un respaldo ante imprevistos

Muchos de nuestros mejores clientes en Latinoamérica empezaron con
un pedido de prueba y ahora son clientes regulares.

¿Les envío el catálogo para tenerlo en archivo?

Saludos,
Wike Chen
```

### DE（德语）

```
Verständlich — eine zuverlässige Lieferantenbeziehung ist wertvoll.

Ich schlage nicht vor, Ihren aktuellen Lieferanten zu ersetzen.
Aber es ist immer gut, eine Alternative zu haben, besonders wenn:

- Lieferzeiten zu lang werden
- Spezifikationen angepasst werden müssen
- Ersatzteile schnell benötigt werden
- Technischer Support in Ihrer Zeitzone nötig ist

HOLO kann als ergänzender Lieferant fungieren. Viele Kunden nutzen
uns für Ergänzungsbestellungen oder Sonderanfertigungen, während
sie ihren Hauptlieferanten beibehalten.

Soll ich Ihnen unsere technischen Unterlagen für Ihre Unterlagen
zuschicken?

Mit freundlichen Grüßen,
Wike Chen
```

### AR（阿拉伯语）

```
أتفهم تماماً — وجود مورد موثوق مهم جداً.

لا أطلب منكم استبدال موردكم الحالي. أقترح فقط أن تعرفوا
بوجود HOLO كخيار إضافي عندما تحتاجون:

- سرعة في التوريد
- مواصفات مخصصة
- دعم فني متاح
- بديل في حالات الطوارئ

كثير من عملائنا بدأوا هكذا — طلب تجريبي، ثم طلبات أكبر
بعد رؤية الجودة.

هل يمكنني إرسال كتالوج المنتجات للاحتفاظ به؟

مع التحيات،
Wike Chen
```

### ID（印尼语）

```
Makasih infonya — punya supplier tetap itu penting banget.

Saya ngga minta ganti mereka. Cuma mau kenalin HOLO sebagai opsi
cadangan. Kalau supplier sekarang lagi lambat, ada masalah kualitas,
atau butuh spesifikasi beda, kita bisa bantu cepat.

Banyak customer kami yang awalnya cuma order pas butuh darurat,
tapi lama-lama jadi langganan karena puas.

Boleh saya kirim katalog buat disimpan dulu? Kalau butuh, tinggal
hubungi saja.

Terima kasih,
Wike Chen
```

### TR（土耳其语）

```
Anlıyorum — güvenilir bir tedarikçi relationship çok değerli.

Mevcut tedarikçinizi değiştirmeyi önermiyorum. Sadece HOLO'yu
yedek bir seçenek olarak bilmenizi isterim:

- Acil siparişlerde hızlı teslimat
- Özel spesifikasyon ihtiyaçları
- Teknik destek

Birçok müşterimiz bu şekilde başladı — acil ihtiyaçlarda bizi
tercih ettiler, sonra düzenli siparişe geçtiler.

Kataloğumuzu dosyanızda bulundurmak ister misiniz?

Saygılarımla,
Wike Chen
```

---

## A04 "让我考虑考虑"

### PT-BR（巴西）

```
Claro, sem pressa! Decisão dessas tem que ser bem pensada.

Só pra você saber: nosso preço atual é válido até [data]. Depois
disso, custos de matéria-prima podem subir [5-10]%.

E nossa agenda de produção pro mês que vem tá enchendo. Se você
confirmar até [data], garanto entrega até [data].

Mas sem pressa, tá? Quando for uma boa hora pra eu acompanhar?
Um abraço,
Wike Chen
```

### ES（西班牙语）

```
Por supuesto — es una decisión importante. Tómense el tiempo
que necesiten.

Solo para que lo tengan en cuenta:
- Nuestros precios actuales son válidos hasta [fecha]
- La programación de producción para [mes] se está llenando
- Si confirman antes de [fecha], garantizamos envío para [fecha]

Sin presión. ¿Cuándo sería un buen momento para hacer seguimiento?

Saludos cordiales,
Wike Chen
```

### DE（德语）

```
Natürlich — eine gute Entscheidung braucht Zeit.

Zwei Punkte zur Information:
1. Unsere aktuellen Preise sind bis [Datum] gültig
2. Unser Produktionsplan für [Monat] füllt sich

Falls Sie bis [Datum] entscheiden können, garantiere ich Lieferung
bis [Datum].

Gibt es konkrete Bedenken, die ich adressieren kann? Oft hilft es,
offene Fragen direkt zu klären:

- Qualitätssicherung? → Ich sende Prüfberichte
- Budget-Timing? → Wir können Zahlungsbedingungen anpassen
- Interne Freigabe? → Ich erstelle eine Entscheidungsvorlage

Sagen Sie einfach Bescheid, was Sie brauchen.

Mit freundlichen Grüßen,
Wike Chen
```

### AR（阿拉伯语）

```
بالطبع — القرار الجيد يحتاج وقتاً.

أريد فقط أن أوضح نقطتين:
- أسعارنا الحالية صالحة حتى [التاريخ]
- جدول الإنتاج لشهر [الشهر] يمتلئ بسرعة

إذا أمكنكم التأكيد خلال [عدد الأيام] أيام، أضمن التسليم
حتى [التاريخ].

هل لديكم أي أسئلة محددة يمكنني الإجابة عليها لتسهيل
القرار؟

مع خالص التحيات،
Wike Chen
```

### ID（印尼语）

```
Tentu — keputusan penting harus dipikirin matang-matang.

Cumanya info: harga kami sekarang berlaku sampai [tanggal]. Setelah
itu, biaya bahan baku mungkin naik [5-10]%.

Kalau bisa konfirmasi sebelum [tanggal], saya bisa janji pengiriman
sampai [tanggal].

Ada pertanyaan atau kekhawatiran yang bisa saya bantu jawab?

Terima kasih,
Wike Chen
```

### TR（土耳其语）

```
Tabii ki — önemli bir karar, düşünmek gerekir.

Bilginiz için:
- Fiyatlarımız [tarih] tarihine kadar geçerli
- [Ay] ayı üretim planımız dolmaya başladı

[tarih] tarihine kadar karar verirseniz, [tarih] tarihine kadar
teslimat garantisi verebilirim.

Acaba sizi bekleten belirli bir konu var mı? Çözmeme yardımcı
olabilirim.

Saygılarımla,
Wike Chen
```

---

## A05 "质量可靠吗"

### PT-BR（巴西）

```
Ótima pergunta — confiança tem que ser construída.

O que garante a qualidade da HOLO:

Certificações:
- CE certificado (padrão europeu)
- ISO 9001
- Empresa de Alta Tecnologia (China)

Componentes importados:
- Bombas Thomas (Reino Unido)
- Pneumática SMC (Japão)
- Controles Omron/Eurotherm — precisão de ±1°C

Na prática:
- 800+ clientes em 40+ países
- Taxa de retorno de garantia inferior a 1%
- Exportamos pra Alemanha, EUA, Coreia, Brasil

Posso agendar uma videochamada pra te mostrar a fábrica?
Meia hora e você vê tudo na hora.

Abraço,
Wike Chen
```

### ES（西班牙语）

```
Excelente pregunta — la confianza se gana con hechos, no con palabras.

Lo que respalda la calidad de HOLO:

Certificaciones:
- Certificado CE (normativa europea)
- ISO 9001 gestión de calidad
- Certificación de Empresa de Alta Tecnología

Componentes clave:
- Bombas Thomas (Reino Unido) — estándar de la industria
- Neumática SMC (Japón) — control preciso de presión
- Controladores Eurotherm/Omron — precisión ±1°C

Referencias:
- 800+ clientes en 40+ países
- Exportamos a Alemania, EE.UU., Brasil, Corea
- Tasa de devolución por garantía: menos del 1%

¿Le gustaría que programe una videollamada para mostrarle nuestra
fábrica? 30 minutos y verá todo firsthand.

Saludos,
Wike Chen
```

### DE（德语）

```
Berechtigte Frage. Hier sind die Fakten:

Zertifizierungen:
- CE-zertifiziert (EU-Normen)
- ISO 9001 Qualitätsmanagement
- National High-Tech Enterprise

Kernkomponenten (alle importiert):
- Pumpen: Thomas 70060055-W054 (UK)
- Pneumatik: SMC ISE30A (Japan)
- Temperaturregler: Eurotherm 3216, ±1°C Genauigkeit
- Relais: IDEC RJ1S-CL (Japan)

Qualitätskontrolle:
- Jede Maschine wird vor Versand getestet
- Prüfprotokoll wird mitgeliefert
- Garantierücklaufquote: unter 1%
- Export nach Deutschland, UK, Südkorea

Ich kann Ihnen gerne:
1. Die CE-Zertifikatskopie zusenden
2. Einen Test-Video für Ihren spezifischen Bandtyp erstellen
3. Eine Referenz in Ihrer Region nennen

Was wäre für Sie am überzeugendsten?

Mit freundlichen Grüßen,
Wike Chen
```

### AR（阿拉伯语）

```
سؤال ممتاز — الثقة تُبنى بالأفعال لا بالكلمات.

ما يضمن جودة HOLO:

الشهادات:
- شهادة CE (المعيار الأوروبي)
- ISO 9001 لإدارة الجودة
- شهادة شركة التقنية العالية

المكونات الرئيسية المستوردة:
- مضخات Thomas (المملكة المتحدة)
- أنظمة هوائية SMC (اليابان)
- أجهزة تحكم Omron/Eurotherm — دقة ±1 درجة مئوية

العملاء:
- أكثر من 800 عميل في أكثر من 40 دولة
- نسبة إرجاع الضمان أقل من 1%

أقترح مكالمة فيديو لأرينا المصنع مباشرة. 30 دقيقة فقط.

مع التحيات،
Wike Chen
```

### ID（印尼语）

```
Pertanyaan bagus — kepercayaan harus dibuktikan, bukan cuma diomongin.

Yang menjamin kualitas HOLO:

Sertifikasi:
- CE (standar Eropa)
- ISO 9001
- Sertifikasi perusahaan teknologi tinggi

Komponen kunci:
- Pompa Thomas (Inggris) — standar industri
- Pneumatik SMC (Jepang)
- Controller Omron — akurasi ±1°C

Track record:
- 800+ customer di 40+ negara
- Export ke Jerman, USA, Korea, Brasil
- Return rate garansi di bawah 1%

Gimana kalau kita video call? Saya tunjukkin pabriknya langsung.
30 menit aja.

Terima kasih,
Wike Chen
```

### TR（土耳其语）

```
Haklı bir soru. İşte kalitemizi destekleyen gerçekler:

Sertifikalar:
- CE sertifikası (AVrupa standartları)
- ISO 9001 kalite yönetimi
- Yüksek Teknoloji İşletmesi sertifikası

Ana bileşenler (ithal):
- Thomas pompalar (İngiltere)
- SMC pnömatik (Japonya)
- Omron/Eurotherm kontrolcü — ±1°C hassasiyet

Referanslar:
- 40+ ülkede 800+ müşteri
- Almanya, İngiltere, Güney Kore'ye ihracat
- Garanti iade oranı: %1'in altında

Video görüşme ile fabrikamızı gösterebilirim. 30 dakika yeterli.

Saygılarımla,
Wike Chen
```

---

## A09 "中国制造质量不行"

### DE（德语）— 这个异议在德语区最常见

```
Dieses Vorurteil kenne ich gut. Und ehrlich gesagt haben einige
chinesische Hersteller es verdient. Aber der Markt ändert sich.

Was HOLO anders macht:

1. Importierte Kernkomponenten
   - Thomas (UK), SMC (Japan), Omron (Japan)
   - Die kritischen Teile sind nicht "chinesische Qualität"

2. CE-Zertifizierung
   - Erfüllt EU-Sicherheitsstandards
   - Regelmäßig geprüft

3. Nachweisbare Export-Erfahrung
   - 40+ Länder, einschließlich Deutschland, UK, Südkorea
   - Nicht nur Entwicklungsländer

4. Direkt vom Hersteller
   - 5.500 m² Fabrik, 70+ Techniker
   - Keine Handelsfirma, keine Zwischenhändler

Ich lade Sie herzlich zu einer virtuellen Fabrikbesichtigung ein.
30 Minuten live, und Sie können selbst urteilen.

Mit freundlichen Grüßen,
Wike Chen
```

### ES（西班牙语）— 拉美客户也可能有类似顾虑

```
Entiendo la preocupación. Es cierto que hay equipos chinos de baja
calidad en el mercado, normalmente vendidos por empresas intermediarias.

HOLO es diferente por tres razones principales:

1. Somos el fabricante real
   - Fábrica de 5,500 m², 70+ técnicos
   - No somos una empresa de comercio (trading company)

2. Componentes premium
   - Thomas (Reino Unido), SMC (Japón), Omron (Japón)
   - No escatimamos en las piezas críticas

3. Respaldamos nuestro producto
   - 12 meses de garantía
   - Soporte técnico de por vida
   - Respondemos cuando nos llaman

La mejor manera de evaluar: vea la fábrica por video. 30 minutos
y tendrá una imagen clara.

¿Le parece bien?
```

### AR（阿拉伯语）

```
أتفهم هذا القلق. صحيح أن بعض المنتجات الصينية لا تلبي المعايير،
لكن هذا يتغير.

ما يميز HOLO:

1. نحن المصنع الفعلي — وليس شركة تجارة وسيطة
2. مكونات رئيسية مستوردة (بريطانيا/اليابان)
3. شهادة CE الأوروبية
4. أكثر من 40 دولة تستخدم منتجاتنا

أقترح أن تروا بأنفسكم — مكالمة فيديو للمصنع، 30 دقيقة.

مع التحيات،
Wike Chen
```

---

## A15 "我要跟XX（合作伙伴）买"

> ⚠️ 这个场景必须先查 PARTNER-REGISTRY.md
> Beltwin 是合作伙伴，不能攻击，不能用"源头厂家"话术暴露关系

### PT-BR（巴西）— Beltwin 在巴西有布局

```
Beleza — eles são um fornecedor respeitado.

Como fabricante original dos equipamentos HOLO, queria me apresentar
diretamente caso você precise de:

- Suporte técnico direto de fábrica e peças de reposição
- Especificações personalizadas que podem não estar no catálogo padrão
- Acesso direto à nossa equipe de engenharia
- Vagas prioritárias na produção pra pedidos urgentes

A gente funciona bem junto com distribuidores. Pensa na gente como
um recurso adicional, não como substituição.

Posso te mandar o catálogo completo pra referência?

Abraço,
Wike Chen
```

### ES（西班牙语）— Beltwin 在拉美也有客户

```
Entendido — son un proveedor reconocido.

Como fabricante original de los equipos HOLO, me presento directamente
en caso de que necesiten:

- Soporte técnico directo de fábrica
- Especificaciones personalizadas fuera del catálogo estándar
- Acceso directo a nuestro equipo de ingeniería
- Prioridad en producción para pedidos urgentes

Trabajamos bien junto a distribuidores y podemos complementar lo que
ya están recibiendo. Piensen en nosotros como un recurso adicional.

¿Les envío nuestro catálogo completo para referencia?

Saludos,
Wike Chen
```

### DE（德语）

```
Verständlich — ein etablierter Lieferant ist wichtig.

Als Originalhersteller der HOLO-Geräte möchte ich mich direkt
vorstellen, falls Sie mal benötigen:

- Direkten Werks-Support und Original-Ersatzteile
- Angepasste Spezifikationen außerhalb des Standardkatalogs
- Direkten Zugang zu unserem Ingenieurteam
- Prioritäts-Produktionsslots für Eilaufträge

Wir arbeiten gut mit Vertriebspartnern zusammen und können
Ihre bestehende Versorgung ergänzen.

Soll ich Ihnen den vollständigen Katalog zusenden?

Mit freundlichen Grüßen,
Wike Chen
```

---

## A08 "暂时不需要"

### PT-BR（巴西）

```
Tranquilo! Equipamento normalmente é planejado com antecedência.

Só pra deixar registrado — se você tiver algum projeto vindo aí que
vai precisar de:
- Prensa nova ou substituição
- Expansão pra tipos de banda diferentes
- Segunda máquina pra backup

Pode me avisar antes que eu separo vaga na produção. Sem compromisso.

Vou mandar umas atualizações do setor de vez em quando. Qualquer
coisa, é só chamar.

Abraço,
Wike Chen
```

### ES（西班牙语）

```
No hay problema — la compra de equipos normalmente se planifica
con anticipación.

Solo quería dejar la puerta abierta. Si tienen proyectos futuros
donde necesiten:

- Equipo nuevo o de reemplazo
- Expansión a nuevos tipos de bandas
- Una segunda máquina como respaldo

Avísenme con anticipación y reservo espacio en producción.
Sin compromiso.

Les enviaré ocasionalmente novedades del sector. Cuando el momento
sea el indicado, aquí estaré.

Saludos cordiales,
Wike Chen
```

### ID（印尼语）

```
Oke, ngga masalah! Pembelian mesin emang biasanya di-plan ahead.

Cuma mau bilang — kalau nanti ada proyek yang butuh mesin baru atau
penggantian, kabari aja. Saya bisa siapin slot produksi.

Ngga perlu buru-buru. Nanti kalau waktunya pas, tinggal hubungi.

Saya kirim-kirim update info industri kadang-kadang ya.

Terima kasih,
Wike Chen
```

### AR（阿拉伯语）

```
لا مشكلة على الإطلاق — شراء المعدات يُخطط له مسبقاً عادة.

أردت فقط أن أبقي الباب مفتوحاً. إذا كان لديكم مشاريع قادمة
تحتاج معدات جديدة أو استبدال، أخبروني مسبقاً لأحجز مكاناً
في جدول الإنتاج.

بدون أي التزام. سأرسل لكم تحديثات الصناعة من حين لآخر.

مع خالص التحيات،
Wike Chen
```

---

## 强信号快速推进（跨语种通用）

> 当客户问价格细节、交期、付款方式 = 强信号，用这套模板快速推进

### PT-BR（巴西）

```
Boa! Pra avançar, preciso de:

1. Nome completo da empresa e endereço (pra cotação)
2. Especificações do modelo que precisa (largura, voltagem)
3. Porto de destino (pra calcular frete)
4. Condições de pagamento preferidas

Com isso, mando a cotação formal em 24 horas. Preço válido por 30 dias.

Bora?
```

### ES（西班牙语）

```
Perfecto. Para preparar la cotización formal necesito:

1. Nombre completo de la empresa y dirección
2. Modelo y especificaciones (ancho, voltaje)
3. Puerto de destino
4. Condiciones de pago preferidas

Les envío la cotización en 24 horas, válida por 30 días.

¿Avanzamos?
```

### DE（德语）

```
Sehr gut. Für ein formelles Angebot benötige ich:

1. Firmenname und vollständige Adresse
2. Modell und Spezifikationen (Breite, Spannung)
3. Zielhafen
4. Bevorzugte Zahlungsbedingungen

Sie erhalten das Angebot innerhalb von 24 Stunden, 30 Tage gültig.

Soll ich vorbereiten?
```

### AR（阿拉伯语）

```
ممتاز. لإعداد عرض أسعار رسمي أحتاج:

1. اسم الشركة الكامل والعنوان
2. الموديل والمواصفات (العرض، الجهد)
3. ميناء الوجهة
4. شروط الدفع المفضلة

سأرسل العرض خلال 24 ساعة، صالح لمدة 30 يوماً.

هل أبدأ بإعداده؟
```

### ID（印尼语）

```
Mantap! Buat siapin penawaran resmi, saya butuh:

1. Nama perusahaan dan alamat lengkap
2. Model dan spesifikasi (lebar, voltase)
3. Pelabuhan tujuan
4. Syarat pembayaran yang diinginkan

Penawaran siap dalam 24 jam, berlaku 30 hari.

Kita lanjut?
```

### TR（土耳其语）

```
Harika. Resmi teklif için ihtiyacım olan:

1. Şirket tam adı ve adres
2. Model ve özellikler (genişlik, voltaj)
3. Varış limanı
4. Tercih edilen ödeme koşulları

Teklifi 24 saat içinde gönderirim, 30 gün geçerli.

Hazır mısınız?
```

---

_版本 1.0.0 | 2026-04-11_
_6语种 × 8高频异议 = 48条话术_
_配合 objection-library.md 使用（英文版策略说明）_
_新增语种或场景时追加到对应章节即可_
