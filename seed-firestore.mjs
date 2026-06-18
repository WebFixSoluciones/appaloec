/**
 * ALOEC Firestore Seed Script
 * Populates recipes and protocols from real PDF protocol data.
 * Run: node seed-firestore.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBSBkVK3-0t6kEN8IBE2saW2AuTQPzhGz4",
  authDomain: "app-aloec.firebaseapp.com",
  projectId: "app-aloec",
  storageBucket: "app-aloec.firebasestorage.app",
  messagingSenderId: "75165578833",
  appId: "1:75165578833:web:db63c434d7c68e848e6a70",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ═══════════════════════════════════════════════════════════════════════════════
// RECIPES — extracted from real ALOEC protocols
// ═══════════════════════════════════════════════════════════════════════════════
const recipes = [
  {
    id: 'recipe_ensalada_frutas',
    title: 'Ensalada de Frutas ALOEC',
    description: 'Ensalada de frutas frescas de temporada, ideal para el desayuno. Rica en vitaminas, antioxidantes y fibra natural.',
    preparation: 'Paso 1: Seleccionar frutas frescas de temporada (papaya, piña, fresas, banano, manzana).\nPaso 2: Lavar y cortar las frutas en cubos medianos.\nPaso 3: Mezclar en un bowl grande.\nPaso 4: Servir inmediatamente para conservar las vitaminas.',
    imageUrl: '',
    ingredients: ['1 taza de papaya picada', '1 taza de piña picada', '1/2 taza de fresas', '1 banano', '1 manzana verde', 'Jugo de 1 limón (opcional)'],
    benefits: ['Alta en vitaminas A, C y E', 'Rica en antioxidantes naturales', 'Aporta fibra dietética', 'Bajo en calorías', 'Ideal para la digestión matutina'],
    nutritionalValues: { calories: 180, proteins: 2, carbs: 42, fats: 0.5, fiber: 6, vitamins: ['Vitamina C', 'Vitamina A', 'Vitamina E', 'Ácido fólico'], minerals: ['Potasio', 'Magnesio'] },
    prepTime: 10,
    difficulty: 'Fácil',
    category: 'breakfast',
    tags: ['desayuno', 'frutas', 'bajo en calorías', 'vitaminas', 'antioxidantes'],
    isPremium: false,
    isActive: true,
    order: 1,
  },
  {
    id: 'recipe_jugo_zanahoria',
    title: 'Jugo de Zanahoria Natural',
    description: 'Jugo de zanahoria fresco, fundamental en los protocolos ALOEC. Rico en betacarotenos y vitamina A.',
    preparation: 'Paso 1: Lavar bien 4-5 zanahorias grandes.\nPaso 2: Pasar por el extractor de jugos.\nPaso 3: Servir inmediatamente sin colar para conservar la fibra.\nPaso 4: Puede añadir una pizca de jengibre fresco.',
    imageUrl: '',
    ingredients: ['4-5 zanahorias grandes', 'Trozo pequeño de jengibre fresco (opcional)'],
    benefits: ['Rico en betacarotenos', 'Fortalece el sistema inmunológico', 'Mejora la salud de la piel', 'Apoya la salud ocular', 'Desintoxicante natural del hígado'],
    nutritionalValues: { calories: 95, proteins: 2, carbs: 22, fats: 0.3, fiber: 4, vitamins: ['Vitamina A', 'Vitamina K', 'Vitamina C'], minerals: ['Potasio', 'Hierro'] },
    prepTime: 5,
    difficulty: 'Fácil',
    category: 'green_juice',
    tags: ['jugo', 'zanahoria', 'detox', 'vitamina A', 'terapia gerson'],
    isPremium: false,
    isActive: true,
    order: 2,
  },
  {
    id: 'recipe_jugo_zanahoria_manzana',
    title: 'Jugo de Zanahoria y Manzana Verde',
    description: 'Combinación clásica de los protocolos ALOEC. El dulzor natural de la zanahoria se complementa con la acidez de la manzana verde.',
    preparation: 'Paso 1: Lavar 3-4 zanahorias y 1 manzana verde.\nPaso 2: Cortar en trozos para el extractor.\nPaso 3: Alternar zanahoria y manzana en el extractor.\nPaso 4: Servir inmediatamente.',
    imageUrl: '',
    ingredients: ['3-4 zanahorias grandes', '1 manzana verde'],
    benefits: ['Combinación ideal de betacarotenos y pectina', 'Regula los niveles de azúcar', 'Fortalece el sistema digestivo', 'Apoya la desintoxicación del hígado'],
    nutritionalValues: { calories: 130, proteins: 2, carbs: 30, fats: 0.4, fiber: 5, vitamins: ['Vitamina A', 'Vitamina C', 'Vitamina K'], minerals: ['Potasio', 'Hierro', 'Magnesio'] },
    prepTime: 8,
    difficulty: 'Fácil',
    category: 'green_juice',
    tags: ['jugo', 'zanahoria', 'manzana', 'detox', 'terapia gerson'],
    isPremium: false,
    isActive: true,
    order: 3,
  },
  {
    id: 'recipe_jugo_verde_renovador',
    title: 'Jugo Verde Renovador ALOEC',
    description: 'Jugo verde insignia de los protocolos ALOEC. Combina espinacas, manzana verde, jengibre, piña y hierbabuena para una desintoxicación profunda.',
    preparation: 'Paso 1: Lavar un puñado grande de espinacas frescas.\nPaso 2: Lavar y cortar 2 manzanas verdes, un trozo de jengibre, y piña.\nPaso 3: Añadir hojas de hierbabuena fresca.\nPaso 4: Pasar todos los ingredientes por el extractor de jugos.\nPaso 5: Servir inmediatamente. Consultar preparación completa en libro "Ama lo que comes" página 68.',
    imageUrl: '',
    ingredients: ['1 puñado grande de espinacas frescas', '2 manzanas verdes', '1 trozo de jengibre fresco (2-3 cm)', '2 rodajas de piña', 'Hojas de hierbabuena fresca'],
    benefits: ['Potente desintoxicante del organismo', 'Rico en clorofila y hierro', 'Antiinflamatorio natural', 'Mejora la digestión', 'Energizante natural sin cafeína', 'Fortalece el sistema inmunológico'],
    nutritionalValues: { calories: 110, proteins: 3, carbs: 24, fats: 0.5, fiber: 5, vitamins: ['Vitamina A', 'Vitamina C', 'Vitamina K', 'Ácido fólico'], minerals: ['Hierro', 'Magnesio', 'Potasio', 'Calcio'] },
    prepTime: 10,
    difficulty: 'Fácil',
    category: 'green_juice',
    tags: ['jugo verde', 'detox', 'espinaca', 'renovador', 'terapia gerson', 'insignia'],
    isPremium: true,
    isActive: true,
    order: 4,
  },
  {
    id: 'recipe_ensalada_colorida',
    title: 'Ensalada Colorida con Vinagre de Sidra',
    description: 'Ensalada variada con aderezo de vinagre de sidra de manzana. Acompaña pescado al vapor y papas cocinadas en los protocolos de almuerzo.',
    preparation: 'Paso 1: Lavar y picar lechuga, tomate, pepino, zanahoria rallada, remolacha rallada y pimiento.\nPaso 2: Mezclar todas las verduras en un plato grande.\nPaso 3: Aliñar con una cucharada pequeña de vinagre de sidra de manzana.\nPaso 4: Acompañar con pescado al vapor y papas cocinadas.',
    imageUrl: '',
    ingredients: ['Lechuga fresca', 'Tomate', 'Pepino', 'Zanahoria rallada', 'Remolacha rallada', 'Pimiento', '1 cucharada de vinagre de sidra de manzana'],
    benefits: ['Alta en fibra y nutrientes esenciales', 'El vinagre de sidra mejora la digestión', 'Variedad de colores = variedad de antioxidantes', 'Baja en calorías y saciante'],
    nutritionalValues: { calories: 85, proteins: 3, carbs: 16, fats: 1, fiber: 5, vitamins: ['Vitamina A', 'Vitamina C', 'Vitamina K', 'Vitamina E'], minerals: ['Hierro', 'Potasio', 'Magnesio'] },
    prepTime: 15,
    difficulty: 'Fácil',
    category: 'salad',
    tags: ['ensalada', 'almuerzo', 'vinagre de sidra', 'colorida', 'fibra'],
    isPremium: false,
    isActive: true,
    order: 5,
  },
  {
    id: 'recipe_sopa_vegetales',
    title: 'Sopa de Vegetales ALOEC',
    description: 'Sopa de vegetales frescos para la cena. Ligera, nutritiva y fácil de digerir. Ideal para acompañar los protocolos de la noche.',
    preparation: 'Paso 1: Picar vegetales frescos de temporada (calabacín, zanahoria, apio, cebolla, tomate).\nPaso 2: Cocinar en agua a fuego medio por 20 minutos.\nPaso 3: Condimentar con hierbas frescas (sin sal refinada).\nPaso 4: Servir caliente.',
    imageUrl: '',
    ingredients: ['1 calabacín', '2 zanahorias', '2 tallos de apio', '1 cebolla', '2 tomates', 'Hierbas frescas al gusto', 'Agua purificada'],
    benefits: ['Fácil de digerir', 'Hidratante', 'Rica en minerales', 'Ideal para la cena', 'Baja en calorías'],
    nutritionalValues: { calories: 75, proteins: 3, carbs: 14, fats: 0.5, fiber: 4, vitamins: ['Vitamina A', 'Vitamina C'], minerals: ['Potasio', 'Sodio natural', 'Magnesio'] },
    prepTime: 30,
    difficulty: 'Fácil',
    category: 'main_dish',
    tags: ['sopa', 'cena', 'vegetales', 'ligera', 'digestión'],
    isPremium: false,
    isActive: true,
    order: 6,
  },
  {
    id: 'recipe_batido_quinua_dorada',
    title: 'Batido de Leche de Quinua Dorada',
    description: 'Batido nutritivo y calórico diseñado especialmente para el protocolo de recuperación de peso. La quinua aporta proteínas completas y la cúrcuma propiedades antiinflamatorias.',
    preparation: 'Paso 1: Cocinar 1/2 taza de quinua lavada en 2 tazas de agua por 15 minutos.\nPaso 2: Licuar la quinua cocinada con 1 taza de leche vegetal.\nPaso 3: Añadir 1/2 cucharadita de cúrcuma (para el color dorado), canela y miel.\nPaso 4: Licuar hasta obtener una consistencia cremosa.\nPaso 5: Servir tibio o frío según preferencia.',
    imageUrl: '',
    ingredients: ['1/2 taza de quinua', '2 tazas de agua', '1 taza de leche vegetal', '1/2 cucharadita de cúrcuma', 'Canela al gusto', 'Miel de abeja al gusto'],
    benefits: ['Proteína vegetal completa (todos los aminoácidos esenciales)', 'Alto en calorías saludables para recuperar peso', 'La cúrcuma es antiinflamatoria', 'Rico en hierro y magnesio', 'Sin lactosa'],
    nutritionalValues: { calories: 320, proteins: 12, carbs: 48, fats: 8, fiber: 5, vitamins: ['Vitamina B1', 'Vitamina B2', 'Vitamina B6', 'Vitamina E'], minerals: ['Hierro', 'Magnesio', 'Fósforo', 'Zinc', 'Manganeso'] },
    prepTime: 20,
    difficulty: 'Medio',
    category: 'smoothie',
    tags: ['batido', 'quinua', 'proteína', 'subir peso', 'desayuno', 'cúrcuma'],
    isPremium: true,
    isActive: true,
    order: 7,
  },
  {
    id: 'recipe_ensalada_papas_horno',
    title: 'Ensalada con Papas al Horno',
    description: 'Ensalada sustanciosa con papas al horno, aderezada con vinagre de sidra y aceite de linaza. Especial para protocolos de IMC alto.',
    preparation: 'Paso 1: Lavar y cortar papas en cubos, hornear a 180°C por 25 minutos.\nPaso 2: Preparar ensalada verde con lechuga, tomate y pepino.\nPaso 3: Combinar las papas tibias con la ensalada.\nPaso 4: Aderezar con vinagre de sidra de manzana y una cucharada de aceite de linaza.',
    imageUrl: '',
    ingredients: ['3 papas medianas', 'Lechuga fresca', 'Tomate', 'Pepino', 'Vinagre de sidra de manzana', '1 cucharada de aceite de linaza'],
    benefits: ['Saciante y nutritiva', 'El aceite de linaza aporta omega-3', 'Fuente de carbohidratos complejos', 'El vinagre de sidra mejora la digestión'],
    nutritionalValues: { calories: 280, proteins: 6, carbs: 45, fats: 8, fiber: 6, vitamins: ['Vitamina C', 'Vitamina B6'], minerals: ['Potasio', 'Hierro', 'Magnesio'] },
    prepTime: 35,
    difficulty: 'Medio',
    category: 'main_dish',
    tags: ['ensalada', 'papas', 'cena', 'aceite de linaza', 'omega-3'],
    isPremium: false,
    isActive: true,
    order: 8,
  },
  {
    id: 'recipe_pollo_vapor_ensalada',
    title: 'Pollo al Vapor con Ensalada',
    description: 'Pollo de campo al vapor acompañado de ensalada fresca. Indicado en el protocolo de recuperación de peso como cena proteica.',
    preparation: 'Paso 1: Cocinar la pechuga de pollo al vapor por 20 minutos.\nPaso 2: Preparar ensalada fresca con lechuga, tomate y pepino.\nPaso 3: Servir el pollo cortado en láminas sobre la ensalada.\nPaso 4: Aderezar con limón y hierbas.',
    imageUrl: '',
    ingredients: ['1 pechuga de pollo de campo', 'Lechuga fresca', 'Tomate', 'Pepino', 'Jugo de limón', 'Hierbas frescas'],
    benefits: ['Alto en proteína para recuperación muscular', 'Bajo en grasa al ser al vapor', 'Pollo de campo libre de hormonas', 'Fácil de digerir'],
    nutritionalValues: { calories: 250, proteins: 35, carbs: 8, fats: 6, fiber: 3, vitamins: ['Vitamina B3', 'Vitamina B6', 'Vitamina C'], minerals: ['Fósforo', 'Selenio', 'Potasio'] },
    prepTime: 25,
    difficulty: 'Fácil',
    category: 'main_dish',
    tags: ['pollo', 'vapor', 'cena', 'proteína', 'bajo en grasa'],
    isPremium: false,
    isActive: true,
    order: 9,
  },
  {
    id: 'recipe_pescado_vapor',
    title: 'Pescado al Vapor con Papas y Ensalada',
    description: 'Pescado fresco al vapor acompañado de papas cocinadas y ensalada colorida. Plato principal de los protocolos ALOEC para el almuerzo.',
    preparation: 'Paso 1: Cocinar el filete de pescado al vapor por 15 minutos con hierbas.\nPaso 2: Cocinar papas en agua hasta que estén suaves.\nPaso 3: Preparar ensalada colorida con vinagre de sidra.\nPaso 4: Servir el pescado acompañado de papas y ensalada.\nPaso 5: Acompañar con jugo de zanahoria.',
    imageUrl: '',
    ingredients: ['1 filete de pescado fresco', 'Papas cocinadas', 'Ensalada colorida', 'Vinagre de sidra de manzana', 'Hierbas frescas', 'Jugo de zanahoria para acompañar'],
    benefits: ['Alto en omega-3', 'Proteína de alta calidad', 'Fácil de digerir al ser al vapor', 'Completo en macronutrientes'],
    nutritionalValues: { calories: 350, proteins: 30, carbs: 35, fats: 8, fiber: 5, vitamins: ['Vitamina D', 'Vitamina B12', 'Vitamina C'], minerals: ['Fósforo', 'Selenio', 'Yodo', 'Potasio'] },
    prepTime: 30,
    difficulty: 'Medio',
    category: 'main_dish',
    tags: ['pescado', 'vapor', 'almuerzo', 'omega-3', 'proteína'],
    isPremium: false,
    isActive: true,
    order: 10,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOLS — extracted from real ALOEC PDF documents
// ═══════════════════════════════════════════════════════════════════════════════
const protocols = [
  {
    id: 'protocol_underweight',
    title: 'Protocolo para Recuperar Peso',
    subtitle: 'IMC menor a 18.5',
    description: 'Este protocolo está diseñado para los pacientes que deseen recuperar peso. Incluye batidos nutritivos de quinua dorada, suplementos y una alimentación balanceada alta en calorías saludables.',
    imageUrl: '',
    bmiCategory: 'underweight',
    bmiMin: null,
    bmiMax: 18.5,
    linkedCourseTag: 'terapia_gerson',
    linkedCourses: [],
    isPremium: true,
    isActive: true,
    order: 1,
    importantNotes: [
      'Puede variar el pescado con pollo de campo libre de hormonas, 2 veces por semana.',
      'Una vez que usted haya recuperado su peso ideal, puede asistir al gimnasio a fortalecer su masa muscular.',
      'Contacto y preguntas: +593 99 950 4321',
    ],
    schedule: [
      {
        mealType: 'breakfast',
        time: '07:00 AM',
        label: 'Desayuno',
        icon: '🌅',
        recipeId: 'recipe_batido_quinua_dorada',
        recipeName: 'Batido de Leche de Quinua Dorada',
        recipeImageUrl: '',
        notes: '',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes del desayuno',
          'Batido de leche de quinua dorada',
        ],
      },
      {
        mealType: 'morning_snack',
        time: '10:30 AM',
        label: 'Media Mañana',
        icon: '💊',
        recipeId: '',
        recipeName: '',
        recipeImageUrl: '',
        notes: '',
        items: [
          'Tomar vitamina B12',
        ],
      },
      {
        mealType: 'lunch',
        time: '01:00 PM',
        label: 'Almuerzo',
        icon: '🥗',
        recipeId: 'recipe_pescado_vapor',
        recipeName: 'Pescado al Vapor con Papas y Ensalada',
        recipeImageUrl: '',
        notes: '',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes del almuerzo',
          'Un plato de ensalada colorida con vinagre de sidra de manzana',
          'Pescado al vapor, papas cocinadas y jugo de zanahoria',
        ],
      },
      {
        mealType: 'afternoon_snack',
        time: '03:00 PM',
        label: 'Media Tarde',
        icon: '🥤',
        recipeId: 'recipe_batido_quinua_dorada',
        recipeName: 'Batido de Leche de Quinua Dorada',
        recipeImageUrl: '',
        notes: '',
        items: [
          'Batido de leche de quinua dorada',
        ],
      },
      {
        mealType: 'dinner',
        time: '06:00 PM',
        label: 'Cena',
        icon: '🍗',
        recipeId: 'recipe_pollo_vapor_ensalada',
        recipeName: 'Pollo al Vapor con Ensalada',
        recipeImageUrl: '',
        notes: 'Tomar cápsula de selenio a las 16h00',
        items: [
          'Pollo al vapor más ensalada',
          'Tomar una cápsula de hígado y pancreatina después de la cena',
        ],
      },
    ],
  },
  {
    id: 'protocol_overweight',
    title: 'Protocolo para Pérdida de Peso',
    subtitle: 'IMC 25 hasta 29.5 (Sobrepeso)',
    description: 'Este protocolo está diseñado para los pacientes que deseen perder peso con IMC entre 25 y 29.5. Incluye jugos verdes, suplementos naturales y enema de café nocturno.',
    imageUrl: '',
    bmiCategory: 'overweight',
    bmiMin: 25,
    bmiMax: 30,
    linkedCourseTag: 'terapia_gerson',
    linkedCourses: [],
    isPremium: true,
    isActive: true,
    order: 2,
    importantNotes: [
      'Si es su primer enema de café, puede comenzar con 250 ml de solución e ir aumentando la cantidad progresivamente hasta llegar a un litro.',
      'Si usted es diabético, reemplace el jugo verde renovador por el jugo verde de la terapia Gerson.',
      'Puede variar el pescado con pollo de campo libre de hormonas, 2 veces por semana.',
      'Contacto y preguntas: +593 99 950 4321',
    ],
    schedule: [
      {
        mealType: 'breakfast',
        time: '08:00 AM',
        label: 'Desayuno',
        icon: '🍎',
        recipeId: 'recipe_ensalada_frutas',
        recipeName: 'Ensalada de Frutas ALOEC',
        recipeImageUrl: '',
        notes: 'Caminar todos los días por media hora',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes del desayuno',
          'Ensalada de frutas',
          'Caminar todos los días por media hora',
        ],
      },
      {
        mealType: 'morning_snack',
        time: '10:30 AM',
        label: 'Media Mañana',
        icon: '🥕',
        recipeId: 'recipe_jugo_verde_renovador',
        recipeName: 'Jugo Verde Renovador ALOEC',
        recipeImageUrl: '',
        notes: '',
        items: [
          'Jugo verde renovador',
          'A las 11 AM tomar vitamina B12',
        ],
      },
      {
        mealType: 'lunch',
        time: '01:00 PM',
        label: 'Almuerzo',
        icon: '🥗',
        recipeId: 'recipe_pescado_vapor',
        recipeName: 'Pescado al Vapor con Papas y Ensalada',
        recipeImageUrl: '',
        notes: '',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes del almuerzo',
          'Ensalada colorida con vinagre de sidra de manzana',
          'Pescado al vapor, papas cocinadas y jugo de zanahoria',
        ],
      },
      {
        mealType: 'afternoon_snack',
        time: '03:00 PM',
        label: 'Media Tarde',
        icon: '🥤',
        recipeId: 'recipe_jugo_zanahoria_manzana',
        recipeName: 'Jugo de Zanahoria y Manzana Verde',
        recipeImageUrl: '',
        notes: 'Tomar cápsula de selenio a las 16h00',
        items: [
          'Jugo de zanahoria y manzana verde',
          'Tomar una cápsula de hígado',
          '16h00: tomar una cápsula de selenio',
        ],
      },
      {
        mealType: 'dinner',
        time: '06:00 PM',
        label: 'Cena',
        icon: '🍵',
        recipeId: 'recipe_sopa_vegetales',
        recipeName: 'Sopa de Vegetales ALOEC',
        recipeImageUrl: '',
        notes: 'Enema de café a las 21h00',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes de la cena',
          'Una sopa de vegetales a escoger',
          '21h00 - Enema de café: consultar preparación en libro "Ama lo que comes" páginas 72 a 75',
        ],
      },
    ],
  },
  {
    id: 'protocol_obesity1',
    title: 'Protocolo para Pérdida de Peso',
    subtitle: 'IMC 30 hasta 34.5 (Obesidad I)',
    description: 'Este protocolo está diseñado para los pacientes que deseen perder peso con IMC entre 30 y 34.5. Incluye jugos terapéuticos, suplementos naturales y enemas de café (mañana y noche).',
    imageUrl: '',
    bmiCategory: 'obesity1',
    bmiMin: 30,
    bmiMax: 35,
    linkedCourseTag: 'terapia_gerson',
    linkedCourses: [],
    isPremium: true,
    isActive: true,
    order: 3,
    importantNotes: [
      'Si es su primer enema de café, puede comenzar con 250 ml de solución e ir aumentando la cantidad progresivamente hasta llegar a un litro.',
      'Si usted es diabético, reemplace el jugo verde renovador por el jugo verde de la terapia Gerson.',
      'Puede variar el pescado con pollo de campo libre de hormonas, 2 veces por semana.',
      'Contacto y preguntas: +593 99 950 4321',
    ],
    schedule: [
      {
        mealType: 'breakfast',
        time: '08:00 AM',
        label: 'Desayuno',
        icon: '🍎',
        recipeId: 'recipe_ensalada_frutas',
        recipeName: 'Ensalada de Frutas ALOEC',
        recipeImageUrl: '',
        notes: 'Caminar todos los días por media hora',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes del desayuno',
          'Ensalada de frutas y jugo de zanahoria',
          'Caminar todos los días por media hora',
        ],
      },
      {
        mealType: 'morning_snack',
        time: '10:00 AM',
        label: 'Media Mañana',
        icon: '🥕',
        recipeId: 'recipe_jugo_verde_renovador',
        recipeName: 'Jugo Verde Renovador ALOEC',
        recipeImageUrl: '',
        notes: '',
        items: [
          'Jugo verde renovador',
          'A las 11 AM tomar vitamina B12',
        ],
      },
      {
        mealType: 'lunch',
        time: '01:00 PM',
        label: 'Almuerzo',
        icon: '🥗',
        recipeId: 'recipe_pescado_vapor',
        recipeName: 'Pescado al Vapor con Papas y Ensalada',
        recipeImageUrl: '',
        notes: 'Enema de café a las 14h00',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes del almuerzo',
          'Ensalada colorida con vinagre de sidra de manzana',
          'Pescado al vapor, papas cocinadas y jugo de zanahoria',
          '14h00 - Enema de café: consultar preparación en libro "Ama lo que comes" páginas 72 a 75',
        ],
      },
      {
        mealType: 'afternoon_snack',
        time: '03:00 PM',
        label: 'Media Tarde',
        icon: '🥤',
        recipeId: 'recipe_jugo_zanahoria_manzana',
        recipeName: 'Jugo de Zanahoria y Manzana Verde',
        recipeImageUrl: '',
        notes: 'Tomar cápsula de selenio a las 16h00',
        items: [
          'Jugo de zanahoria y manzana verde',
          'Tomar una cápsula de hígado',
          '16h00: tomar una cápsula de selenio',
        ],
      },
      {
        mealType: 'dinner',
        time: '06:00 PM',
        label: 'Cena',
        icon: '🍵',
        recipeId: 'recipe_sopa_vegetales',
        recipeName: 'Sopa de Vegetales ALOEC',
        recipeImageUrl: '',
        notes: 'Enema de café a las 21h00',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes de la cena',
          'Una sopa de vegetales a escoger',
          '21h00 - Enema de café: consultar preparación en libro "Ama lo que comes" páginas 72 a 75',
        ],
      },
    ],
  },
  {
    id: 'protocol_obesity2_3',
    title: 'Protocolo para Pérdida de Peso',
    subtitle: 'IMC 40 o Superior (Obesidad Severa)',
    description: 'Este protocolo está diseñado para los pacientes que deseen perder peso con IMC de 40 o superior. Incluye enzimas digestivas adicionales, cardo mariano para el hígado y enemas de café. Requiere supervisión médica.',
    imageUrl: '',
    bmiCategory: 'obesity3',
    bmiMin: 40,
    bmiMax: null,
    linkedCourseTag: 'terapia_gerson',
    linkedCourses: [],
    isPremium: true,
    isActive: true,
    order: 5,
    importantNotes: [
      'Si es su primer enema de café, puede comenzar con 250 ml de solución e ir aumentando la cantidad progresivamente hasta llegar a un litro.',
      'Si usted es diabético, reemplace el jugo verde renovador por el jugo verde de la terapia Gerson.',
      'Puede variar el pescado con pollo de campo libre de hormonas, 2 veces por semana.',
      'Consultar con su médico antes de iniciar este protocolo.',
      'Contacto y preguntas: +593 99 950 4321',
    ],
    schedule: [
      {
        mealType: 'breakfast',
        time: '08:00 AM',
        label: 'Desayuno',
        icon: '🍎',
        recipeId: 'recipe_ensalada_frutas',
        recipeName: 'Ensalada de Frutas ALOEC',
        recipeImageUrl: '',
        notes: 'Caminar todos los días por media hora',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes del desayuno',
          'Tomar enzimas digestivas antes del desayuno',
          'Ensalada de frutas y jugo de zanahoria',
          'Caminar todos los días por media hora',
        ],
      },
      {
        mealType: 'morning_snack',
        time: '10:00 AM',
        label: 'Media Mañana',
        icon: '🥕',
        recipeId: 'recipe_jugo_verde_renovador',
        recipeName: 'Jugo Verde Renovador ALOEC',
        recipeImageUrl: '',
        notes: '',
        items: [
          'Jugo verde renovador',
          'A las 11 AM tomar vitamina B12',
          'Tomar una cápsula de cardo mariano',
        ],
      },
      {
        mealType: 'lunch',
        time: '01:00 PM',
        label: 'Almuerzo',
        icon: '🥗',
        recipeId: 'recipe_pescado_vapor',
        recipeName: 'Pescado al Vapor con Papas y Ensalada',
        recipeImageUrl: '',
        notes: 'Enema de café a las 14h00',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes del almuerzo',
          'Ensalada colorida con vinagre de sidra de manzana',
          'Pescado al vapor, papas cocinadas y jugo de zanahoria',
          '14h00 - Enema de café: consultar preparación en libro "Ama lo que comes" páginas 72 a 75',
        ],
      },
      {
        mealType: 'afternoon_snack',
        time: '03:00 PM',
        label: 'Media Tarde',
        icon: '🥤',
        recipeId: 'recipe_jugo_zanahoria_manzana',
        recipeName: 'Jugo de Zanahoria y Manzana Verde',
        recipeImageUrl: '',
        notes: 'Tomar cápsula de selenio a las 16h00',
        items: [
          'Jugo de zanahoria y manzana verde',
          'Tomar una cápsula de hígado',
          '16h00: tomar una cápsula de selenio',
        ],
      },
      {
        mealType: 'dinner',
        time: '06:00 PM',
        label: 'Cena',
        icon: '🍽️',
        recipeId: 'recipe_ensalada_papas_horno',
        recipeName: 'Ensalada con Papas al Horno',
        recipeImageUrl: '',
        notes: 'Enema de café a las 21h00. Aderezo: vinagre de sidra y aceite de linaza.',
        items: [
          'Tomar una cápsula de hígado y pancreatina antes de la cena',
          'Ensalada y papas al horno',
          'Aderezo: vinagre de sidra de manzana y una cucharada de aceite de linaza',
          '21h00 - Enema de café: consultar preparación en libro "Ama lo que comes" páginas 72 a 75',
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// APP CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const appConfig = {
  primaryColor: '#2E7D32',
  accentColor: '#66BB6A',
  banners: [],
  welcomeMessage: '¡Bienvenido a ALOEC! Tu camino hacia una vida saludable.',
  appVersion: {
    minimum: '1.0.0',
    latest: '1.0.0',
    updateUrl: '',
  },
  maintenanceMode: false,
  updatedAt: new Date(),
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════
async function seed() {
  console.log('🌱 Starting Firestore seed...\n');

  // Seed recipes
  console.log('📗 Seeding recipes...');
  for (const recipe of recipes) {
    const { id, ...data } = recipe;
    await setDoc(doc(db, 'recipes', id), {
      ...data,
      viewsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  ✅ ${recipe.title}`);
  }
  console.log(`  → ${recipes.length} recipes created\n`);

  // Seed protocols
  console.log('📋 Seeding protocols...');
  for (const protocol of protocols) {
    const { id, ...data } = protocol;
    await setDoc(doc(db, 'diet_protocols', id), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  ✅ ${protocol.title} (${protocol.bmiCategory})`);
  }
  console.log(`  → ${protocols.length} protocols created\n`);

  // Seed app_config
  console.log('⚙️  Seeding app_config...');
  await setDoc(doc(db, 'app_config', 'main'), appConfig);
  console.log('  ✅ app_config/main created\n');

  console.log('🎉 Seed complete! All data is now in Firestore.');
  console.log('   Open the admin panel to verify the data.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
