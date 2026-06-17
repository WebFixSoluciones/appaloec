import '../../../../core/services/notification_service.dart';

/// Categorías de IMC soportadas por la aplicación.
enum BmiCategory {
  underweight,  // IMC < 18.5
  normal,       // 18.5 <= IMC < 25
  overweight,   // 25 <= IMC < 30
  obesity1,     // 30 <= IMC < 35
  obesity2,     // IMC >= 35
}

/// Representación de un ítem de la agenda diaria del protocolo.
class ProtocolMealItem {
  final String time;     // Ej: "08:00 AM"
  final String label;    // Ej: "Desayuno"
  final List<String> items; // Ej: ["Ensalada de frutas", "Cápsula de hígado"]
  final String? icon;    // Emoji del ítem (opcional)

  const ProtocolMealItem({
    required this.time,
    required this.label,
    required this.items,
    this.icon,
  });

  /// Convierte a objeto de notificación con hora/minuto extraídos del string `time`.
  ProtocolMealNotification toNotification() {
    final parts = time.replaceAll(' AM', '').replaceAll(' PM', '').split(':');
    int hour = int.tryParse(parts[0]) ?? 8;
    final int minute = int.tryParse(parts[1]) ?? 0;
    if (time.contains('PM') && hour != 12) hour += 12;
    if (time.contains('AM') && hour == 12) hour = 0;

    final body = items.asMap().entries.map((e) => '${e.key + 1}. ${e.value}').join(', ');

    return ProtocolMealNotification(
      hour: hour,
      minute: minute,
      title: '🌿 ALOEC: Pronto serán las $time - $label',
      body: body,
    );
  }
}

/// Modelo de protocolo médico de ALOEC.
class ProtocolModel {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final BmiCategory category;
  final List<ProtocolMealItem> schedule;
  final List<String> importantNotes;
  final String? linkedCourseTag; // Tag para buscar el curso vinculado en Firestore

  const ProtocolModel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.category,
    required this.schedule,
    required this.importantNotes,
    this.linkedCourseTag,
  });
}

/// Catálogo de protocolos médicos de ALOEC.
class AloecProtocols {
  // ─── Protocolo para Bajo Peso (IMC < 18.5) ─────────────────────────────────
  static const ProtocolModel underweight = ProtocolModel(
    id: 'protocol_underweight',
    title: 'Protocolo para Recuperar Peso',
    subtitle: 'IMC menor a 18.5',
    description:
        'Este protocolo está diseñado para personas con bajo peso. Incluye jugos verdes nutritivos, suplementos naturales y una rutina de hábitos saludables para recuperar el peso ideal de forma orgánica.',
    category: BmiCategory.underweight,
    linkedCourseTag: 'terapia_gerson',
    importantNotes: [
      'Consumir los jugos en las horas indicadas sin omitir ninguno.',
      'Descansar mínimo 8 horas diarias.',
      'Evitar alimentos procesados, azúcares refinadas y frituras.',
      'Hidratarse con al menos 2 litros de agua natural al día.',
      'Consultar a su médico antes de iniciar cualquier protocolo.',
    ],
    schedule: [
      ProtocolMealItem(
        time: '07:00 AM',
        label: 'Desayuno',
        icon: '🌿',
        items: [
          'Jugo verde: 1 manzana, 1 pepino, espinacas, jengibre',
          'Avena con plátano y miel de abeja natural',
          '1 cápsula de vitamina B12',
        ],
      ),
      ProtocolMealItem(
        time: '10:30 AM',
        label: 'Media Mañana',
        icon: '🥝',
        items: [
          'Jugo de zanahoria, naranja y remolacha',
          '1 puñado de nueces y almendras naturales',
        ],
      ),
      ProtocolMealItem(
        time: '01:00 PM',
        label: 'Almuerzo',
        icon: '🥗',
        items: [
          'Ensalada de aguacate con limón y aceite de oliva extra virgen',
          'Arroz integral con vegetales al vapor',
          'Infusión de manzanilla o menta',
        ],
      ),
      ProtocolMealItem(
        time: '03:30 PM',
        label: 'Merienda',
        icon: '🍌',
        items: [
          'Batido de plátano, leche de almendras y cacao puro',
          '1 rebanada de pan integral',
        ],
      ),
      ProtocolMealItem(
        time: '06:00 PM',
        label: 'Cena',
        icon: '🍲',
        items: [
          'Crema de calabaza con aceite de oliva',
          'Pan integral tostado',
          'Infusión de hierbas relajantes (tila, valeriana)',
        ],
      ),
    ],
  );

