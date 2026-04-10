/**
 * WHO 2007 BMI-for-age Z-Score Calculator
 * Reference: WHO Growth Reference 5-19 years
 *
 * LMS parameters for BMI-for-age (5-19 years) by gender and age in months.
 * L = Box-Cox power, M = Median, S = Coefficient of variation
 */

interface LMSEntry {
  L: number;
  M: number;
  S: number;
}

// LMS tables for boys (5-19 years, every 2 months)
const LMS_BOY: Record<number, LMSEntry> = {
  61:  { L: 0.4608, M: 15.3373, S: 0.09681 },
  63:  { L: 0.2304, M: 15.3620, S: 0.09698 },
  65:  { L: 0.0000, M: 15.3867, S: 0.09716 },
  67:  { L:-0.2304, M: 15.4114, S: 0.09734 },
  69:  { L:-0.4608, M: 15.4362, S: 0.09753 },
  71:  { L:-0.6911, M: 15.4612, S: 0.09772 },
  73:  { L:-0.9215, M: 15.4865, S: 0.09792 },
  75:  { L:-1.1519, M: 15.5123, S: 0.09813 },
  77:  { L:-1.3823, M: 15.5388, S: 0.09834 },
  79:  { L:-1.6126, M: 15.5661, S: 0.09857 },
  81:  { L:-1.8430, M: 15.5946, S: 0.09880 },
  83:  { L:-2.0734, M: 15.6244, S: 0.09905 },
  85:  { L:-2.3038, M: 15.6558, S: 0.09930 },
  87:  { L:-2.5341, M: 15.6891, S: 0.09957 },
  89:  { L:-2.7645, M: 15.7247, S: 0.09985 },
  91:  { L:-2.9949, M: 15.7628, S: 0.10015 },
  93:  { L:-3.2253, M: 15.8038, S: 0.10046 },
  95:  { L:-3.4557, M: 15.8480, S: 0.10079 },
  97:  { L:-3.6860, M: 15.8958, S: 0.10113 },
  99:  { L:-3.9164, M: 15.9476, S: 0.10149 },
  101: { L:-4.1468, M: 16.0037, S: 0.10188 },
  103: { L:-4.3772, M: 16.0646, S: 0.10228 },
  105: { L:-4.6076, M: 16.1307, S: 0.10271 },
  107: { L:-4.8379, M: 16.2024, S: 0.10316 },
  109: { L:-5.0683, M: 16.2801, S: 0.10363 },
  111: { L:-5.2987, M: 16.3643, S: 0.10412 },
  113: { L:-5.5291, M: 16.4553, S: 0.10464 },
  115: { L:-5.7595, M: 16.5537, S: 0.10518 },
  117: { L:-5.9898, M: 16.6598, S: 0.10575 },
  119: { L:-6.2202, M: 16.7740, S: 0.10634 },
  121: { L:-6.4506, M: 16.8968, S: 0.10696 },
  123: { L:-6.6810, M: 17.0284, S: 0.10761 },
  125: { L:-6.9114, M: 17.1693, S: 0.10828 },
  127: { L:-7.1417, M: 17.3197, S: 0.10898 },
  129: { L:-7.3721, M: 17.4799, S: 0.10970 },
  131: { L:-7.6025, M: 17.6502, S: 0.11046 },
  133: { L:-7.8329, M: 17.8308, S: 0.11124 },
  135: { L:-8.0633, M: 18.0219, S: 0.11204 },
  137: { L:-8.2936, M: 18.2237, S: 0.11288 },
  139: { L:-8.5240, M: 18.4364, S: 0.11374 },
  141: { L:-8.7544, M: 18.6602, S: 0.11462 },
  143: { L:-8.9848, M: 18.8951, S: 0.11553 },
  145: { L:-9.2152, M: 19.1412, S: 0.11646 },
  147: { L:-9.4455, M: 19.3987, S: 0.11741 },
  149: { L:-9.6759, M: 19.6675, S: 0.11838 },
  151: { L:-9.9063, M: 19.9476, S: 0.11937 },
  153: { L:-10.1367, M: 20.2390, S: 0.12038 },
  155: { L:-10.3671, M: 20.5418, S: 0.12140 },
  157: { L:-10.5974, M: 20.8559, S: 0.12244 },
  159: { L:-10.8278, M: 21.1813, S: 0.12349 },
  161: { L:-11.0582, M: 21.5178, S: 0.12455 },
  163: { L:-11.2886, M: 21.8653, S: 0.12561 },
  165: { L:-11.5190, M: 22.2237, S: 0.12667 },
  167: { L:-11.7493, M: 22.5928, S: 0.12773 },
  169: { L:-11.9797, M: 22.9723, S: 0.12879 },
  171: { L:-12.2101, M: 23.3620, S: 0.12984 },
  173: { L:-12.4405, M: 23.7616, S: 0.13088 },
  175: { L:-12.6709, M: 24.1708, S: 0.13191 },
  177: { L:-12.9012, M: 24.5893, S: 0.13293 },
  179: { L:-13.1316, M: 25.0166, S: 0.13394 },
  181: { L:-13.3620, M: 25.4525, S: 0.13493 },
  183: { L:-13.5924, M: 25.8965, S: 0.13591 },
  185: { L:-13.8228, M: 26.3482, S: 0.13688 },
  187: { L:-14.0531, M: 26.8071, S: 0.13783 },
  189: { L:-14.2835, M: 27.2728, S: 0.13876 },
  191: { L:-14.5139, M: 27.7448, S: 0.13967 },
  193: { L:-14.7443, M: 28.2227, S: 0.14057 },
  195: { L:-14.9747, M: 28.7059, S: 0.14144 },
  197: { L:-15.2050, M: 29.1939, S: 0.14230 },
  199: { L:-15.4354, M: 29.6862, S: 0.14314 },
  201: { L:-15.6658, M: 30.1823, S: 0.14395 },
  203: { L:-15.8962, M: 30.6816, S: 0.14475 },
  205: { L:-16.1266, M: 31.1837, S: 0.14552 },
  207: { L:-16.3569, M: 31.6878, S: 0.14628 },
  209: { L:-16.5873, M: 32.1935, S: 0.14701 },
  211: { L:-16.8177, M: 32.7002, S: 0.14772 },
  213: { L:-17.0481, M: 33.2074, S: 0.14841 },
  215: { L:-17.2785, M: 33.7145, S: 0.14907 },
  217: { L:-17.5088, M: 34.2209, S: 0.14972 },
  219: { L:-17.7392, M: 34.7261, S: 0.15034 },
  221: { L:-17.9696, M: 35.2296, S: 0.15094 },
  223: { L:-18.2000, M: 35.7307, S: 0.15152 },
  225: { L:-18.4304, M: 36.2291, S: 0.15208 },
  227: { L:-18.6607, M: 36.7240, S: 0.15262 },
  229: { L:-18.8911, M: 37.2151, S: 0.15313 },
  231: { L:-19.1215, M: 37.7018, S: 0.15362 },
  233: { L:-19.3519, M: 38.1837, S: 0.15410 },
  235: { L:-19.5823, M: 38.6604, S: 0.15455 },
  237: { L:-19.8126, M: 39.1315, S: 0.15499 },
  239: { L:-20.0430, M: 39.5966, S: 0.15540 },
};

