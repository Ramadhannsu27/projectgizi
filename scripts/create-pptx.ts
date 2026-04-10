import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();

// ============================================================
// KONFIGURASI UKURAN & WARNA
// ============================================================
const PRIMARY_BLUE = "1E3A5F";   // Biru gelap utama
const ACCENT_GREEN = "22C55E";   // Hijau (gizi baik)
const ACCENT_YELLOW = "EAB308";   // Kuning (waspada)
const ACCENT_RED = "EF4444";     // Merah (gizi buruk)
const LIGHT_BG = "F8FAFC";        // Background terang
const DARK_TEXT = "1E293B";      // Teks gelap

// ============================================================
// SLIDE 1: COVER / JUDUL
// ============================================================
function createCoverSlide() {
  const slide = pptx.addSlide();
  slide.addImage({
    data: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1280&h=720&fit=crop",
    x: 0, y: 0, w: "100%", h: "100%",
  });

  // Overlay gradient effect ( rectangle transparan )
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: PRIMARY_BLUE, transparency: 40 },
  });

  // Garis dekoratif atas
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.15,
    fill: { color: ACCENT_GREEN },
  });

  // Logo / Judul
  slide.addText("🍽️", {
    x: 0, y: 1.2, w: "100%", fontSize: 72, align: "center",
  });

  slide.addText("PROJECT GIZI", {
    x: 0, y: 2.1, w: "100%", fontSize: 52, bold: true,
    color: "FFFFFF", align: "center",
    fontFace: "Arial Black",
  });

  slide.addText("Sistem Monitoring Status Gizi Anak Sekolah", {
    x: 0, y: 2.85, w: "100%", fontSize: 22,
    color: "FFFFFF", align: "center",
  });

  // Garis pemisah
  slide.addShape(pptx.ShapeType.rect, {
    x: 3.5, y: 3.3, w: 3, h: 0.05,
    fill: { color: ACCENT_GREEN },
  });

  slide.addText("MBG Developer", {
    x: 0, y: 3.6, w: "100%", fontSize: 16,
    color: "FFFFFF", align: "center",
  });

  slide.addText("2026", {
    x: 0, y: 3.9, w: "100%", fontSize: 14,
    color: "FFFFFF", align: "center", transparency: 40,
  });

  // Footer dekoratif
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.3, w: "100%", h: 0.25,
    fill: { color: ACCENT_GREEN, transparency: 30 },
  });
}

// ============================================================
// SLIDE 2: DAFTAR ISI
// ============================================================
function createTableOfContents() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  // Header bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("DAFTAR ISI", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 28, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  const tocItems = [
    { num: "01", title: "Latar Belakang", desc: "Kenapa Project Gizi dibuat?" },
    { num: "02", title: "Tujuan & Manfaat", desc: "Target dan manfaat sistem" },
    { num: "03", title: "Fitur Utama", desc: "Fungsi-fungsi sistem" },
    { num: "04", title: "Tech Stack", desc: "Teknologi yang digunakan" },
    { num: "05", title: "Arsitektur Database", desc: "Struktur tabel & relasi" },
    { num: "06", title: "API Endpoints", desc: "REST API yang tersedia" },
    { num: "07", title: "Halaman Aplikasi", desc: "Tampilan UI sistem" },
    { num: "08", title: "Kesimpulan", desc: "Ringkasan & next steps" },
  ];

  tocItems.forEach((item, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = col === 0 ? 0.6 : 5.3;
    const y = 1.3 + row * 1.0;

    // Box item
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 4.3, h: 0.85,
      fill: { color: "FFFFFF" },
      line: { color: "E2E8F0", width: 1 },
      rectRadius: 0.08,
    });

    // Number circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.15, y: y + 0.18, w: 0.5, h: 0.5,
      fill: { color: PRIMARY_BLUE },
    });

    slide.addText(item.num, {
      x: x + 0.15, y: y + 0.22, w: 0.5, h: 0.5,
      fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle",
    });

    slide.addText(item.title, {
      x: x + 0.75, y: y + 0.1, w: 3.3, h: 0.4,
      fontSize: 14, bold: true, color: DARK_TEXT,
    });

    slide.addText(item.desc, {
      x: x + 0.75, y: y + 0.45, w: 3.3, h: 0.3,
      fontSize: 11, color: "64748B",
    });
  });

  // Footer
  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10,
    color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 3: LATAR BELAKANG