  // ─── Protocolo Pérdida de Peso IMC 25 - 29.5 ───────────────────────────────
  static const ProtocolModel overweight = ProtocolModel(
    id: 'protocol_overweight',
    title: 'Protocolo para Pérdida de Peso',
    subtitle: 'IMC 25 – 29.5 (Sobrepeso)',
    description:
        'Protocolo de jugos verdes y hábitos saludables diseñado para personas con sobrepeso. Incluye rutina de actividad física ligera y desintoxicación natural.',
    category: BmiCategory.overweight,
    linkedCourseTag: 'terapia_gerson',
    importantNotes: [
      'Caminar 30 minutos diarios mínimo.',
      'Evitar bebidas azucaradas, harinas blancas y alimentos ultraprocesados.',
      'Tomar los suplementos indicados antes de las comidas principales.',
      'Beber 2.5 litros de agua al día.',
      'Registrar su progreso de peso cada semana.',
    ],
    schedule: [
      ProtocolMealItem(
        time: '08:00 AM',
        label: 'Desayuno',
        icon: '🥤',
        items: [
          'Ensalada de frutas (papaya, piña, fresas)',
          '1 cápsula de hígado y pancreatina antes del desayuno',
          'Caminar 30 minutos después del desayuno',
        ],
      ),
      ProtocolMealItem(
        time: '10:30 AM',
        label: 'Media Mañana',
        icon: '🌱',
        items: [
          'Jugo verde: pepino, apio, manzana verde, espinaca y limón',
          '1 vaso de agua tibia con limón',
        ],
      ),
      ProtocolMealItem(
        time: '01:00 PM',
        label: 'Almuerzo',
        icon: '🥗',
        items: [
          'Ensalada verde grande con aderezo de limón y aceite de oliva',
          'Proteína magra (pollo al vapor, pescado o huevo)',
          'Infusión de jengibre con canela',
        ],
      ),
      ProtocolMealItem(
        time: '03:00 PM',
        label: 'Media Tarde',
        icon: '🍎',
        items: [
          'Jugo de zanahoria, betabel y manzana',
          '1 manzana verde o pera',
        ],
      ),
      ProtocolMealItem(
        time: '06:00 PM',
        label: 'Cena',
        icon: '🍵',
        items: [
          'Sopa de verduras (sin harinas ni papa)',
          'Infusión digestiva de hinojo',
        ],
      ),
    ],
  );

  // ─── Protocolo Pérdida de Peso IMC 30 - 34.5 ───────────────────────────────
  static const ProtocolModel obesity1 = ProtocolModel(
    id: 'protocol_obesity1',
    title: 'Protocolo para Pérdida de Peso',
    subtitle: 'IMC 30 – 34.5 (Obesidad I)',
    description:
        'Protocolo intensivo de jugos y desintoxicación para personas con obesidad tipo I. Incluye terapia de enemas para apoyar la limpieza del colon y el hígado según el método Gerson.',
    category: BmiCategory.obesity1,
    linkedCourseTag: 'terapia_gerson',
    importantNotes: [
      'Consultar a su médico antes de iniciar el protocolo de enemas.',
      'Tomar los suplementos naturales indicados sin omitir ninguna dosis.',
      'Evitar completamente carnes rojas, lácteos y alimentos procesados.',
      'Registrar síntomas y cambios en su diario de salud.',
      'Los jugos deben ser frescos, preparados en el momento.',
    ],
    schedule: [
      ProtocolMealItem(
        time: '08:00 AM',
        label: 'Desayuno',
        icon: '🥤',
        items: [
          'Jugo verde: 250ml (espinaca, apio, manzana verde, limón)',
          '1 cápsula de hígado y pancreatina',
          '1 tableta de potasio compuesto',
          'Caminar 30 minutos en ayunas',
        ],
      ),
      ProtocolMealItem(
        time: '10:00 AM',
        label: 'Media Mañana',
        icon: '🌿',
        items: [
          'Jugo de zanahoria con manzana (500ml)',
          '1 cápsula de enzimas digestivas',
        ],
      ),
      ProtocolMealItem(
        time: '01:00 PM',
        label: 'Almuerzo',
        icon: '🥗',
        items: [
          'Ensalada verde con aguacate',
          'Verduras al vapor (brócoli, espárragos, pepino)',
          'Infusión de diente de león',
        ],
      ),
      ProtocolMealItem(
        time: '02:00 PM',
        label: 'Enema Café (Terapia Gerson)',
        icon: '☕',
        items: [
          'Enema de café orgánico (preparación según indicaciones del médico)',
          'Descansar 15 minutos después del procedimiento',
        ],
      ),
      ProtocolMealItem(
        time: '03:00 PM',
        label: 'Media Tarde',
        icon: '🍊',
        items: [
          'Jugo de naranja con betabel y zanahoria',
          '1 cápsula de Vitamina C natural',
        ],
      ),
      ProtocolMealItem(
        time: '06:00 PM',
        label: 'Cena',
        icon: '🍵',
        items: [
          'Crema de verduras sin sal (solo hierbas frescas)',
          '1 vaso de jugo de manzana natural',
        ],
      ),
      ProtocolMealItem(
        time: '09:00 PM',
        label: 'Enema Café Nocturno',
        icon: '🌙',
        items: [
          'Segundo enema de café (si lo indica su médico)',
          'Infusión de manzanilla para descanso nocturno',
        ],
      ),
    ],
  );

