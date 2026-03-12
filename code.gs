// ============================================================
//  CareerAI — Google Apps Script Backend
//  Spreadsheet: "CareerAI Data"
//  Sheets yang dibuat otomatis oleh doSetup():
//    1. "Leads"       — Data lead (email) dari CV, LinkedIn, Quiz
//    2. "DISC_Results" — Hasil asesmen DISC
//    3. "Questions"   — Bank soal DISC (diambil via doGet)
// ============================================================

// ── CONFIG ──────────────────────────────────────────────────
const SPREADSHEET_NAME = "CareerAI Data";

const SHEET = {
  LEADS: "Leads",
  DISC: "DISC_Results",
  QUESTIONS: "Questions",
};

// ── SETUP (Run once manually) ───────────────────────────────
function doSetup() {
  let ss;

  // Coba cari spreadsheet yang sudah ada, atau buat baru
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
    Logger.log("📂 Spreadsheet ditemukan: " + ss.getUrl());
  } else {
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    Logger.log("✅ Spreadsheet baru dibuat: " + ss.getUrl());
  }

  // --- Sheet: Leads ---
  let leadsSheet = ss.getSheetByName(SHEET.LEADS);
  if (!leadsSheet) {
    leadsSheet = ss.insertSheet(SHEET.LEADS);
    leadsSheet.appendRow([
      "Timestamp",
      "Type",
      "Email",
      "Name",
      "LinkedIn",
      "Score",
      "Extra Data",
    ]);
    leadsSheet.getRange("1:1").setFontWeight("bold").setBackground("#18181b").setFontColor("#ffffff");
    leadsSheet.setFrozenRows(1);
    leadsSheet.setColumnWidths(1, 7, 180);
    Logger.log("📄 Sheet 'Leads' dibuat.");
  }

  // --- Sheet: DISC_Results ---
  let discSheet = ss.getSheetByName(SHEET.DISC);
  if (!discSheet) {
    discSheet = ss.insertSheet(SHEET.DISC);
    discSheet.appendRow([
      "Timestamp",
      "Name",
      "D",
      "I",
      "S",
      "C",
      "Dominant",
      "Answers (JSON)",
    ]);
    discSheet.getRange("1:1").setFontWeight("bold").setBackground("#18181b").setFontColor("#ffffff");
    discSheet.setFrozenRows(1);
    discSheet.setColumnWidths(1, 8, 160);
    Logger.log("📄 Sheet 'DISC_Results' dibuat.");
  }

  // --- Sheet: Questions ---
  let questionsSheet = ss.getSheetByName(SHEET.QUESTIONS);
  if (!questionsSheet) {
    questionsSheet = ss.insertSheet(SHEET.QUESTIONS);
    questionsSheet.appendRow([
      "Question",
      "Option_D",
      "Option_I",
      "Option_S",
      "Option_C",
    ]);
    questionsSheet.getRange("1:1").setFontWeight("bold").setBackground("#18181b").setFontColor("#ffffff");
    questionsSheet.setFrozenRows(1);
    questionsSheet.setColumnWidths(1, 5, 300);

    // Seed default questions
    const defaultQuestions = [
      [
        "Saat menghadapi krisis atau masalah mendesak di tempat kerja, insting pertama saya adalah...",
        "Langsung mengambil kendali, membuat keputusan cepat, dan bertindak.",
        "Mencairkan ketegangan, mengajak tim berdiskusi, dan mencari ide-ide kreatif.",
        "Menenangkan suasana, memastikan tim tetap solid, dan mencari solusi bersama.",
        "Mengumpulkan data, menganalisa akar masalah, dan mengevaluasi risiko secara logis.",
      ],
      [
        "Dalam sebuah project tim, peran yang paling membuat saya bersinar adalah...",
        "Pemimpin yang menetapkan target, mendelegasikan tugas, dan mendorong hasil.",
        "Penggagas ide dan motivator yang menjaga energi tim tetap tinggi.",
        "Eksekutor yang handal, menjaga harmoni, dan memastikan tugas selesai tepat waktu.",
        "Quality Control yang memastikan semua detail akurat dan sesuai standar.",
      ],
      [
        "Jika ada perubahan rencana mendadak dari manajemen, reaksi saya biasanya...",
        "Melihatnya sebagai tantangan baru yang menarik dan langsung tancap gas.",
        "Mencoba mencari sisi positifnya dan meyakinkan rekan lain agar tidak panik.",
        "Merasa kurang nyaman, saya butuh waktu untuk mencerna dan menyesuaikan ritme.",
        "Meminta penjelasan tertulis atau alasan logis di balik perubahan tersebut.",
      ],
      [
        "Gaya komunikasi saya sehari-hari paling pas dideskripsikan sebagai...",
        "Singkat, padat, to the point, dan berorientasi pada tujuan.",
        "Hangat, ekspresif, banyak bercerita, dan antusias.",
        "Tenang, menjadi pendengar yang baik, suportif, dan ramah.",
        "Spesifik, berbasis fakta, berhati-hati, dan tertulis (email/chat panjang).",
      ],
      [
        "Ketika harus presentasi di depan banyak orang, saya cenderung...",
        "Percaya diri dan langsung menyampaikan poin utama tanpa basa-basi.",
        "Membuat suasana seru dengan cerita, humor, dan interaksi penonton.",
        "Menyiapkan materi lengkap dan latihan berulang agar tidak ada kesalahan.",
        "Grogi tapi tetap menyampaikan — lebih suka presentasi 1-on-1 atau kelompok kecil.",
      ],
      [
        "Cara saya menangani konflik antar rekan kerja biasanya...",
        "Langsung konfrontasi untuk memecahkan masalah secepat mungkin.",
        "Mencoba jadi mediator yang mencairkan suasana dan membuat semua pihak nyaman.",
        "Mengambil peran di belakang layar, mendengarkan kedua sisi dulu sebelum bertindak.",
        "Menganalisa fakta secara objektif dan menyarankan solusi berbasis data.",
      ],
      [
        "Saat bekerja di bawah tekanan deadline ketat, respons natural saya adalah...",
        "Makin termotivasi — tekanan membuat saya lebih fokus dan produktif.",
        "Tetap optimis dan mengajak tim untuk saling menyemangati.",
        "Merasa cemas tapi tetap mengerjakan tugas secara bertahap dan konsisten.",
        "Membuat prioritas detail, checklist, dan timeline yang terstruktur rapi.",
      ],
      [
        "Dalam hal pengambilan keputusan penting, saya cenderung...",
        "Cepat memutuskan berdasarkan intuisi dan pengalaman — siap tanggung risiko.",
        "Diskusi dengan banyak orang dulu, lalu memutuskan berdasarkan konsensus.",
        "Butuh waktu lebih lama karena ingin memastikan semua pihak setuju dan nyaman.",
        "Mengumpulkan data sebanyak mungkin sebelum membuat keputusan final.",
      ],
    ];

    defaultQuestions.forEach((row) => questionsSheet.appendRow(row));
    Logger.log("📄 Sheet 'Questions' dibuat dengan " + defaultQuestions.length + " soal default.");
  }

  // Hapus sheet default "Sheet1" jika ada
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log("🎉 Setup selesai! URL: " + ss.getUrl());
  return ss.getUrl();
}