// ============================================================
function createBackgroundSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  // Header
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("01  LATAR BELAKANG", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  // Left column - Problem
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.2, w: 4.3, h: 3.8,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 },
    rectRadius: 0.1,
  });

  slide.addText("⚠️", { x: 0.5, y: 1.35, w: 4.3, h: 0.5, fontSize: 32, align: "center" });

  slide.addText("Permasalahan", {
    x: 0.5, y: 1.85, w: 4.3, h: 0.4,
    fontSize: 18, bold: true, color: ACCENT_RED, align: "center",
  });

  slide.addText([
    { text: "Masalah gizi pada anak sekolah masih menjadi isu besar di Indonesia", options: { bullet: true, breakLine: true } },
    { text: "Pencatatan manual sering terjadi kesalahan dan duplikasi data", options: { bullet: true, breakLine: true } },
    { text: "Kesulitan dalam tracking perubahan status gizi siswa dari waktu ke waktu", options: { bullet: true, breakLine: true } },
    { text: "Laporan manual memakan waktu lama untuk dibuat", options: { bullet: true } },
  ], {
    x: 0.7, y: 2.35, w: 3.9, h: 2.5,
    fontSize: 12, color: DARK_TEXT, paraSpaceAfter: 8,
  });

  // Right column - Solution
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 1.2, w: 4.3, h: 3.8,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 },
    rectRadius: 0.1,
  });

  slide.addText("💡", { x: 5.2, y: 1.35, w: 4.3, h: 0.5, fontSize: 32, align: "center" });

  slide.addText("Solusi", {
    x: 5.2, y: 1.85, w: 4.3, h: 0.4,
    fontSize: 18, bold: true, color: ACCENT_GREEN, align: "center",
  });

  slide.addText([
    { text: "Sistem digital untuk pencatatan pengukuran siswa", options: { bullet: true, breakLine: true } },
    { text: "Perhitungan BMI & Z-Score otomatis", options: { bullet: true, breakLine: true } },
    { text: "Dashboard real-time untuk monitoring", options: { bullet: true, breakLine: true } },
    { text: "Export laporan dalam format Excel & PDF", options: { bullet: true } },
  ], {
    x: 5.4, y: 2.35, w: 3.9, h: 2.5,
    fontSize: 12, color: DARK_TEXT, paraSpaceAfter: 8,
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 4: TUJUAN & MANFAAT
// ============================================================
function createGoalsSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("02  TUJUAN & MANFAAT", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  const goals = [
    { icon: "🎯", title: "Tujuan Utama", items: ["Memonitor status gizi siswa secara berkala", "Mendeteksi dini gangguan gizi", "Mendukung program MBG (Makan Bergizi Gratis)"], color: PRIMARY_BLUE },
    { icon: "👨‍👩‍👧", title: "Untuk Sekolah", items: ["Data akurat siswa & pengukuran", "Laporan statistik otomatis", "Histori pertumbuhan siswa"], color: ACCENT_GREEN },
    { icon: "📊", title: "Untuk Pemerintah", items: ["Data agregat tingkat nasional", "Visualisasi sebaran gizi", "Dasar keputusan kebijakan"], color: ACCENT_YELLOW },
    { icon: "🏥", title: "Untuk Kesehatan", items: ["Rujukan jika ada gangguan gizi", "Tracking tren kesehatan siswa", "Integrasi dengan sistem kesehatan"], color: ACCENT_RED },
  ];

  goals.forEach((goal, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.5 : 5.2;
    const y = 1.2 + row * 2.0;

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 4.3, h: 1.85,
      fill: { color: "FFFFFF" },
      line: { color: "E2E8F0", width: 1 },
      rectRadius: 0.08,
    });

    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 0.12, h: 1.85,
      fill: { color: goal.color },
    });

    slide.addText(goal.icon + " " + goal.title, {
      x: x + 0.25, y: y + 0.1, w: 3.9, h: 0.4,
      fontSize: 14, bold: true, color: DARK_TEXT,
    });

    slide.addText(
      goal.items.map((item, idx) => ({
        text: item,
        options: { bullet: true, breakLine: idx < goal.items.length - 1 },
      })),
      { x: x + 0.25, y: y + 0.55, w: 3.9, h: 1.2, fontSize: 11, color: "475569", paraSpaceAfter: 4 }
    );
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 5: FITUR UTAMA
// ============================================================
function createFeaturesSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("03  FITUR UTAMA", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  const features = [
    { icon: "👤", title: "Manajemen Siswa", desc: "Tambah, edit, hapus data siswa dengan NIS unik" },
    { icon: "📏", title: "Input Pengukuran", desc: "Catat tinggi badan & berat badan dengan tanggal" },
    { icon: "📈", title: "Kalkulasi Otomatis", desc: "BMI & Z-Score dihitung langsung oleh sistem" },
    { icon: "📊", title: "Dashboard", desc: "Statistik real-time jumlah siswa per kategori gizi" },
    { icon: "📋", title: "Laporan", desc: "Export data ke Excel dan PDF" },
    { icon: "🔐", title: "Autentikasi", desc: "Login aman dengan NextAuth.js" },
    { icon: "📱", title: "Offline Support", desc: "PWA — bisa diakses offline di lapangan" },
    { icon: "🔄", title: "Sync Data", desc: "Sinkronisasi data antar perangkat" },
  ];

  features.forEach((feat, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.4 + col * 2.4;
    const y = 1.2 + row * 2.0;

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 2.25, h: 1.8,
      fill: { color: "FFFFFF" },
      line: { color: "E2E8F0", width: 1 },
      rectRadius: 0.08,
    });

    slide.addText(feat.icon, {
      x, y: y + 0.15, w: 2.25, h: 0.5,
      fontSize: 28, align: "center",
    });

    slide.addText(feat.title, {
      x: x + 0.1, y: y + 0.7, w: 2.05, h: 0.4,
      fontSize: 12, bold: true, color: DARK_TEXT, align: "center",
    });

    slide.addText(feat.desc, {
      x: x + 0.1, y: y + 1.1, w: 2.05, h: 0.6,
      fontSize: 10, color: "64748B", align: "center",
    });
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 6A: TECH STACK OVERVIEW
// ============================================================
function createTechStackSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("04  TECH STACK", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  const techCategories = [
    {
      category: "Frontend", color: "0EA5E9",
      items: [
        { name: "Next.js 16", desc: "React framework with App Router" },
        { name: "React 19", desc: "UI library modern" },
        { name: "Tailwind CSS 4", desc: "Utility-first styling" },
        { name: "Recharts", desc: "Chart & visualisasi data" },
      ]
    },
    {
      category: "Backend", color: "8B5CF6",
      items: [
        { name: "Next.js API Routes", desc: "Serverless API endpoints" },
        { name: "NextAuth.js", desc: "Autentikasi & session" },
        { name: "Drizzle ORM", desc: "Database ORM" },
        { name: "Zod", desc: "Validasi schema" },
      ]
    },
    {
      category: "Database", color: "F59E0B",
      items: [
        { name: "MySQL", desc: "Relational database" },
        { name: "Drizzle ORM", desc: "Type-safe queries" },
        { name: "Drizzle Kit", desc: "Migration & studio" },
        { name: "XAMPP", desc: "Local development" },
      ]
    },
    {
      category: "Tools & Library", color: "10B981",
      items: [
        { name: "TypeScript", desc: "Type safety" },
        { name: "PptxGenJS", desc: "Export laporan" },
        { name: "XLSX", desc: "Import/export Excel" },
        { name: "PWA", desc: "Offline capability" },
      ]
    },
  ];

  techCategories.forEach((cat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.5 : 5.2;
    const y = 1.1 + row * 2.2;

    // Category header
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 4.3, h: 0.45,
      fill: { color: cat.color },
      rectRadius: 0.06,
    });

    slide.addText(cat.category, {
      x, y: y + 0.05, w: 4.3, h: 0.4,
      fontSize: 14, bold: true, color: "FFFFFF", align: "center",
    });

    // Items
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: y + 0.45, w: 4.3, h: 1.6,
      fill: { color: "FFFFFF" },
      line: { color: "E2E8F0", width: 1 },
      rectRadius: 0.06,
    });

    cat.items.forEach((item, j) => {
      const itemY = y + 0.55 + j * 0.38;

      slide.addShape(pptx.ShapeType.ellipse, {
        x: x + 0.2, y: itemY + 0.05, w: 0.18, h: 0.18,
        fill: { color: cat.color },
      });

      slide.addText(item.name, {
        x: x + 0.5, y: itemY, w: 1.6, h: 0.3,
        fontSize: 11, bold: true, color: DARK_TEXT,
      });

      slide.addText(item.desc, {
        x: x + 2.1, y: itemY, w: 2.0, h: 0.3,
        fontSize: 10, color: "64748B",
      });
    });
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 6B: TECH STACK DETAIL - FRONTEND
// ============================================================
function createTechStackDetailFrontend() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: "0EA5E9" },
  });

  slide.addText("04A  TECH STACK — FRONTEND", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  // Next.js Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.05, w: 4.3, h: 2.3,
    fill: { color: "FFFFFF" },
    line: { color: "0EA5E9", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("⚛️ Next.js 16.2.2", {
    x: 0.5, y: 1.1, w: 4.3, h: 0.4,
    fontSize: 14, bold: true, color: "0EA5E9", align: "center",
  });

  slide.addText("Fungsi:", {
    x: 0.65, y: 1.5, w: 1.0, h: 0.25,
    fontSize: 10, bold: true, color: DARK_TEXT,
  });

  slide.addText([
    { text: "App Router — routing berbasis file system", options: { bullet: true, breakLine: true } },
    { text: "Server Components — render di server", options: { bullet: true, breakLine: true } },
    { text: "API Routes — buat endpoint REST", options: { bullet: true, breakLine: true } },
    { text: "Turbopack — build tool terbaru", options: { bullet: true } },
  ], {
    x: 0.65, y: 1.75, w: 4.0, h: 1.1,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("// Contoh Route", {
    x: 0.65, y: 2.85, w: 4.0, h: 0.2,
    fontSize: 9, bold: true, color: "0EA5E9", fontFace: "Courier New",
  });

  slide.addText("src/app/api/students/route.ts", {
    x: 0.65, y: 3.0, w: 4.0, h: 0.2,
    fontSize: 9, color: "64748B", fontFace: "Courier New",
  });

  // React Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 1.05, w: 4.3, h: 2.3,
    fill: { color: "FFFFFF" },
    line: { color: "61DAFB", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("⚛️ React 19.2.4", {
    x: 5.2, y: 1.1, w: 4.3, h: 0.4,
    fontSize: 14, bold: true, color: "0EA5E9", align: "center",
  });

  slide.addText("Fungsi:", {
    x: 5.35, y: 1.5, w: 1.0, h: 0.25,
    fontSize: 10, bold: true, color: DARK_TEXT,
  });

  slide.addText([
    { text: "Component-based architecture", options: { bullet: true, breakLine: true } },
    { text: "Hooks — useState, useEffect, useContext", options: { bullet: true, breakLine: true } },
    { text: "Server Components (RSC)", options: { bullet: true, breakLine: true } },
    { text: "Concurrent rendering", options: { bullet: true } },
  ], {
    x: 5.35, y: 1.75, w: 4.0, h: 1.1,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("// Contoh Component", {
    x: 5.35, y: 2.85, w: 4.0, h: 0.2,
    fontSize: 9, bold: true, color: "0EA5E9", fontFace: "Courier New",
  });

  slide.addText("function StudentList() {\n  const [students, setStudents] = useState([])", {
    x: 5.35, y: 3.0, w: 4.0, h: 0.4,
    fontSize: 8, color: "64748B", fontFace: "Courier New",
  });

  // Tailwind Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.5, w: 4.3, h: 1.55,
    fill: { color: "FFFFFF" },
    line: { color: "38BDF8", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("🎨 Tailwind CSS 4", {
    x: 0.5, y: 3.55, w: 4.3, h: 0.35,
    fontSize: 13, bold: true, color: "0EA5E9", align: "center",
  });

  slide.addText([
    { text: "Utility-first CSS — styling langsung di class", options: { bullet: true, breakLine: true } },
    { text: "Responsive design — sm:, md:, lg:", options: { bullet: true, breakLine: true } },
    { text: "Dark mode support — dark:", options: { bullet: true } },
  ], {
    x: 0.65, y: 3.9, w: 4.0, h: 0.8,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("<div className=\"p-4 bg-blue-500 rounded-lg\">", {
    x: 0.65, y: 4.7, w: 4.0, h: 0.25,
    fontSize: 9, color: "64748B", fontFace: "Courier New",
  });

  // Recharts Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 3.5, w: 4.3, h: 1.55,
    fill: { color: "FFFFFF" },
    line: { color: "22D3EE", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("📊 Recharts 3.8.1", {
    x: 5.2, y: 3.55, w: 4.3, h: 0.35,
    fontSize: 13, bold: true, color: "0EA5E9", align: "center",
  });

  slide.addText([
    { text: "Chart library berbasis React + SVG", options: { bullet: true, breakLine: true } },
    { text: "PieChart, BarChart, LineChart, dll", options: { bullet: true, breakLine: true } },
    { text: "Customizable & responsive", options: { bullet: true } },
  ], {
    x: 5.35, y: 3.9, w: 4.0, h: 0.8,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("<PieChart data={data} />", {
    x: 5.35, y: 4.7, w: 4.0, h: 0.25,
    fontSize: 9, color: "64748B", fontFace: "Courier New",
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 6C: TECH STACK DETAIL - BACKEND
// ============================================================
function createTechStackDetailBackend() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: "8B5CF6" },
  });

  slide.addText("04B  TECH STACK — BACKEND", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  // NextAuth.js Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.05, w: 4.3, h: 2.6,
    fill: { color: "FFFFFF" },
    line: { color: "8B5CF6", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("🔐 NextAuth.js 5.0 (Beta)", {
    x: 0.5, y: 1.1, w: 4.3, h: 0.4,
    fontSize: 13, bold: true, color: "8B5CF6", align: "center",
  });

  slide.addText("Fungsi:", {
    x: 0.65, y: 1.5, w: 1.0, h: 0.25,
    fontSize: 10, bold: true, color: DARK_TEXT,
  });

  slide.addText([
    { text: "Autentikasi — login/logout user", options: { bullet: true, breakLine: true } },
    { text: "Session management — JWT atau database session", options: { bullet: true, breakLine: true } },
    { text: "Credential provider — login dengan email/password", options: { bullet: true, breakLine: true } },
    { text: "Middleware protection — lindungi route API", options: { bullet: true, breakLine: true } },
    { text: "Type-safe — full TypeScript support", options: { bullet: true } },
  ], {
    x: 0.65, y: 1.75, w: 4.0, h: 1.3,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("// Konfigurasi", {
    x: 0.65, y: 3.05, w: 4.0, h: 0.2,
    fontSize: 9, bold: true, color: "8B5CF6", fontFace: "Courier New",
  });

  slide.addText("auth.ts → export { handlers, auth }", {
    x: 0.65, y: 3.2, w: 4.0, h: 0.3,
    fontSize: 9, color: "64748B", fontFace: "Courier New",
  });

  // Drizzle ORM Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 1.05, w: 4.3, h: 2.6,
    fill: { color: "FFFFFF" },
    line: { color: "A78BFA", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("🗄️ Drizzle ORM 0.45.2", {
    x: 5.2, y: 1.1, w: 4.3, h: 0.4,
    fontSize: 13, bold: true, color: "8B5CF6", align: "center",
  });

  slide.addText("Fungsi:", {
    x: 5.35, y: 1.5, w: 1.0, h: 0.25,
    fontSize: 10, bold: true, color: DARK_TEXT,
  });

  slide.addText([
    { text: "Type-safe database queries", options: { bullet: true, breakLine: true } },
    { text: "Schema definition — definisi tabel", options: { bullet: true, breakLine: true } },
    { text: "Relations — relasi antar tabel", options: { bullet: true, breakLine: true } },
    { text: "Migration — Drizzle Kit", options: { bullet: true, breakLine: true } },
    { text: "MySQL, PostgreSQL, SQLite support", options: { bullet: true } },
  ], {
    x: 5.35, y: 1.75, w: 4.0, h: 1.3,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("// Contoh Schema", {
    x: 5.35, y: 3.05, w: 4.0, h: 0.2,
    fontSize: 9, bold: true, color: "8B5CF6", fontFace: "Courier New",
  });

  slide.addText("export const students = mysqlTable(\n  (\"students\", { id: int().primaryKey() })", {
    x: 5.35, y: 3.2, w: 4.0, h: 0.5,
    fontSize: 8, color: "64748B", fontFace: "Courier New",
  });

  // Zod Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.8, w: 4.3, h: 1.25,
    fill: { color: "FFFFFF" },
    line: { color: "C4B5FD", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("✅ Zod 4.3.6", {
    x: 0.5, y: 3.85, w: 4.3, h: 0.35,
    fontSize: 13, bold: true, color: "8B5CF6", align: "center",
  });

  slide.addText([
    { text: "Schema validation — validasi data input", options: { bullet: true, breakLine: true } },
    { text: "Type inference — generate TypeScript type", options: { bullet: true, breakLine: true } },
    { text: "Error messages — pesan error kustom", options: { bullet: true } },
  ], {
    x: 0.65, y: 4.2, w: 4.0, h: 0.75,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  // bcryptjs Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 3.8, w: 4.3, h: 1.25,
    fill: { color: "FFFFFF" },
    line: { color: "DDD6FE", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("🔒 bcryptjs 3.0.3", {
    x: 5.2, y: 3.85, w: 4.3, h: 0.35,
    fontSize: 13, bold: true, color: "8B5CF6", align: "center",
  });

  slide.addText([
    { text: "Password hashing — enkripsi password", options: { bullet: true, breakLine: true } },
    { text: "Salt rounds — keamanan tambahan", options: { bullet: true, breakLine: true } },
    { text: "Compare — verifikasi password", options: { bullet: true } },
  ], {
    x: 5.35, y: 4.2, w: 4.0, h: 0.75,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 6D: TECH STACK DETAIL - DATABASE
// ============================================================
function createTechStackDetailDatabase() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: "F59E0B" },
  });

  slide.addText("04C  TECH STACK — DATABASE", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  // MySQL Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.05, w: 4.3, h: 2.8,
    fill: { color: "FFFFFF" },
    line: { color: "F59E0B", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("🗄️ MySQL", {
    x: 0.5, y: 1.1, w: 4.3, h: 0.4,
    fontSize: 14, bold: true, color: "F59E0B", align: "center",
  });

  slide.addText("Fungsi:", {
    x: 0.65, y: 1.5, w: 1.0, h: 0.25,
    fontSize: 10, bold: true, color: DARK_TEXT,
  });

  slide.addText([
    { text: "Relational Database — simpan data terstruktur", options: { bullet: true, breakLine: true } },
    { text: "ACID compliant — transaksi aman", options: { bullet: true, breakLine: true } },
    { text: "Indeks — query cepat", options: { bullet: true, breakLine: true } },
    { text: "Foreign Key — relasi antar tabel", options: { bullet: true, breakLine: true } },
    { text: "JSON support — data fleksibel", options: { bullet: true } },
  ], {
    x: 0.65, y: 1.75, w: 4.0, h: 1.4,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("// Contoh SQL", {
    x: 0.65, y: 3.15, w: 4.0, h: 0.2,
    fontSize: 9, bold: true, color: "F59E0B", fontFace: "Courier New",
  });

  slide.addText("CREATE TABLE students (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  nis VARCHAR(50) UNIQUE\n);", {
    x: 0.65, y: 3.3, w: 4.0, h: 0.55,
    fontSize: 8, color: "64748B", fontFace: "Courier New",
  });

  // XAMPP Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 1.05, w: 4.3, h: 2.8,
    fill: { color: "FFFFFF" },
    line: { color: "FBBF24", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("🏠 XAMPP", {
    x: 5.2, y: 1.1, w: 4.3, h: 0.4,
    fontSize: 14, bold: true, color: "F59E0B", align: "center",
  });

  slide.addText("Fungsi:", {
    x: 5.35, y: 1.5, w: 1.0, h: 0.25,
    fontSize: 10, bold: true, color: DARK_TEXT,
  });

  slide.addText([
    { text: "Local development environment", options: { bullet: true, breakLine: true } },
    { text: "Apache — web server", options: { bullet: true, breakLine: true } },
    { text: "MySQL — database server", options: { bullet: true, breakLine: true } },
    { text: "PHP & Perl — backend languages", options: { bullet: true, breakLine: true } },
    { text: "phpMyAdmin — GUI untuk MySQL", options: { bullet: true } },
  ], {
    x: 5.35, y: 1.75, w: 4.0, h: 1.4,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("// Struktur Folder", {
    x: 5.35, y: 3.15, w: 4.0, h: 0.2,
    fontSize: 9, bold: true, color: "F59E0B", fontFace: "Courier New",
  });

  slide.addText("C:\\xampp\\htdocs\\projectgizi\n  └── src/\n  └── public/\n  └── ...", {
    x: 5.35, y: 3.3, w: 4.0, h: 0.55,
    fontSize: 8, color: "64748B", fontFace: "Courier New",
  });

  // Drizzle Kit Detail
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 4.0, w: 9.0, h: 1.15,
    fill: { color: "FFFFFF" },
    line: { color: "FCD34D", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("🔧 Drizzle Kit 0.31.10 — CLI untuk Database Migration", {
    x: 0.65, y: 4.05, w: 8.7, h: 0.35,
    fontSize: 12, bold: true, color: "F59E0B",
  });

  slide.addText([
    { text: "push — push schema ke database (buat/update tabel)", options: { bullet: true, breakLine: true } },
    { text: "studio — GUI browser untuk melihat data", options: { bullet: true, breakLine: true } },
    { text: "generate — generate SQL dari schema TypeScript", options: { bullet: true, breakLine: true } },
    { text: "drop — hapus tabel ( hati-hati! )", options: { bullet: true } },
  ], {
    x: 0.65, y: 4.4, w: 8.7, h: 0.7,
    fontSize: 10, color: "475569", paraSpaceAfter: 2,
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 6E: TECH STACK DETAIL - TOOLS
// ============================================================
function createTechStackDetailTools() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: "10B981" },
  });

  slide.addText("04D  TECH STACK — TOOLS & LIBRARIES", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  // TypeScript
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.05, w: 2.9, h: 2.3,
    fill: { color: "FFFFFF" },
    line: { color: "10B981", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("📘 TypeScript 5", {
    x: 0.5, y: 1.1, w: 2.9, h: 0.4,
    fontSize: 13, bold: true, color: "10B981", align: "center",
  });

  slide.addText([
    { text: "Type safety", options: { bullet: true, breakLine: true } },
    { text: "Compile-time error", options: { bullet: true, breakLine: true } },
    { text: "IntelliSense support", options: { bullet: true, breakLine: true } },
    { text: "Interface & Generics", options: { bullet: true } },
  ], {
    x: 0.65, y: 1.5, w: 2.6, h: 1.0,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("// Contoh Type\ninterface Student {\n  id: number;\n  name: string;\n}", {
    x: 0.65, y: 2.55, w: 2.6, h: 0.7,
    fontSize: 8, color: "64748B", fontFace: "Courier New",
  });

  // XLSX
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 3.55, y: 1.05, w: 2.9, h: 2.3,
    fill: { color: "FFFFFF" },
    line: { color: "34D399", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("📗 XLSX 0.18.5", {
    x: 3.55, y: 1.1, w: 2.9, h: 0.4,
    fontSize: 13, bold: true, color: "10B981", align: "center",
  });

  slide.addText([
    { text: "Read Excel (.xlsx)", options: { bullet: true, breakLine: true } },
    { text: "Write Excel export", options: { bullet: true, breakLine: true } },
    { text: "Parse & transform data", options: { bullet: true, breakLine: true } },
    { text: "Batch processing", options: { bullet: true } },
  ], {
    x: 3.7, y: 1.5, w: 2.6, h: 1.0,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("// Import Excel\nconst workbook =\n  XLSX.read(data)", {
    x: 3.7, y: 2.55, w: 2.6, h: 0.7,
    fontSize: 8, color: "64748B", fontFace: "Courier New",
  });

  // PptxGenJS
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.6, y: 1.05, w: 2.9, h: 2.3,
    fill: { color: "FFFFFF" },
    line: { color: "6EE7B7", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("📙 PptxGenJS", {
    x: 6.6, y: 1.1, w: 2.9, h: 0.4,
    fontSize: 13, bold: true, color: "10B981", align: "center",
  });

  slide.addText([
    { text: "Generate .pptx file", options: { bullet: true, breakLine: true } },
    { text: "Text, shapes, images", options: { bullet: true, breakLine: true } },
    { text: "Tables & charts", options: { bullet: true, breakLine: true } },
    { text: "Node.js compatible", options: { bullet: true } },
  ], {
    x: 6.75, y: 1.5, w: 2.6, h: 1.0,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("// Generate PPT\nconst pptx =\n  new PptxGenJS()\npptx.addSlide()", {
    x: 6.75, y: 2.55, w: 2.6, h: 0.7,
    fontSize: 8, color: "64748B", fontFace: "Courier New",
  });

  // PWA & Lucide
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.5, w: 4.3, h: 1.55,
    fill: { color: "FFFFFF" },
    line: { color: "A7F3D0", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("📱 PWA (Progressive Web App)", {
    x: 0.5, y: 3.55, w: 4.3, h: 0.35,
    fontSize: 13, bold: true, color: "10B981", align: "center",
  });

  slide.addText([
    { text: "Offline support — Service Worker", options: { bullet: true, breakLine: true } },
    { text: "Installable — add to home screen", options: { bullet: true, breakLine: true } },
    { text: "manifest.json — konfigurasi PWA", options: { bullet: true, breakLine: true } },
    { text: "sw.js — Service Worker script", options: { bullet: true } },
  ], {
    x: 0.65, y: 3.9, w: 4.0, h: 1.0,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  // Lucide Icons
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 3.5, w: 4.3, h: 1.55,
    fill: { color: "FFFFFF" },
    line: { color: "BBF7D0", width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("🎭 Lucide React 1.7.0", {
    x: 5.2, y: 3.55, w: 4.3, h: 0.35,
    fontSize: 13, bold: true, color: "10B981", align: "center",
  });

  slide.addText([
    { text: "Icon library — 1000+ icons SVG", options: { bullet: true, breakLine: true } },
    { text: "Tree-shakeable — import hanya yang dipakai", options: { bullet: true, breakLine: true } },
    { text: "Customizable size, color, stroke", options: { bullet: true, breakLine: true } },
    { text: "import { User } from \"lucide-react\"", options: { bullet: true } },
  ], {
    x: 5.35, y: 3.9, w: 4.0, h: 1.0,
    fontSize: 10, color: "475569", paraSpaceAfter: 3,
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 7: ARSITEKTUR DATABASE
// ============================================================
function createDatabaseSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("05  ARSITEKTUR DATABASE", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  // Table 1: users
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.1, w: 2.8, h: 1.6,
    fill: { color: "FFFFFF" },
    line: { color: "8B5CF6", width: 2 },
    rectRadius: 0.08,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.1, w: 2.8, h: 0.4,
    fill: { color: "8B5CF6" },
  });

  slide.addText("👤 users", {
    x: 0.5, y: 1.12, w: 2.8, h: 0.4,
    fontSize: 12, bold: true, color: "FFFFFF", align: "center",
  });

  const userFields = [
    { name: "id (PK)", type: "INT AUTO" },
    { name: "full_name", type: "VARCHAR" },
    { name: "email", type: "VARCHAR UNIQUE" },
    { name: "password_hash", type: "VARCHAR" },
    { name: "created_at", type: "DATETIME" },
  ];

  userFields.forEach((field, i) => {
    slide.addText(`${field.name}  ${field.type}`, {
      x: 0.6, y: 1.55 + i * 0.2, w: 2.6, h: 0.2,
      fontSize: 9, color: DARK_TEXT, fontFace: "Courier New",
    });
  });

  // Table 2: students
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 3.6, y: 1.1, w: 2.8, h: 2.0,
    fill: { color: "FFFFFF" },
    line: { color: "0EA5E9", width: 2 },
    rectRadius: 0.08,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 3.6, y: 1.1, w: 2.8, h: 0.4,
    fill: { color: "0EA5E9" },
  });

  slide.addText("👨‍🎓 students", {
    x: 3.6, y: 1.12, w: 2.8, h: 0.4,
    fontSize: 12, bold: true, color: "FFFFFF", align: "center",
  });

  const studentFields = [
    { name: "id (PK)", type: "INT AUTO" },
    { name: "nis", type: "VARCHAR UNIQUE" },
    { name: "full_name", type: "VARCHAR" },
    { name: "gender", type: "VARCHAR (L/P)" },
    { name: "birth_date", type: "DATE" },
    { name: "class_name", type: "VARCHAR" },
    { name: "school_name", type: "VARCHAR" },
    { name: "parent_name", type: "VARCHAR" },
    { name: "parent_phone", type: "VARCHAR" },
    { name: "created_at", type: "DATETIME" },
  ];

  studentFields.forEach((field, i) => {
    slide.addText(`${field.name}  ${field.type}`, {
      x: 3.7, y: 1.55 + i * 0.18, w: 2.6, h: 0.18,
      fontSize: 8.5, color: DARK_TEXT, fontFace: "Courier New",
    });
  });

  // Table 3: measurements
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.7, y: 1.1, w: 2.8, h: 2.0,
    fill: { color: "FFFFFF" },
    line: { color: ACCENT_GREEN, width: 2 },
    rectRadius: 0.08,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 6.7, y: 1.1, w: 2.8, h: 0.4,
    fill: { color: ACCENT_GREEN },
  });

  slide.addText("📏 measurements", {
    x: 6.7, y: 1.12, w: 2.8, h: 0.4,
    fontSize: 12, bold: true, color: "FFFFFF", align: "center",
  });

  const measurementFields = [
    { name: "id (PK)", type: "INT AUTO" },
    { name: "student_id (FK)", type: "→ students" },
    { name: "user_id (FK)", type: "→ users" },
    { name: "height", type: "DECIMAL(5,2)" },
    { name: "weight", type: "DECIMAL(5,2)" },
    { name: "bmi", type: "DECIMAL(5,2)" },
    { name: "z_score", type: "DECIMAL(6,4)" },
    { name: "status_category", type: "VARCHAR" },
    { name: "notes", type: "TEXT" },
    { name: "checked_at", type: "DATETIME" },
    { name: "is_synced", type: "BOOLEAN" },
  ];

  measurementFields.forEach((field, i) => {
    slide.addText(`${field.name}  ${field.type}`, {
      x: 6.8, y: 1.55 + i * 0.165, w: 2.6, h: 0.165,
      fontSize: 8, color: DARK_TEXT, fontFace: "Courier New",
    });
  });

  // Relationships arrows
  slide.addShape(pptx.ShapeType.line, {
    x: 3.3, y: 1.9, w: 0.3, h: 0,
    line: { color: "64748B", width: 1.5, dashType: "solid" },
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 6.4, y: 2.0, w: 0.3, h: 0,
    line: { color: "64748B", width: 1.5, dashType: "solid" },
  });

  // Legend
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.5, w: 9.0, h: 1.5,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 },
    rectRadius: 0.08,
  });

  slide.addText("📌 Relasi Tabel", {
    x: 0.7, y: 3.6, w: 8.6, h: 0.35,
    fontSize: 12, bold: true, color: DARK_TEXT,
  });

  slide.addText([
    { text: "users → measurements  :  1 user bisa membuat banyak pengukuran (1:N)", options: { bullet: true, breakLine: true } },
    { text: "students → measurements  :  1 siswa bisa memiliki banyak pengukuran (1:N)", options: { bullet: true, breakLine: true } },
    { text: "Database engine: MySQL  |  ORM: Drizzle ORM  |  Menggunakan Drizzle Kit untuk migrasi", options: { bullet: true } },
  ], {
    x: 0.7, y: 3.95, w: 8.6, h: 1.0,
    fontSize: 11, color: "475569", paraSpaceAfter: 4,
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 8A: API ENDPOINTS - PART 1
// ============================================================
function createAPISlidePart1() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("06  API ENDPOINTS — PART 1", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  const apiGroups = [
    {
      title: "Auth", color: "8B5CF6",
      apis: [
        { method: "POST", path: "/api/auth/login", desc: "Login user" },
        { method: "POST", path: "/api/auth/logout", desc: "Logout user" },
      ]
    },
    {
      title: "Students", color: "0EA5E9",
      apis: [
        { method: "GET", path: "/api/students", desc: "List semua siswa" },
        { method: "POST", path: "/api/students", desc: "Tambah siswa baru" },
        { method: "GET", path: "/api/students/[id]", desc: "Detail siswa" },
        { method: "PUT", path: "/api/students/[id]", desc: "Update siswa" },
        { method: "DELETE", path: "/api/students/[id]", desc: "Hapus siswa" },
      ]
    },
  ];

  let yPos = 1.05;
  const methodColors: Record<string, string> = {
    GET: "22C55E",
    POST: "3B82F6",
    PUT: "F59E0B",
    DELETE: "EF4444",
  };

  apiGroups.forEach((group) => {
    // Group header
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yPos, w: 9.0, h: 0.35,
      fill: { color: group.color },
    });

    slide.addText(group.title, {
      x: 0.6, y: yPos + 0.02, w: 2, h: 0.35,
      fontSize: 11, bold: true, color: "FFFFFF",
    });

    yPos += 0.35;

    group.apis.forEach((api) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: yPos, w: 9.0, h: 0.35,
        fill: { color: "FFFFFF" },
        line: { color: "F1F5F9", width: 0.5 },
        rectRadius: 0.04,
      });

      // Method badge
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6, y: yPos + 0.06, w: 0.65, h: 0.24,
        fill: { color: methodColors[api.method] || "64748B" },
        rectRadius: 0.04,
      });

      slide.addText(api.method, {
        x: 0.6, y: yPos + 0.04, w: 0.65, h: 0.24,
        fontSize: 8, bold: true, color: "FFFFFF", align: "center", valign: "middle",
      });

      slide.addText(api.path, {
        x: 1.35, y: yPos + 0.05, w: 4.5, h: 0.25,
        fontSize: 10, color: DARK_TEXT, fontFace: "Courier New",
      });

      slide.addText(api.desc, {
        x: 5.9, y: yPos + 0.05, w: 3.5, h: 0.25,
        fontSize: 10, color: "64748B",
      });

      yPos += 0.35;
    });

    yPos += 0.1;
  });

  // Lanjut ke part 2
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.5, y: 5.0, w: 2.0, h: 0.35,
    fill: { color: PRIMARY_BLUE },
    rectRadius: 0.06,
  });

  slide.addText("→ Part 2 →", {
    x: 7.5, y: 5.0, w: 2.0, h: 0.35,
    fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle",
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 8B: API ENDPOINTS — STUDENTS IMPORT/EXPORT
// ============================================================
function createAPISlidePart1b() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("07  STUDENTS IMPORT / EXPORT", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  const apiGroups = [
    {
      title: "Students Import / Export", color: "0EA5E9",
      apis: [
        { method: "GET", path: "/api/students/[id]/history", desc: "Riwayat pengukuran siswa" },
        { method: "POST", path: "/api/students/import", desc: "Import data siswa dari Excel" },
        { method: "GET", path: "/api/students/export", desc: "Export data siswa ke Excel" },
      ]
    },
  ];

  let yPos = 1.05;
  const methodColors: Record<string, string> = {
    GET: "22C55E",
    POST: "3B82F6",
    PUT: "F59E0B",
    DELETE: "EF4444",
  };

  apiGroups.forEach((group) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yPos, w: 9.0, h: 0.35,
      fill: { color: group.color },
    });

    slide.addText(group.title, {
      x: 0.6, y: yPos + 0.02, w: 4, h: 0.35,
      fontSize: 11, bold: true, color: "FFFFFF",
    });

    yPos += 0.35;

    group.apis.forEach((api) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: yPos, w: 9.0, h: 0.4,
        fill: { color: "FFFFFF" },
        line: { color: "F1F5F9", width: 0.5 },
        rectRadius: 0.04,
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6, y: yPos + 0.08, w: 0.65, h: 0.24,
        fill: { color: methodColors[api.method] || "64748B" },
        rectRadius: 0.04,
      });

      slide.addText(api.method, {
        x: 0.6, y: yPos + 0.06, w: 0.65, h: 0.24,
        fontSize: 8, bold: true, color: "FFFFFF", align: "center", valign: "middle",
      });

      slide.addText(api.path, {
        x: 1.35, y: yPos + 0.08, w: 4.5, h: 0.25,
        fontSize: 10, color: DARK_TEXT, fontFace: "Courier New",
      });

      slide.addText(api.desc, {
        x: 5.9, y: yPos + 0.08, w: 3.5, h: 0.25,
        fontSize: 10, color: "64748B",
      });

      yPos += 0.4;
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.5, y: 5.0, w: 2.0, h: 0.35,
    fill: { color: PRIMARY_BLUE },
    rectRadius: 0.06,
  });

  slide.addText("→ Part 1c →", {
    x: 7.5, y: 5.0, w: 2.0, h: 0.35,
    fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle",
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 8C: API ENDPOINTS — MEASUREMENTS
// ============================================================
function createAPISlidePart1c() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("08  MEASUREMENTS ENDPOINTS", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  const apiGroups = [
    {
      title: "Measurements", color: ACCENT_GREEN,
      apis: [
        { method: "GET", path: "/api/measurements", desc: "List semua pengukuran" },
        { method: "POST", path: "/api/measurements", desc: "Tambah pengukuran baru" },
        { method: "GET", path: "/api/measurements/[id]", desc: "Detail pengukuran" },
        { method: "PUT", path: "/api/measurements/[id]", desc: "Update pengukuran" },
        { method: "GET", path: "/api/measurements/summary", desc: "Ringkasan statistik gizi" },
        { method: "POST", path: "/api/measurements/sync", desc: "Sync data dari offline" },
      ]
    },
  ];

  let yPos = 1.05;
  const methodColors: Record<string, string> = {
    GET: "22C55E",
    POST: "3B82F6",
    PUT: "F59E0B",
    DELETE: "EF4444",
  };

  apiGroups.forEach((group) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yPos, w: 9.0, h: 0.35,
      fill: { color: group.color },
    });

    slide.addText(group.title, {
      x: 0.6, y: yPos + 0.02, w: 3, h: 0.35,
      fontSize: 11, bold: true, color: "FFFFFF",
    });

    yPos += 0.35;

    group.apis.forEach((api) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: yPos, w: 9.0, h: 0.4,
        fill: { color: "FFFFFF" },
        line: { color: "F1F5F9", width: 0.5 },
        rectRadius: 0.04,
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6, y: yPos + 0.08, w: 0.65, h: 0.24,
        fill: { color: methodColors[api.method] || "64748B" },
        rectRadius: 0.04,
      });

      slide.addText(api.method, {
        x: 0.6, y: yPos + 0.06, w: 0.65, h: 0.24,
        fontSize: 8, bold: true, color: "FFFFFF", align: "center", valign: "middle",
      });

      slide.addText(api.path, {
        x: 1.35, y: yPos + 0.08, w: 4.5, h: 0.25,
        fontSize: 10, color: DARK_TEXT, fontFace: "Courier New",
      });

      slide.addText(api.desc, {
        x: 5.9, y: yPos + 0.08, w: 3.5, h: 0.25,
        fontSize: 10, color: "64748B",
      });

      yPos += 0.4;
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.5, y: 5.0, w: 2.0, h: 0.35,
    fill: { color: PRIMARY_BLUE },
    rectRadius: 0.06,
  });

  slide.addText("→ Part 2 →", {
    x: 7.5, y: 5.0, w: 2.0, h: 0.35,
    fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle",
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 8D: API ENDPOINTS — CALCULATE & RENAME
// ============================================================
function createAPISlidePart1d() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("09  CALCULATE & RENAME ENDPOINTS", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  const apiGroups = [
    {
      title: "Calculate", color: ACCENT_YELLOW,
      apis: [
        { method: "GET", path: "/api/calculate", desc: "Hitung BMI & Z-Score" },
      ]
    },
    {
      title: "Rename", color: ACCENT_RED,
      apis: [
        { method: "POST", path: "/api/students/student", desc: "Ambil data siswa by ID" },
      ]
    },
  ];

  let yPos = 1.05;
  const methodColors: Record<string, string> = {
    GET: "22C55E",
    POST: "3B82F6",
    PUT: "F59E0B",
    DELETE: "EF4444",
  };

  apiGroups.forEach((group) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yPos, w: 9.0, h: 0.35,
      fill: { color: group.color },
    });

    slide.addText(group.title, {
      x: 0.6, y: yPos + 0.02, w: 3, h: 0.35,
      fontSize: 11, bold: true, color: "FFFFFF",
    });

    yPos += 0.35;

    group.apis.forEach((api) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: yPos, w: 9.0, h: 0.4,
        fill: { color: "FFFFFF" },
        line: { color: "F1F5F9", width: 0.5 },
        rectRadius: 0.04,
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6, y: yPos + 0.08, w: 0.65, h: 0.24,
        fill: { color: methodColors[api.method] || "64748B" },
        rectRadius: 0.04,
      });

      slide.addText(api.method, {
        x: 0.6, y: yPos + 0.06, w: 0.65, h: 0.24,
        fontSize: 8, bold: true, color: "FFFFFF", align: "center", valign: "middle",
      });

      slide.addText(api.path, {
        x: 1.35, y: yPos + 0.08, w: 4.5, h: 0.25,
        fontSize: 10, color: DARK_TEXT, fontFace: "Courier New",
      });

      slide.addText(api.desc, {
        x: 5.9, y: yPos + 0.08, w: 3.5, h: 0.25,
        fontSize: 10, color: "64748B",
      });

      yPos += 0.4;
    });
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 8B: API ENDPOINTS - PART 2
// ============================================================
function createAPISlidePart2() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("10  API ENDPOINTS — PART 2", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  const apiGroups = [
    {
      title: "Dashboard", color: ACCENT_YELLOW,
      apis: [
        { method: "GET", path: "/api/dashboard/stats", desc: "Statistik utama" },
        { method: "GET", path: "/api/dashboard/recent", desc: "Pengukuran terbaru" },
        { method: "GET", path: "/api/dashboard/summary", desc: "Ringkasan gizi" },
      ]
    },
    {
      title: "Calculate", color: ACCENT_RED,
      apis: [
        { method: "POST", path: "/api/calculate", desc: "Hitung BMI & Z-Score" },
      ]
    },
  ];

  // Ringkasan endpoint count
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.05, w: 9.0, h: 0.5,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 },
    rectRadius: 0.08,
  });

  slide.addText("📡 Total 16 API Endpoints", {
    x: 0.5, y: 1.05, w: 9.0, h: 0.5,
    fontSize: 13, bold: true, color: PRIMARY_BLUE, align: "center", valign: "middle",
  });

  let yPos = 1.7;
  const methodColors: Record<string, string> = {
    GET: "22C55E",
    POST: "3B82F6",
    PUT: "F59E0B",
    DELETE: "EF4444",
  };

  apiGroups.forEach((group) => {
    // Group header
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: yPos, w: 9.0, h: 0.35,
      fill: { color: group.color },
    });

    slide.addText(group.title, {
      x: 0.6, y: yPos + 0.02, w: 2, h: 0.35,
      fontSize: 11, bold: true, color: "FFFFFF",
    });

    yPos += 0.35;

    group.apis.forEach((api) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: yPos, w: 9.0, h: 0.35,
        fill: { color: "FFFFFF" },
        line: { color: "F1F5F9", width: 0.5 },
        rectRadius: 0.04,
      });

      // Method badge
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6, y: yPos + 0.06, w: 0.65, h: 0.24,
        fill: { color: methodColors[api.method] || "64748B" },
        rectRadius: 0.04,
      });

      slide.addText(api.method, {
        x: 0.6, y: yPos + 0.04, w: 0.65, h: 0.24,
        fontSize: 8, bold: true, color: "FFFFFF", align: "center", valign: "middle",
      });

      slide.addText(api.path, {
        x: 1.35, y: yPos + 0.05, w: 4.5, h: 0.25,
        fontSize: 10, color: DARK_TEXT, fontFace: "Courier New",
      });

      slide.addText(api.desc, {
        x: 5.9, y: yPos + 0.05, w: 3.5, h: 0.25,
        fontSize: 10, color: "64748B",
      });

      yPos += 0.35;
    });

    yPos += 0.1;
  });

  // Additional info box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.2, w: 9.0, h: 1.85,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 },
    rectRadius: 0.08,
  });

  slide.addText("📋 Informasi API", {
    x: 0.7, y: 3.3, w: 8.6, h: 0.35,
    fontSize: 12, bold: true, color: DARK_TEXT,
  });

  slide.addText([
    { text: "REST API — semua endpoint menggunakan HTTP methods standar (GET, POST, PUT, DELETE)", options: { bullet: true, breakLine: true } },
    { text: "JSON Response — semua API mengembalikan format JSON", options: { bullet: true, breakLine: true } },
    { text: "Authentication — endpoint /api/auth/* untuk login,其他的 butuh session token", options: { bullet: true, breakLine: true } },
    { text: "Error Handling — format error: { error: string, message: string }", options: { bullet: true, breakLine: true } },
    { text: "Part 1 sebelumnya: Auth (2), Students (8), Measurements (6) endpoints", options: { bullet: true } },
  ], {
    x: 0.7, y: 3.65, w: 8.6, h: 1.3,
    fontSize: 10, color: "475569", paraSpaceAfter: 4,
  });

  // Back to part 1
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 5.0, w: 2.0, h: 0.35,
    fill: { color: PRIMARY_BLUE },
    rectRadius: 0.06,
  });

  slide.addText("← Part 1", {
    x: 0.5, y: 5.0, w: 2.0, h: 0.35,
    fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle",
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 9: HALAMAN APLIKASI
// ============================================================
function createPagesSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("07  HALAMAN APLIKASI", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  const pages = [
    { icon: "🔐", title: "Login", path: "/login", desc: "Halaman autentikasi user dengan email & password", color: "8B5CF6" },
    { icon: "📊", title: "Dashboard", path: "/dashboard", desc: "Statistik utama: jumlah siswa, distribusi gizi, grafik", color: PRIMARY_BLUE },
    { icon: "👨‍🎓", title: "Siswa", path: "/siswa", desc: "Kelola data siswa: tambah, edit, import Excel", color: "0EA5E9" },
    { icon: "📏", title: "Pemeriksaan", path: "/pemeriksaan", desc: "Input pengukuran: tinggi, berat, kategori gizi", color: ACCENT_GREEN },
    { icon: "📄", title: "Hasil", path: "/hasil/[id]", desc: "Detail hasil pengukuran & perhitungan Z-Score", color: ACCENT_YELLOW },
    { icon: "📋", title: "Laporan", path: "/laporan", desc: "Export laporan: filter kelas, export PDF/Excel", color: ACCENT_RED },
  ];

  pages.forEach((page, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.1;
    const y = 1.15 + row * 2.05;

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 2.9, h: 1.85,
      fill: { color: "FFFFFF" },
      line: { color: "E2E8F0", width: 1 },
      rectRadius: 0.1,
    });

    // Color bar
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 2.9, h: 0.08,
      fill: { color: page.color },
    });

    slide.addText(page.icon, {
      x, y: y + 0.15, w: 2.9, h: 0.5,
      fontSize: 28, align: "center",
    });

    slide.addText(page.title, {
      x: x + 0.15, y: y + 0.65, w: 2.6, h: 0.35,
      fontSize: 14, bold: true, color: DARK_TEXT, align: "center",
    });

    slide.addText(page.path, {
      x: x + 0.15, y: y + 0.95, w: 2.6, h: 0.25,
      fontSize: 9, color: page.color, align: "center", fontFace: "Courier New",
    });

    slide.addText(page.desc, {
      x: x + 0.15, y: y + 1.2, w: 2.6, h: 0.55,
      fontSize: 10, color: "64748B", align: "center",
    });
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 10: WORKFLOW SISTEM
// ============================================================
function createWorkflowSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("📋  WORKFLOW SISTEM", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  // Flow steps
  const steps = [
    { icon: "1️⃣", title: "Login", desc: "User login ke sistem" },
    { icon: "2️⃣", title: "Pilih Siswa", desc: "Ambil/buat data siswa" },
    { icon: "3️⃣", title: "Input Pengukuran", desc: "Masukkan TB & BB" },
    { icon: "4️⃣", title: "Hitung", desc: "Sistem hitung BMI & Z-Score" },
    { icon: "5️⃣", title: "Kategori", desc: "Tentukan status gizi" },
    { icon: "6️⃣", title: "Simpan", desc: "Data tersimpan di database" },
    { icon: "7️⃣", title: "Export", desc: "Generate laporan PDF/Excel" },
  ];

  steps.forEach((step, i) => {
    const x = 0.5 + i * 1.32;

    // Circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x, y: 1.3, w: 1.15, h: 1.15,
      fill: { color: PRIMARY_BLUE },
    });

    slide.addText(step.icon, {
      x, y: 1.5, w: 1.15, h: 0.8,
      fontSize: 28, align: "center", valign: "middle",
    });

    slide.addText(step.title, {
      x, y: 2.55, w: 1.15, h: 0.35,
      fontSize: 10, bold: true, color: DARK_TEXT, align: "center",
    });

    slide.addText(step.desc, {
      x, y: 2.85, w: 1.15, h: 0.35,
      fontSize: 9, color: "64748B", align: "center",
    });

    // Arrow between steps
    if (i < steps.length - 1) {
      slide.addText("→", {
        x: x + 1.05, y: 1.65, w: 0.35, h: 0.5,
        fontSize: 20, color: ACCENT_GREEN, bold: true,
      });
    }
  });

  // BMI Formula box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.5, w: 4.3, h: 1.5,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 },
    rectRadius: 0.08,
  });

  slide.addText("📐 Rumus BMI", {
    x: 0.7, y: 3.6, w: 3.9, h: 0.35,
    fontSize: 12, bold: true, color: DARK_TEXT,
  });

  slide.addText("BMI = Berat (kg) / Tinggi (m)²", {
    x: 0.7, y: 3.95, w: 3.9, h: 0.3,
    fontSize: 13, color: PRIMARY_BLUE, fontFace: "Courier New", bold: true,
  });

  slide.addText([
    { text: "Berat Badan (kg)", options: { breakLine: true } },
    { text: "Tinggi Badan (m)", options: { breakLine: true } },
    { text: "Z-Score menggunakan standar WHO 2007", options: {} },
  ], {
    x: 0.7, y: 4.3, w: 3.9, h: 0.7,
    fontSize: 10, color: "64748B",
  });

  // Kategori Gizi box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 3.5, w: 4.3, h: 1.5,
    fill: { color: "FFFFFF" },
    line: { color: "E2E8F0", width: 1 },
    rectRadius: 0.08,
  });

  slide.addText("🏷️ Kategori Status Gizi", {
    x: 5.4, y: 3.6, w: 3.9, h: 0.35,
    fontSize: 12, bold: true, color: DARK_TEXT,
  });

  const categories = [
    { label: "Sangat Kurang", color: "DC2626" },
    { label: "Kurang", color: "F59E0B" },
    { label: "Normal", color: "22C55E" },
    { label: "Berlebih", color: "3B82F6" },
    { label: "Obesitas", color: "7C3AED" },
  ];

  categories.forEach((cat, i) => {
    const catX = 5.4 + (i % 3) * 1.35;
    const catY = 4.05 + Math.floor(i / 3) * 0.45;

    slide.addShape(pptx.ShapeType.ellipse, {
      x: catX, y: catY, w: 0.22, h: 0.22,
      fill: { color: cat.color },
    });

    slide.addText(cat.label, {
      x: catX + 0.28, y: catY - 0.02, w: 1.1, h: 0.25,
      fontSize: 9, color: DARK_TEXT,
    });
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 11: KESIMPULAN
// ============================================================
function createConclusionSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: LIGHT_BG };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.9,
    fill: { color: PRIMARY_BLUE },
  });

  slide.addText("08  KESIMPULAN & NEXT STEPS", {
    x: 0.5, y: 0.2, w: "100%", fontSize: 24, bold: true,
    color: "FFFFFF", fontFace: "Arial Black",
  });

  // Achievement
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.1, w: 4.3, h: 2.6,
    fill: { color: "FFFFFF" },
    line: { color: ACCENT_GREEN, width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("✅ Yang Sudah Dicapai", {
    x: 0.5, y: 1.2, w: 4.3, h: 0.4,
    fontSize: 14, bold: true, color: ACCENT_GREEN, align: "center",
  });

  slide.addText([
    { text: "Sistem CRUD lengkap untuk siswa & pengukuran", options: { bullet: true, breakLine: true } },
    { text: "Perhitungan BMI & Z-Score otomatis", options: { bullet: true, breakLine: true } },
    { text: "Dashboard statistik real-time", options: { bullet: true, breakLine: true } },
    { text: "Export laporan (Excel & PDF)", options: { bullet: true, breakLine: true } },
    { text: "Autentikasi dengan NextAuth.js", options: { bullet: true, breakLine: true } },
    { text: "PWA dengan offline support", options: { bullet: true } },
  ], {
    x: 0.7, y: 1.6, w: 3.9, h: 2.0,
    fontSize: 11, color: DARK_TEXT, paraSpaceAfter: 5,
  });

  // Next steps
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.2, y: 1.1, w: 4.3, h: 2.6,
    fill: { color: "FFFFFF" },
    line: { color: ACCENT_YELLOW, width: 2 },
    rectRadius: 0.1,
  });

  slide.addText("🚀 Rencana Pengembangan", {
    x: 5.2, y: 1.2, w: 4.3, h: 0.4,
    fontSize: 14, bold: true, color: ACCENT_YELLOW, align: "center",
  });

  slide.addText([
    { text: "Integrasi API dengan server pusat", options: { bullet: true, breakLine: true } },
    { text: "QR Code untuk identifikasi siswa", options: { bullet: true, breakLine: true } },
    { text: "Notifikasi & reminder otomatis", options: { bullet: true, breakLine: true } },
    { text: "Multi-user role (admin, operator, viewer)", options: { bullet: true, breakLine: true } },
    { text: "Dashboard analitik tingkat kabupaten/provinsi", options: { bullet: true, breakLine: true } },
    { text: "Mobile app (React Native)", options: { bullet: true } },
  ], {
    x: 5.4, y: 1.6, w: 3.9, h: 2.0,
    fontSize: 11, color: DARK_TEXT, paraSpaceAfter: 5,
  });

  // Stats summary
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.85, w: 9.0, h: 1.0,
    fill: { color: PRIMARY_BLUE },
    rectRadius: 0.1,
  });

  const stats = [
    { value: "23", label: "Routes" },
    { value: "3", label: "Tables DB" },
    { value: "16+", label: "API Endpoints" },
    { value: "6", label: "Pages" },
  ];

  stats.forEach((stat, i) => {
    const x = 0.8 + i * 2.25;

    slide.addText(stat.value, {
      x, y: 3.95, w: 2.0, h: 0.5,
      fontSize: 28, bold: true, color: "FFFFFF", align: "center",
    });

    slide.addText(stat.label, {
      x, y: 4.45, w: 2.0, h: 0.3,
      fontSize: 11, color: "FFFFFF", align: "center", transparency: 30,
    });
  });

  slide.addText("Project Gizi — 2026", {
    x: 0, y: 5.3, w: "100%", fontSize: 10, color: "94A3B8", align: "center",
  });
}

// ============================================================
// SLIDE 12: THANK YOU
// ============================================================
function createThankYouSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: PRIMARY_BLUE };

  // Background decoration
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -2, y: -1, w: 6, h: 6,
    fill: { color: "2D4A6F", transparency: 50 },
  });

  slide.addShape(pptx.ShapeType.ellipse, {
    x: 7, y: 2, w: 5, h: 5,
    fill: { color: "2D4A6F", transparency: 50 },
  });

  // Top accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.15,
    fill: { color: ACCENT_GREEN },
  });

  // Emoji
  slide.addText("🍽️", {
    x: 0, y: 1.0, w: "100%", fontSize: 72, align: "center",
  });

  slide.addText("TERIMA KASIH", {
    x: 0, y: 1.85, w: "100%", fontSize: 44, bold: true,
    color: "FFFFFF", align: "center", fontFace: "Arial Black",
  });

  // Separator
  slide.addShape(pptx.ShapeType.rect, {
    x: 3.5, y: 2.5, w: 3, h: 0.05,
    fill: { color: ACCENT_GREEN },
  });

  slide.addText("Project Gizi — Sistem Monitoring Status Gizi Anak Sekolah", {
    x: 0, y: 2.7, w: "100%", fontSize: 16,
    color: "FFFFFF", align: "center", transparency: 20,
  });

  slide.addText("Dibuat dengan ❤️ oleh MBG Developer", {
    x: 0, y: 3.1, w: "100%", fontSize: 14,
    color: "FFFFFF", align: "center", transparency: 40,
  });

  // Bottom info
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 4.6, w: "100%", h: 0.95,
    fill: { color: "1A2E45" },
  });

  slide.addText("Tech Stack: Next.js 16 • React 19 • Tailwind CSS • MySQL • Drizzle ORM • TypeScript", {
    x: 0, y: 4.7, w: "100%", h: 0.35,
    fontSize: 11, color: "FFFFFF", align: "center", transparency: 30,
  });

  slide.addText("2026", {
    x: 0, y: 5.1, w: "100%", h: 0.3,
    fontSize: 12, color: "FFFFFF", align: "center",
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.3, w: "100%", h: 0.25,
    fill: { color: ACCENT_GREEN, transparency: 30 },
  });
}