// LMS tables for girls (5-19 years, every 2 months)
const LMS_GIRL: Record<number, LMSEntry> = {
  61:  { L: 0.8134, M: 15.1378, S: 0.09510 },
  63:  { L: 0.6268, M: 15.1831, S: 0.09520 },
  65:  { L: 0.4402, M: 15.2285, S: 0.09531 },
  67:  { L: 0.2537, M: 15.2743, S: 0.09543 },
  69:  { L: 0.0671, M: 15.3205, S: 0.09555 },
  71:  { L:-0.1195, M: 15.3674, S: 0.09569 },
  73:  { L:-0.3061, M: 15.4150, S: 0.09583 },
  75:  { L:-0.4927, M: 15.4636, S: 0.09599 },
  77:  { L:-0.6793, M: 15.5133, S: 0.09615 },
  79:  { L:-0.8659, M: 15.5643, S: 0.09633 },
  81:  { L:-1.0525, M: 15.6168, S: 0.09651 },
  83:  { L:-1.2391, M: 15.6710, S: 0.09671 },
  85:  { L:-1.4257, M: 15.7270, S: 0.09692 },
  87:  { L:-1.6122, M: 15.7850, S: 0.09714 },
  89:  { L:-1.7988, M: 15.8453, S: 0.09737 },
  91:  { L:-1.9854, M: 15.9080, S: 0.09762 },
  93:  { L:-2.1720, M: 15.9733, S: 0.09787 },
  95:  { L:-2.3586, M: 16.0415, S: 0.09815 },
  97:  { L:-2.5452, M: 16.1128, S: 0.09844 },
  99:  { L:-2.7318, M: 16.1874, S: 0.09874 },
  101: { L:-2.9184, M: 16.2656, S: 0.09906 },
  103: { L:-3.1050, M: 16.3476, S: 0.09940 },
  105: { L:-3.2916, M: 16.4338, S: 0.09975 },
  107: { L:-3.4781, M: 16.5244, S: 0.10012 },
  109: { L:-3.6647, M: 16.6197, S: 0.10050 },
  111: { L:-3.8513, M: 16.7201, S: 0.10090 },
  113: { L:-4.0379, M: 16.8259, S: 0.10132 },
  115: { L:-4.2245, M: 16.9373, S: 0.10176 },
  117: { L:-4.4111, M: 17.0548, S: 0.10222 },
  119: { L:-4.5977, M: 17.1787, S: 0.10269 },
  121: { L:-4.7843, M: 17.3093, S: 0.10319 },
  123: { L:-4.9709, M: 17.4469, S: 0.10370 },
  125: { L:-5.1574, M: 17.5918, S: 0.10423 },
  127: { L:-5.3440, M: 17.7443, S: 0.10478 },
  129: { L:-5.5306, M: 17.9047, S: 0.10535 },
  131: { L:-5.7172, M: 18.0732, S: 0.10593 },
  133: { L:-5.9038, M: 18.2501, S: 0.10654 },
  135: { L:-6.0904, M: 18.4356, S: 0.10715 },
  137: { L:-6.2770, M: 18.6299, S: 0.10778 },
  139: { L:-6.4636, M: 18.8331, S: 0.10844 },
  141: { L:-6.6502, M: 19.0454, S: 0.10910 },
  143: { L:-6.8367, M: 19.2668, S: 0.10979 },
  145: { L:-7.0233, M: 19.4975, S: 0.11049 },
  147: { L:-7.2099, M: 19.7375, S: 0.11120 },
  149: { L:-7.3965, M: 19.9867, S: 0.11193 },
  151: { L:-7.5831, M: 20.2451, S: 0.11267 },
  153: { L:-7.7697, M: 20.5126, S: 0.11343 },
  155: { L:-7.9563, M: 20.7889, S: 0.11419 },
  157: { L:-8.1429, M: 21.0740, S: 0.11497 },
  159: { L:-8.3294, M: 21.3675, S: 0.11575 },
  161: { L:-8.5160, M: 21.6691, S: 0.11654 },
  163: { L:-8.7026, M: 21.9787, S: 0.11733 },
  165: { L:-8.8892, M: 22.2957, S: 0.11813 },
  167:  { L:-9.0758, M: 22.6198, S: 0.11893 },
  169:  { L:-9.2624, M: 22.9504, S: 0.11973 },
  171:  { L:-9.4490, M: 23.2871, S: 0.12053 },
  173:  { L:-9.6356, M: 23.6294, S: 0.12133 },
  175:  { L:-9.8222, M: 23.9769, S: 0.12212 },
  177:  { L:-10.0087, M: 24.3289, S: 0.12291 },
  179:  { L:-10.1953, M: 24.6849, S: 0.12369 },
  181:  { L:-10.3819, M: 25.0443, S: 0.12446 },
  183:  { L:-10.5685, M: 25.4066, S: 0.12523 },
  185:  { L:-10.7551, M: 25.7712, S: 0.12598 },
  187:  { L:-10.9417, M: 26.1376, S: 0.12672 },
  189:  { L:-11.1283, M: 26.5052, S: 0.12745 },
  191:  { L:-11.3149, M: 26.8735, S: 0.12816 },
  193:  { L:-11.5014, M: 27.2420, S: 0.12886 },
  195:  { L:-11.6880, M: 27.6102, S: 0.12955 },
  197:  { L:-11.8746, M: 27.9775, S: 0.13022 },
  199:  { L:-12.0612, M: 28.3436, S: 0.13087 },
  201:  { L:-12.2478, M: 28.7079, S: 0.13151 },
  203:  { L:-12.4344, M: 29.0699, S: 0.13213 },
  205:  { L:-12.6210, M: 29.4291, S: 0.13273 },
  207:  { L:-12.8076, M: 29.7851, S: 0.13332 },
  209:  { L:-12.9941, M: 30.1374, S: 0.13389 },
  211:  { L:-13.1807, M: 30.4855, S: 0.13444 },
  213:  { L:-13.3673, M: 30.8291, S: 0.13498 },
  215:  { L:-13.5539, M: 31.1677, S: 0.13549 },
  217:  { L:-13.7405, M: 31.5009, S: 0.13598 },
  219:  { L:-13.9271, M: 31.8283, S: 0.13645 },
  221:  { L:-14.1137, M: 32.1496, S: 0.13691 },
  223:  { L:-14.3003, M: 32.4645, S: 0.13734 },
  225:  { L:-14.4868, M: 32.7727, S: 0.13775 },
  227:  { L:-14.6734, M: 33.0739, S: 0.13814 },
  229:  { L:-14.8600, M: 33.3679, S: 0.13851 },
  231:  { L:-15.0466, M: 33.6545, S: 0.13886 },
  233:  { L:-15.2332, M: 33.9335, S: 0.13919 },
  235:  { L:-15.4198, M: 34.2047, S: 0.13950 },
  237:  { L:-15.6064, M: 34.4679, S: 0.13977 },
  239:  { L:-15.7929, M: 34.7231, S: 0.14003 },
};

