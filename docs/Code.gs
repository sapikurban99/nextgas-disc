function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Sheet: Questions (Config Soal)
  let qSheet = ss.getSheetByName('Questions');
  if (!qSheet) {
    qSheet = ss.insertSheet('Questions');
    
    // Header
    qSheet.appendRow(['Question', 'OptA_Text', 'OptA_Key', 'OptB_Text', 'OptB_Key', 'OptC_Text', 'OptC_Key', 'OptD_Text', 'OptD_Key']);
    
    // Insert Data Pertanyaan Detail & Komprehensif (12 Pertanyaan)
    const questionsData = [
      [
        "Saat menghadapi krisis atau masalah mendesak di tempat kerja, insting pertama saya adalah...",
        "Langsung mengambil kendali, membuat keputusan cepat, dan bertindak.", "D",
        "Mengumpulkan data, menganalisa akar masalah, dan mengevaluasi risiko secara logis.", "C",
        "Menenangkan suasana, memastikan tim tetap solid, dan mencari solusi bersama.", "S",
        "Mencairkan ketegangan, mengajak tim berdiskusi, dan mencari ide-ide kreatif.", "I"
      ],
      [
        "Dalam sebuah project tim, peran yang paling membuat saya bersinar adalah...",
        "Penggagas ide dan motivator yang menjaga energi tim tetap tinggi.", "I",
        "Eksekutor yang handal, menjaga harmoni, dan memastikan tugas selesai tepat waktu.", "S",
        "Quality Control yang memastikan semua detail akurat dan sesuai standar.", "C",
        "Pemimpin yang menetapkan target, mendelegasikan tugas, dan mendorong hasil.", "D"
      ],
      [
        "Jika ada perubahan rencana mendadak dari manajemen, reaksi saya biasanya...",
        "Merasa kurang nyaman, saya butuh waktu untuk mencerna dan menyesuaikan ritme.", "S",
        "Melihatnya sebagai tantangan baru yang menarik dan langsung tancap gas.", "D",
        "Meminta penjelasan tertulis atau alasan logis di balik perubahan tersebut.", "C",
        "Mencoba mencari sisi positifnya dan meyakinkan rekan lain agar tidak panik.", "I"
      ],
      [
        "Gaya komunikasi saya sehari-hari paling pas dideskripsikan sebagai...",
        "Spesifik, berbasis fakta, berhati-hati, dan tertulis (email/chat panjang).", "C",
        "Singkat, padat, to the point, dan berorientasi pada tujuan.", "D",
        "Hangat, ekspresif, banyak bercerita, dan antusias.", "I",
        "Tenang, menjadi pendengar yang baik, suportif, dan ramah.", "S"
      ],
      [
        "Saat harus mengambil keputusan penting, pendekatan saya adalah...",
        "Mengandalkan firasat, mendiskusikannya dengan orang lain untuk minta pendapat.", "I",
        "Mencari konsensus agar semua pihak merasa dihargai dan setuju.", "S",
        "Mengandalkan insting, cepat, dan berani mengambil risiko.", "D",
        "Membandingkan pro & kontra berdasarkan data, fakta, dan preseden masa lalu.", "C"
      ],
      [
        "Apa yang paling memotivasi saya untuk bekerja keras?",
        "Mendapatkan apresiasi, pengakuan publik, dan lingkungan yang fun.", "I",
        "Mencapai target, memenangkan persaingan, dan mendapatkan hasil nyata.", "D",
        "Mencapai keakuratan tingkat tinggi dan kebanggaan atas kualitas kerja yang sempurna.", "C",
        "Rasa aman, stabilitas pekerjaan, dan kontribusi nyata untuk tim yang saya sayangi.", "S"
      ],
      [
        "Saat memberikan feedback kepada rekan kerja, saya cenderung...",
        "Menyampaikan secara pribadi, dengan nada lembut agar tidak menyakiti perasaannya.", "S",
        "Fokus pada data dan contoh spesifik di mana mereka melakukan kesalahan prosedur.", "C",
        "Langsung bicara apa adanya, blak-blakan agar cepat diperbaiki.", "D",
        "Memberikan pujian terlebih dahulu (sandwich method), baru menyisipkan saran perbaikan.", "I"
      ],
      [
        "Memulai sebuah project baru yang belum pernah dikerjakan sebelumnya, saya akan...",
        "Mempelajari semua panduan, riset mendalam, dan membuat checklist yang sangat detail.", "C",
        "Bersemangat memikirkan kemungkinan tak terbatas dan mengajak teman brainstorming.", "I",
        "Membuat rencana langkah demi langkah yang stabil agar prosesnya jelas dan aman.", "S",
        "Menentukan tujuan akhirnya dulu, lalu langsung eksekusi sambil jalan.", "D"
      ],
      [
        "Bagaimana pandangan saya terhadap aturan dan SOP perusahaan?",
        "Aturan adalah panduan yang sangat penting untuk menjaga standar dan menghindari kesalahan.", "C",
        "Aturan itu perlu, tapi terkadang bisa dibengkokkan sedikit demi mencapai target lebih cepat.", "D",
        "Aturan membantu menciptakan lingkungan kerja yang terprediksi dan aman bagi semua.", "S",
        "Aturan itu fleksibel, yang penting kita bisa berkreasi dan mendapatkan hasil.", "I"
      ],
      [
        "Dalam lingkungan sosial atau acara kumpul kantor, saya biasanya...",
        "Menikmati obrolan mendalam 1-on-1 dengan orang yang sudah saya kenal baik.", "C",
        "Menjadi pusat perhatian, bercanda, dan mudah berbaur dengan siapa saja.", "I",
        "Hadir untuk meramaikan, lebih banyak mendengar, dan memastikan semua orang merasa nyaman.", "S",
        "Menggunakan waktu tersebut untuk networking dengan orang-orang penting secara strategis.", "D"
      ],
      [
        "Ketika saya berada di bawah tekanan atau stres berat, saya cenderung menjadi...",
        "Lebih kaku, menarik diri, dan terlalu kritis terhadap hal-hal kecil.", "C",
        "Lebih emosional, sulit fokus, dan butuh tempat untuk curhat.", "I",
        "Lebih bossy, tidak sabaran, dan mendikte orang lain.", "D",
        "Lebih diam, mengalah untuk menghindari konflik yang lebih besar.", "S"
      ],
      [
        "Lingkungan kerja ideal menurut saya adalah yang...",
        "Harmonis, tenang, tidak banyak konflik, dan penuh rasa kekeluargaan.", "S",
        "Terstruktur rapi, ekspektasi jelas, dan menghargai privasi serta ketelitian.", "C",
        "Dinamis, penuh tantangan, kompetitif, dan berorientasi pada pencapaian.", "D",
        "Kreatif, santai, banyak interaksi sosial, dan tidak terlalu birokratis.", "I"
      ]
    ];

    questionsData.forEach(row => qSheet.appendRow(row));
    
    // Styling Header
    qSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#e0e0e0");
    qSheet.setFrozenRows(1);
  }
  
  // 2. Setup Sheet: Results (Hasil Analisa)
  let rSheet = ss.getSheetByName('Results');
  if (!rSheet) {
    rSheet = ss.insertSheet('Results');
    rSheet.appendRow(['Timestamp', 'Nama', 'Total D', 'Total I', 'Total S', 'Total C', 'Answers JSON']);
    
    // Styling Header
    rSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#e0e0e0");
    rSheet.setFrozenRows(1);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getQuestions') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Questions');
    if (!sheet) return jsonResponse({ error: 'Sheet Questions tidak ditemukan' });

    const rows = sheet.getDataRange().getValues();
    rows.shift(); // Hapus baris header
    
    // Convert array baris ke JSON terstruktur
    const questions = rows.map(r => ({
      q: r[0],
      opts: [
        { t: r[1], k: r[2] },
        { t: r[3], k: r[4] },
        { t: r[5], k: r[6] },
        { t: r[7], k: r[8] }
      ].filter(o => o.t !== "") // Hapus opsi jika ada yang kosong
    }));
    
    return jsonResponse({ status: "success", questions: questions });
  }
  
  return jsonResponse({ error: 'Invalid action' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Results');
    
    if (data.action === "analyze" || data.answers) {
      sheet.appendRow([
        new Date(),
        data.name || "Anonymous",
        data.scores?.D || 0,
        data.scores?.I || 0,
        data.scores?.S || 0,
        data.scores?.C || 0,
        JSON.stringify(data.answers || [])
      ]);
    }
    return jsonResponse({ status: 'saved_to_gas' });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

// Helper untuk format response + CORS
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handling Pre-flight request dari Browser (jika GAS meneruskannya)
function doOptions(e) {
  return ContentService.createTextOutput("OK");
}