// ============================================================
// JALANKAN SEMUA SLIDE
// ============================================================
async function main() {
  console.log("📊 Membuat Presentasi Project Gizi...");

  pptx.layout = "LAYOUT_16x9";
  pptx.title = "Project Gizi - Sistem Monitoring Status Gizi";
  pptx.author = "MBG Developer";
  pptx.company = "Project Gizi";
  pptx.subject = "Presentasi Sistem Monitoring Status Gizi Anak Sekolah";

  createCoverSlide();
  createTableOfContents();
  createBackgroundSlide();
  createGoalsSlide();
  createFeaturesSlide();
  createTechStackSlide();
  createTechStackDetailFrontend();
  createTechStackDetailBackend();
  createTechStackDetailDatabase();
  createTechStackDetailTools();
  createDatabaseSlide();
  createAPISlidePart1();
  createAPISlidePart1b();
  createAPISlidePart1c();
  createAPISlidePart1d();
  createAPISlidePart2();
  createPagesSlide();
  createWorkflowSlide();
  createConclusionSlide();
  createThankYouSlide();

  const filePath = "Project_Gizi_Presentasi_v4.pptx";
  await pptx.writeFile({ fileName: filePath });
  console.log(`✅ Presentasi berhasil dibuat: ${filePath}`);
  console.log("📍 Lokasi: c:/xampp/htdocs/projectgizi/Project_Gizi_Presentasi_v2.pptx");
}

main().catch(console.error);
