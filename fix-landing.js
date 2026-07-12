const fs = require('fs');

const file = 'src/components/landing/landing-page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  'عرض Aلخطط UndPreise': 'Pläne und Preise anzeigen',
  'كل مA تحتAجe لإدAرة Speisekarte مطعمك': 'Alles, was du brauchst, um die Speisekarte deines Restaurants zu verwalten',
  'من صفحة Speisekarte UndAحدة إلى نظAم كAمل للطAUndلAت UndAnfragen UndAلUndلAء — Aختر مA YنAسب حجم مطعمك.': 'Von einer einfachen Speisekarten-Seite bis hin zu einem kompletten System für Tische, Bestellungen und Kundenbindung — Wähle, was zur Größe deines Restaurants passt.',
  'خطط AشترAك تنAسب كل مطعم': 'Abonnement-Pläne, die zu jedem Restaurant passen',
  'أUndل شeر مجAنAً للخطة AلأسAسYة UndAلAحترAفYة — دUndن إدخAل فYزA أUnd بطAقة بنكYة. Aدفع شeرYAً أUnd Undفر مع AلAشترAك AلسنUndY.': 'Erster Monat kostenlos für den Basic- und Pro-Plan — ohne Kreditkarte. Bezahle monatlich oder spare mit dem Jahresabo.',
  '>شeرY<': '>Monatlich<',
  '<span>SunUndY</span>': '<span>Jährlich</span>',
  '>تUndفYر<': '>Sparen<',
  '>AلأسAسYة<': '>Basic<',
  'للمطAعم AلصغYرة — Speisekarte UndلUndحة تحكم Und QR': 'Für kleine Restaurants — Speisekarte, Dashboard und QR',
  'أUndل شeر مجAنAً — دUndن إدخAل فYزA أUnd بطAقة بنكYة': 'Erster Monat kostenlos — ohne Kreditkarte',
  '>/shar<': '>/Monat<',
  '(بعد Aلتجربة — مدفUndعة سنUndYAً)': '(Nach der Testphase — jährlich abgerechnet)',
  'بعد AنتeAء Aلشeر AلمجAنY': 'Nach Ablauf des Gratismonats',
  'صفحة AلSpeisekarte AلرقمYة': 'Digitale Speisekarten-Seite',
  'لUndحة تحكم أسAسYة': 'Basis-Dashboard',
  'AستخرAج QR للمطعم Undتصفحe من AلزبAئن': 'QR-Code erstellen und von Kunden scannen lassen',
  'Aبدأ بAلأسAسYة': 'Starte mit Basic',
  'Aلأكثر anzufordernAً': 'Am beliebtesten',
  '>AلAحترAفYة<': '>Pro<',
  'دUndمYن خAص, QR للطAUndلAت, anzufordern أUndنلAYن, UndلAء UndزبAئن': 'Eigene Domain, Tisch-QRs, Online-Bestellungen, Kundenbindung',
  'دUndمYن خAص': 'Eigene Domain',
  'QR لكل طAUndلة': 'QR für jeden Tisch',
  'anzufordern Anfragen من Aلصفحة للزبUndن': 'Online-Bestellungen für Kunden',
  'نظAم UndلAء للزبAئن': 'Kundenbindungssystem',
  'قAعدة بYAنAت للزبAئن AلمحتملYن': 'Kundendatenbank',
  'Wählen Du A aus, um A einzugeben': 'Starte mit Pro',
  '>AلسلAسل<': '>Enterprise<',
  'للسلAسل UndAلفرUndع — تعقYدAت أكثر UndSpeisekarte متقدم': 'Für Ketten und Filialen — mehr Funktionen und erweiterte Speisekarte',
  '(مدفUndعة سنUndYAً)': '(Jährlich abgerechnet)',
  'مUndجe للسلAسل UndAلفرUndع': 'Für Ketten und Filialen',
  'تعقYدAت UndErweiterte Einstellungen': 'Erweiterte Einstellungen und Rechte',
  'تصAمYم Speisekarte متقدمة': 'Erweiterte Speisekarten-Designs',
  '>للسلAسل<': '>Für Ketten<',
  'bereit لرفع Speisekarte مطعمك?': 'Bereit, dein Restaurant zu digitalisieren?',
  'أنشئ حسAبك فY دقAئق UndAبدأ بAستقبAل Anfragen عبر QR.': 'Erstelle dein Konto in wenigen Minuten und erhalte Bestellungen per QR-Code.',
  'معAYنة Speisekarte Experimental-': 'Demo-Speisekarte ansehen',
  'UndA UndA Y Und A Spisekarte für A UndA-Kunden A von eUndAfem UndA n Apps.': 'Biete deinen Kunden eine digitale Speisekarte an, ohne zusätzliche Apps herunterladen zu müssen.',
  'Verwalten Du Deine Gewürzkarten, Kategorien und UndA-Artikel von einem beliebigen Ort aus.': 'Verwalte deine Speisekarten, Kategorien und Artikel von überall aus.',
  'Über Dein UndY, wie zum Beispiel menu.restaurant.com, um Dein eUndY zu verbessern.': 'Nutze deine eigene Domain, wie z.B. menu.restaurant.com, um deine Marke zu stärken.'
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.split(key).join(value);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed landing-page.tsx');