  // ─── Protocolo Pérdida de Peso IMC >= 35 ────────────────────────────────────
  static const ProtocolModel obesity2 = ProtocolModel(
    id: 'protocol_obesity2',
    title: 'Protocolo Intensivo para Pérdida de Peso',
    subtitle: 'IMC 35 o Superior (Obesidad Severa)',
    description:
        'Protocolo intensivo basado en la Terapia Gerson para personas con obesidad severa. Requiere supervisión médica estricta. Incluye jugos terapéuticos, enemas de café y suplementos naturales.',
    category: BmiCategory.obesity2,
    linkedCourseTag: 'terapia_gerson',
    importantNotes: [
      '⚠️ OBLIGATORIO: Consultar con un médico especialista antes de iniciar.',
      'Seguimiento médico semanal obligatorio.',
      'No suspender medicamentos actuales sin autorización médica.',
      'Preparar los jugos frescos, no usar jugos embotellados o pasteurizados.',
      'Llevar un registro diario de presión arterial y glucosa (si aplica).',
      'Los enemas de café deben ser supervisados inicialmente por un terapeuta.',
    ],
    schedule: [
      ProtocolMealItem(
        time: '07:00 AM',
        label: 'Activación Matutina',
        icon: '🌅',
        items: [
          '1 vaso de agua tibia con jugo de limón en ayunas',
          '1 cápsula de probióticos',
          'Caminata suave de 20 minutos (si la condición física lo permite)',
        ],
      ),
      ProtocolMealItem(
        time: '08:00 AM',
        label: 'Desayuno',
        icon: '🥤',
        items: [
          'Jugo verde: espinaca, pepino, apio, manzana verde, perejil (500ml)',
          '1 cápsula de hígado desecado y pancreatina',
          '1 tableta de potasio compuesto',
          '1 tableta de Vitamina B12',
        ],
      ),
      ProtocolMealItem(
        time: '10:00 AM',
        label: 'Media Mañana',
        icon: '🌿',
        items: [
          'Jugo de zanahoria con manzana y jengibre (500ml)',
          '1 cápsula de enzimas pancreáticas',
          '1 cápsula de Vitamina C 1000mg',
        ],
      ),
      ProtocolMealItem(
        time: '01:00 PM',
        label: 'Almuerzo',
        icon: '🥗',
        items: [
          'Ensalada grande con hojas verdes, aguacate y semillas de calabaza',
          'Verduras al vapor: brócoli, coliflor, espárragos',
          'Infusión de diente de león y bardana',
        ],
      ),
      ProtocolMealItem(
        time: '02:00 PM',
        label: 'Enema Café (Terapia Gerson)',
        icon: '☕',
        items: [
          'Enema de café orgánico – 1 litro (temperatura corporal)',
          'Retener 12-15 minutos si es posible',
          'Descansar 20 minutos después del procedimiento',
        ],
      ),
      ProtocolMealItem(
        time: '03:30 PM',
        label: 'Media Tarde',
        icon: '🍊',
        items: [
          'Jugo de naranja, betabel y zanahoria (500ml)',
          '1 cápsula de Vitamina C 1000mg',
          '1 tableta de enzimas digestivas',
        ],
      ),
      ProtocolMealItem(
        time: '06:00 PM',
        label: 'Cena',
        icon: '🍵',
        items: [
          'Sopa Hippocrates (avena, tomates, vegetales, hierbas) sin sal',
          'Jugo de manzana natural (250ml)',
          'Infusión digestiva de menta y manzanilla',
        ],
      ),
      ProtocolMealItem(
        time: '09:00 PM',
        label: 'Enema Café Nocturno',
        icon: '🌙',
        items: [
          'Segundo enema de café orgánico',
          'Infusión de valeriana y tila para el descanso',
        ],
      ),
    ],
  );

  /// Retorna el protocolo correspondiente al valor de IMC calculado.
  static ProtocolModel fromBmi(double bmi) {
    if (bmi < 18.5) return underweight;
    if (bmi < 25.0) {
      // IMC normal: se retorna overweight como guía de hábitos saludables
      return overweight;
    }
    if (bmi < 30.0) return overweight;
    if (bmi < 35.0) return obesity1;
    return obesity2;
  }

  /// Retorna la categoría de IMC como texto descriptivo.
  static String getCategoryLabel(double bmi) {
    if (bmi < 18.5) return 'Bajo Peso';
    if (bmi < 25.0) return 'Peso Normal';
    if (bmi < 30.0) return 'Sobrepeso';
    if (bmi < 35.0) return 'Obesidad I';
    return 'Obesidad Severa';
  }

  /// Retorna el color asociado a la categoría de IMC.
  static int getCategoryColorValue(double bmi) {
    if (bmi < 18.5) return 0xFF2196F3; // Azul - Bajo peso
    if (bmi < 25.0) return 0xFF67B539; // Verde - Normal
    if (bmi < 30.0) return 0xFFFF9800; // Naranja - Sobrepeso
    if (bmi < 35.0) return 0xFFFF5722; // Rojo oscuro - Obesidad I
    return 0xFFB71C1C;                  // Rojo intenso - Obesidad severa
  }
}