// ── HELPERS ─────────────────────────────────────────────────
function getSpreadsheet_() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (!files.hasNext()) {
    throw new Error("Spreadsheet '" + SPREADSHEET_NAME + "' belum ada. Jalankan doSetup() dulu.");
  }
  return SpreadsheetApp.open(files.next());
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getDominant_(scores) {
  let max = 0;
  let dominant = "D";
  for (const key in scores) {
    if (scores[key] > max) {
      max = scores[key];
      dominant = key;
    }
  }
  return dominant;
}

// ── doGet  (GET requests) ───────────────────────────────────
// Endpoints:
//   ?action=getQuestions  → Ambil soal DISC dari sheet Questions
//   ?action=health        → Health check
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "health";

  // --- getQuestions ---
  if (action === "getQuestions") {
    try {
      const ss = getSpreadsheet_();
      const sheet = ss.getSheetByName(SHEET.QUESTIONS);
      if (!sheet) return jsonResponse_({ questions: [] });

      const data = sheet.getDataRange().getValues();
      const questions = [];

      // Skip header (row 0)
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue; // skip empty

        questions.push({
          q: row[0],
          opts: [
            { k: "D", t: row[1] },
            { k: "I", t: row[2] },
            { k: "S", t: row[3] },
            { k: "C", t: row[4] },
          ],
        });
      }

      return jsonResponse_({ questions: questions });
    } catch (err) {
      return jsonResponse_({ error: err.message, questions: [] });
    }
  }

  // --- health ---
  return jsonResponse_({
    status: "ok",
    service: "CareerAI GAS Backend",
    timestamp: new Date().toISOString(),
  });
}

// ── doPost (POST requests) ──────────────────────────────────
// Handles two actions based on query param or body:
//   ?action=saveLead  → Simpan data lead (dari CV, LinkedIn, Quiz)
//   body.action=analyze → Simpan hasil asesmen DISC
function doPost(e) {
  try {
    // Parse body — bisa datang sebagai text/plain atau application/json
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        return jsonResponse_({ error: "Invalid JSON body", details: parseErr.message });
      }
    }

    // Determine action: query param > body.action
    const action = (e && e.parameter && e.parameter.action) || body.action || "";

    const ss = getSpreadsheet_();
    const now = new Date().toISOString();

    // ── ACTION: saveLead ──────────────────────────────────
    if (action === "saveLead") {
      const sheet = ss.getSheetByName(SHEET.LEADS);
      if (!sheet) return jsonResponse_({ error: "Sheet Leads not found. Run doSetup()." });

      const type = body.type || "UNKNOWN";
      const email = body.email || "";
      const name = body.name || "";
      const linkedin = body.linkedin || "";
      const score = body.score !== undefined ? body.score : "";
      const extra = body.score_json ? JSON.stringify(body.score_json) : "";

      sheet.appendRow([now, type, email, name, linkedin, score, extra]);

      return jsonResponse_({ success: true, action: "saveLead", type: type });
    }

    // ── ACTION: analyze (DISC backup) ─────────────────────
    if (action === "analyze") {
      const sheet = ss.getSheetByName(SHEET.DISC);
      if (!sheet) return jsonResponse_({ error: "Sheet DISC_Results not found. Run doSetup()." });

      const name = body.name || "Anonymous";
      const scores = body.scores || { D: 0, I: 0, S: 0, C: 0 };
      const answers = body.answers || [];
      const dominant = getDominant_(scores);

      sheet.appendRow([
        now,
        name,
        scores.D || 0,
        scores.I || 0,
        scores.S || 0,
        scores.C || 0,
        dominant,
        JSON.stringify(answers),
      ]);

      return jsonResponse_({
        success: true,
        action: "analyze",
        dominant: dominant,
        scores: scores,
      });
    }

    // ── UNKNOWN ACTION ────────────────────────────────────
    return jsonResponse_({ error: "Unknown action: " + action });

  } catch (err) {
    return jsonResponse_({ error: err.message });
  }
}