function getLMSEntry(
  ageMonths: number,
  gender: "L" | "P"
): LMSEntry | null {
  const table = gender === "L" ? LMS_BOY : LMS_GIRL;
  const minAge = 61;
  const maxAge = 239;

  if (ageMonths < minAge) return table[minAge];
  if (ageMonths > maxAge) return table[maxAge];

  // Clamp first, then round DOWN to nearest 2-month interval (must be even)
  const clamped = Math.max(minAge, Math.min(maxAge, ageMonths));
  const rounded = Math.floor(clamped / 2) * 2;
  const key = Math.max(minAge, Math.min(maxAge, rounded));

  return table[key] || null;
}

function calculateZScore(bmi: number, lms: LMSEntry): number {
  if (lms.L === 0) {
    return Math.log(bmi / lms.M) / lms.S;
  }
  return (Math.pow(bmi / lms.M, lms.L) - 1) / (lms.L * lms.S);
}

export interface NutritionResult {
  bmi: number;
  zScore: number;
  status: string;
  statusVariant: "normal" | "obesitas" | "overweight" | "stunting" | "severely_stunting" | "secondary";
  bgColor: string;
  recommendation: string;
}

export function calculateNutritionStatus(
  heightCm: number,
  weightKg: number,
  birthDate: string,
  gender: "L" | "P"
): NutritionResult {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);

  // Calculate age in months
  const birth = new Date(birthDate);
  const now = new Date();
  const totalMonths =
    (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - birth.getUTCMonth());
  const ageMonths = Math.max(61, Math.min(239, totalMonths));

  const lms = getLMSEntry(ageMonths, gender);

  if (!lms) {
    return {
      bmi,
      zScore: 0,
      status: "Data Tidak Tersedia",
      statusVariant: "secondary",
      bgColor: "bg-slate-50",
      recommendation:
        "Usia siswa di luar jangkauan standar WHO 2007 (5-19 tahun). Silakan konsultasikan dengan tenaga kesehatan.",
    };
  }

  const zScore = calculateZScore(bmi, lms);

  let status: string;
  let statusVariant: NutritionResult["statusVariant"];
  let bgColor: string;

  if (zScore < -3) {
    status = "Stunting Berat";
    statusVariant = "severely_stunting";
    bgColor = "bg-orange-100";
  } else if (zScore < -2) {
    status = "Stunting";
    statusVariant = "stunting";
    bgColor = "bg-orange-50";
  } else if (zScore <= 1) {
    status = "Normal";
    statusVariant = "normal";
    bgColor = "bg-green-50";
  } else if (zScore <= 2) {
    status = "Overweight";
    statusVariant = "overweight";
    bgColor = "bg-amber-50";
  } else {
    status = "Obesitas";
    statusVariant = "obesitas";
    bgColor = "bg-red-50";
  }

  const recommendation = getRecommendation(status, zScore, gender);

  return { bmi, zScore, status, statusVariant, bgColor, recommendation };
}

function getRecommendation(status: string, zScore: number, gender: "L" | "P"): string {
  const pronoun = gender === "L" ? " anak laki-laki" : " anak perempuan";
  const recommendations: Record<string, string> = {
    "Normal": `Kondisi gizi ${pronoun} ini baik dan sesuai dengan standar WHO 2007. Pertahankan pola makan seimbang dan aktivitas fisik teratur. Lanjutkan pemantauan berkala setiap semester untuk memastikan pertumbuhan optimal.`,
    "Overweight": `Perlu perhatian khusus. ${pronoun} ini memiliki berat badan berlebih. Disarankan untuk meningkatkan aktivitas fisik minimal 60 menit per hari, mengurangi konsumsi makanan tinggi gula dan lemak jenuh, serta memperbanyak sayur dan buah. Konsultasikan ke dokter jika berat badan terus meningkat.`,
    "Obesitas": `${pronoun} ini mengalami obesitas yang memerlukan penanganan segera. Segera konsultasikan ke dokter atau ahli gizi untuk rencana diet dan olahraga yang sesuai. Hindari memberikan makanan cepat saji dan minuman manis. Dukung dengan aktivitas fisik yang bertahap dan teratur.`,
    "Stunting": `${pronoun} ini mengalami stunting (terlalu pendek untuk usianya). Perbaiki asupan gizi dengan memperbanyak makanan kaya protein, zat besi, zinc, dan vitamin A. Pastikan asupan kalsium dan vitamin D cukup untuk pertumbuhan tulang. Pantau perkembangan tinggi badan secara berkala dan konsultasikan ke tenaga kesehatan.`,
    "Stunting Berat": `Kondisi stunting berat pada ${pronoun} ini memerlukan intervensi segera. Segera konsultasikan ke dokter dan ahli gizi untuk penanganan yang tepat. Perbaikan gizi jangka panjang diperlukan, termasuk supplementation dan diversifikasi makanan. Pemantauan pertumbuhan berkala sangat penting.`,
  };

  return (
    recommendations[status] ||
    "Silakan konsultasikan hasil ini dengan tenaga kesehatan untuk penanganan lebih lanjut."
  );
}
