/**
 * ALOEC Firestore Seed Script (Interactive)
 * Run: node seed-firestore.mjs
 * Prompts for admin email/password to bypass security rules.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { createInterface } from 'readline';

const firebaseConfig = {
  apiKey: "AIzaSyBSBkVK3-0t6kEN8IBE2saW2AuTQPzhGz4",
  authDomain: "app-aloec.firebaseapp.com",
  projectId: "app-aloec",
  storageBucket: "app-aloec.firebasestorage.app",
  messagingSenderId: "75165578833",
  appId: "1:75165578833:web:db63c434d7c68e848e6a70",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECIPES
// ═══════════════════════════════════════════════════════════════════════════════
const recipes = [
  {
    id: 'recipe_ensalada_frutas',
    title: 'Ensalada de Frutas ALOEC',
    description: 'Ensalada de frutas frescas de temporada, ideal para el desayuno. Rica en vitaminas, antioxidantes y fibra natural.',
    preparation: 'Paso 1: Seleccionar frutas frescas de temporada (papaya, piña, fresas, banano, manzana).\nPaso 2: Lavar y cortar las frutas en cubos medianos.\nPaso 3: Mezclar en un bowl grande.\nPaso 4: Servir inmediatamente.',
    imageUrl: '',
    ingredients: ['1 taza de papaya picada', '1 taza de piña picada', '1/2 taza de fresas', '1 banano', '1 manzana verde', 'Jugo de 1 limon (opcional)'],
    benefits: ['Alta en vitaminas A, C y E', 'Rica en antioxidantes naturales', 'Aporta fibra dietetica', 'Bajo en calorias', 'Ideal para la digestion matutina'],
    nutritionalValues: { calories: 180, proteins: 2, carbs: 42, fats: 0.5, fiber: 6, vitamins: ['Vitamina C', 'Vitamina A', 'Vitamina E', 'Acido folico'], minerals: ['Potasio', 'Magnesio'] },
    prepTime: 10,
    difficulty: 'Facil',
    category: 'breakfast',
    tags: ['desayuno', 'frutas', 'bajo en calorias', 'vitaminas', 'antioxidantes'],
    isPremium: false,
    isActive: true,
    order: 1,
  },
  {
    id: 'recipe_jugo_zanahoria',
    title: 'Jugo de Zanahoria Natural',
    description: 'Jugo de zanahoria fresco, fundamental en los protocolos ALOEC. Rico en betacarotenos y vitamina A.',
    preparation: 'Paso 1: Lavar bien 4-5 zanahorias grandes.\nPaso 2: Pasar por el extractor de jugos.\nPaso 3: Servir inmediatamente sin colar para conservar la fibra.\nPaso 4: Puede anadir una pizca de jengibre fresco.',
    imageUrl: '',
    ingredients: ['4-5 zanahorias grandes', 'Trozo pequeno de jengibre fresco (opcional)'],
    benefits: ['Rico en betacarotenos', 'Fortalece el sistema inmunologico', 'Mejora la salud de la piel', 'Apoya la salud ocular', 'Desintoxicante natural del higado'],
    nutritionalValues: { calories: 95, proteins: 2, carbs: 22, fats: 0.3, fiber: 4, vitamins: ['Vitamina A', 'Vitamina K', 'Vitamina C'], minerals: ['Potasio', 'Hierro'] },
    prepTime: 5,
    difficulty: 'Facil',
    category: 'green_juice',
    tags: ['jugo', 'zanahoria', 'detox', 'vitamina A', 'terapia gerson'],
    isPremium: false,
    isActive: true,
    order: 2,
  },
  {
    id: 'recipe_jugo_zanahoria_manzana',
    title: 'Jugo de Zanahoria y Manzana Verde',
    description: 'Combinacion clasica de los protocolos ALOEC. El dulzor natural de la zanahoria se complementa con la acidez de la manzana verde.',
    preparation: 'Paso 1: Lavar 3-4 zanahorias y 1 manzana verde.\nPaso 2: Cortar en trozos para el extractor.\nPaso 3: Alternar zanahoria y manzana en el extractor.\nPaso 4: Servir inmediatamente.',
    imageUrl: '',
    ingredients: ['3-4 zanahorias grandes', '1 manzana verde'],
    benefits: ['Combinacion ideal de betacarotenos y pectina', 'Regula los niveles de azucar', 'Fortalece el sistema digestivo', 'Apoya la desintoxicacion del higado'],
    nutritionalValues: { calories: 130, proteins: 2, carbs: 30, fats: 0.4, fiber: 5, vitamins: ['Vitamina A', 'Vitamina C', 'Vitamina K'], minerals: ['Potasio', 'Hierro', 'Magnesio'] },
    prepTime: 8,
    difficulty: 'Facil',
    category: 'green_juice',
    tags: ['jugo', 'zanahoria', 'manzana', 'detox', 'terapia gerson'],
    isPremium: false,
    isActive: true,
    order: 3,
  },
  {
    id: 'recipe_jugo_verde_renovador',
    title: 'Jugo Verde Renovador ALOEC',
    description: 'Jugo verde insignia de los protocolos ALOEC. Combina espinacas, manzana verde, jengibre, pina y hierbabuena para una desintoxicacion profunda.',
    preparation: 'Paso 1: Lavar un punado grande de espinacas frescas.\nPaso 2: Lavar y cortar 2 manzanas verdes, un trozo de jengibre, y pina.\nPaso 3: Anadir hojas de hierbabuena fresca.\nPaso 4: Pasar todos los ingredientes por el extractor de jugos.\nPaso 5: Servir inmediatamente.',
    imageUrl: '',
    ingredients: ['1 punado grande de espinacas frescas', '2 manzanas verdes', '1 trozo de jengibre fresco (2-3 cm)', '2 rodajas de pina', 'Hojas de hierbabuena fresca'],
    benefits: ['Potente desintoxicante del organismo', 'Rico en clorofila y hierro', 'Antiinflamatorio natural', 'Mejora la digestion', 'Energizante natural sin cafeina', 'Fortalece el sistema inmunologico'],
    nutritionalValues: { calories: 110, proteins: 3, carbs: 24, fats: 0.5, fiber: 5, vitamins: ['Vitamina A', 'Vitamina C', 'Vitamina K', 'Acido folico'], minerals: ['Hierro', 'Magnesio', 'Potasio', 'Calcio'] },
    prepTime: 10,
    difficulty: 'Facil',
    category: 'green_juice',
    tags: ['jugo verde', 'detox', 'espinaca', 'renovador', 'terapia gerson', 'insignia'],
    isPremium: true,
    isActive: true,
    order: 4,
  },
  {
    id: 'recipe_ensalada_colorida',
    title: 'Ensalada Colorida con Vinagre de Sidra',
    description: 'Ensalada variada con aderezo de vinagre de sidra de manzana. Acompana pescado al vapor y papas cocinadas en los protocolos de almuerzo.',
    preparation: 'Paso 1: Lavar y picar lechuga, tomate, pepino, zanahoria rallada, remolacha rallada y pimiento.\nPaso 2: Mezclar todas las verduras en un plato grande.\nPaso 3: Alinar con una cucharada pequena de vinagre de sidra de manzana.\nPaso 4: Acompanar con pescado al vapor y papas cocinadas.',
    imageUrl: '',
    ingredients: ['Lechuga fresca', 'Tomate', 'Pepino', 'Zanahoria rallada', 'Remolacha rallada', 'Pimiento', '1 cucharada de vinagre de sidra de manzana'],
    benefits: ['Alta en fibra y nutrientes esenciales', 'El vinagre de sidra mejora la digestion', 'Variedad de colores = variedad de antioxidantes', 'Baja en calorias y saciante'],
    nutritionalValues: { calories: 85, proteins: 3, carbs: 16, fats: 1, fiber: 5, vitamins: ['Vitamina A', 'Vitamina C', 'Vitamina K', 'Vitamina E'], minerals: ['Hierro', 'Potasio', 'Magnesio'] },
    prepTime: 15,
    difficulty: 'Facil',
    category: 'salad',
    tags: ['ensalada', 'almuerzo', 'vinagre de sidra', 'colorida', 'fibra'],
    isPremium: false,
    isActive: true,
    order: 5,
  },
  {
    id: 'recipe_sopa_vegetales',
    title: 'Sopa de Vegetales ALOEC',
    description: 'Sopa de vegetales frescos para la cena. Ligera, nutritiva y facil de digerir. Ideal para acompanar los protocolos de la noche.',
    preparation: 'Paso 1: Picar vegetales frescos de temporada (calabacin, zanahoria, apio, cebolla, tomate).\nPaso 2: Cocinar en agua a fuego medio por 20 minutos.\nPaso 3: Condimentar con hierbas frescas (sin sal refinada).\nPaso 4: Servir caliente.',
    imageUrl: '',
    ingredients: ['1 calabacin', '2 zanahorias', '2 tallos de apio', '1 cebolla', '2 tomates', 'Hierbas frescas al gusto', 'Agua purificada'],
    benefits: ['Facil de digerir', 'Hidratante', 'Rica en minerales', 'Ideal para la cena', 'Baja en calorias'],
    nutritionalValues: { calories: 75, proteins: 3, carbs: 14, fats: 0.5, fiber: 4, vitamins: ['Vitamina A', 'Vitamina C'], minerals: ['Potasio', 'Magnesio'] },
    prepTime: 30,
    difficulty: 'Facil',
    category: 'main_dish',
    tags: ['sopa', 'cena', 'vegetales', 'ligera', 'digestion'],
    isPremium: false,
    isActive: true,
    order: 6,
  },
  {
    id: 'recipe_batido_quinua_dorada',
    title: 'Batido de Leche de Quinua Dorada',
    description: 'Batido nutritivo y calorico disenado especialmente para el protocolo de recuperacion de peso.',
    preparation: 'Paso 1: Cocinar 1/2 taza de quinua lavada en 2 tazas de agua por 15 minutos.\nPaso 2: Licuar la quinua cocinada con 1 taza de leche vegetal.\nPaso 3: Anadir 1/2 cucharadita de curcuma, canela y miel.\nPaso 4: Licuar hasta obtener una consistencia cremosa.\nPaso 5: Servir tibio o frio segun preferencia.',
    imageUrl: '',
    ingredients: ['1/2 taza de quinua', '2 tazas de agua', '1 taza de leche vegetal', '1/2 cucharadita de curcuma', 'Canela al gusto', 'Miel de abeja al gusto'],
    benefits: ['Proteina vegetal completa', 'Alto en calorias saludables para recuperar peso', 'La curcuma es antiinflamatoria', 'Rico en hierro y magnesio', 'Sin lactosa'],
    nutritionalValues: { calories: 320, proteins: 12, carbs: 48, fats: 8, fiber: 5, vitamins: ['Vitamina B1', 'Vitamina B2', 'Vitamina B6', 'Vitamina E'], minerals: ['Hierro', 'Magnesio', 'Fosforo', 'Zinc', 'Manganeso'] },
    prepTime: 20,
    difficulty: 'Medio',
    category: 'smoothie',
    tags: ['batido', 'quinua', 'proteina', 'subir peso', 'desayuno', 'curcuma'],
    isPremium: true,
    isActive: true,
    order: 7,
  },
  {
    id: 'recipe_pescado_vapor',
    title: 'Pescado al Vapor con Papas y Ensalada',
    description: 'Pescado fresco al vapor acompanado de papas cocinadas y ensalada colorida. Plato principal de los protocolos ALOEC para el almuerzo.',
    preparation: 'Paso 1: Cocinar el filete de pescado al vapor por 15 minutos con hierbas.\nPaso 2: Cocinar papas en agua hasta que esten suaves.\nPaso 3: Preparar ensalada colorida con vinagre de sidra.\nPaso 4: Servir el pescado acompanado de papas y ensalada.',
    imageUrl: '',
    ingredients: ['1 filete de pescado fresco', 'Papas cocinadas', 'Ensalada colorida', 'Vinagre de sidra de manzana', 'Hierbas frescas'],
    benefits: ['Alto en omega-3', 'Proteina de alta calidad', 'Facil de digerir al ser al vapor', 'Completo en macronutrientes'],
    nutritionalValues: { calories: 350, proteins: 30, carbs: 35, fats: 8, fiber: 5, vitamins: ['Vitamina D', 'Vitamina B12', 'Vitamina C'], minerals: ['Fosforo', 'Selenio', 'Yodo', 'Potasio'] },
    prepTime: 30,
    difficulty: 'Medio',
    category: 'main_dish',
    tags: ['pescado', 'vapor', 'almuerzo', 'omega-3', 'proteina'],
    isPremium: false,
    isActive: true,
    order: 8,
  },
  {
    id: 'recipe_pollo_vapor_ensalada',
    title: 'Pollo al Vapor con Ensalada',
    description: 'Pollo de campo al vapor acompanado de ensalada fresca. Indicado en el protocolo de recuperacion de peso como cena proteica.',
    preparation: 'Paso 1: Cocinar la pechuga de pollo al vapor por 20 minutos.\nPaso 2: Preparar ensalada fresca con lechuga, tomate y pepino.\nPaso 3: Servir el pollo cortado en laminas sobre la ensalada.\nPaso 4: Aderezar con limon y hierbas.',
    imageUrl: '',
    ingredients: ['1 pechuga de pollo de campo', 'Lechuga fresca', 'Tomate', 'Pepino', 'Jugo de limon', 'Hierbas frescas'],
    benefits: ['Alto en proteina para recuperacion muscular', 'Bajo en grasa al ser al vapor', 'Pollo de campo libre de hormonas', 'Facil de digerir'],
    nutritionalValues: { calories: 250, proteins: 35, carbs: 8, fats: 6, fiber: 3, vitamins: ['Vitamina B3', 'Vitamina B6', 'Vitamina C'], minerals: ['Fosforo', 'Selenio', 'Potasio'] },
    prepTime: 25,
    difficulty: 'Facil',
    category: 'main_dish',
    tags: ['pollo', 'vapor', 'cena', 'proteina', 'bajo en grasa'],
    isPremium: false,
    isActive: true,
    order: 9,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOLS
// ═══════════════════════════════════════════════════════════════════════════════
const protocols = [
  {
    id: 'protocol_underweight',
    title: 'Protocolo para Recuperar Peso',
    subtitle: 'IMC menor a 18.5',
    description: 'Este protocolo esta disenado para los pacientes que deseen recuperar peso. Incluye batidos nutritivos de quinua dorada, suplementos y una alimentacion balanceada alta en calorias saludables.',
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
      { mealType: 'breakfast', time: '07:00 AM', label: 'Desayuno', icon: '\u{1F305}', recipeId: 'recipe_batido_quinua_dorada', recipeName: 'Batido de Leche de Quinua Dorada', recipeImageUrl: '', notes: '', items: ['Tomar una capsula de higado y pancreatina antes del desayuno'] },
      { mealType: 'morning_snack', time: '10:30 AM', label: 'Media Manana', icon: '\u{1F48A}', recipeId: '', recipeName: '', recipeImageUrl: '', notes: '', items: ['Tomar vitamina B12'] },
      { mealType: 'lunch', time: '01:00 PM', label: 'Almuerzo', icon: '\u{1F957}', recipeId: 'recipe_pescado_vapor', recipeName: 'Pescado al Vapor con Papas y Ensalada', recipeImageUrl: '', notes: '', items: ['Tomar una capsula de higado y pancreatina antes del almuerzo', 'Un plato de ensalada colorida con vinagre de sidra de manzana', 'Pescado al vapor, papas cocinadas y jugo de zanahoria'] },
      { mealType: 'afternoon_snack', time: '03:00 PM', label: 'Media Tarde', icon: '\u{1F964}', recipeId: 'recipe_batido_quinua_dorada', recipeName: 'Batido de Leche de Quinua Dorada', recipeImageUrl: '', notes: '', items: [] },
      { mealType: 'dinner', time: '06:00 PM', label: 'Cena', icon: '\u{1F357}', recipeId: 'recipe_pollo_vapor_ensalada', recipeName: 'Pollo al Vapor con Ensalada', recipeImageUrl: '', notes: 'Tomar capsula de selenio a las 16h00', items: ['Pollo al vapor mas ensalada', 'Tomar una capsula de higado y pancreatina despues de la cena'] },
    ],
  },
  {
    id: 'protocol_overweight',
    title: 'Protocolo para Perdida de Peso',
    subtitle: 'IMC 25 hasta 29.5 (Sobrepeso)',
    description: 'Este protocolo esta disenado para los pacientes que deseen perder peso con IMC entre 25 y 29.5. Incluye jugos verdes, suplementos naturales y enema de cafe nocturno.',
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
      'Si es su primer enema de cafe, puede comenzar con 250 ml de solucion e ir aumentando la cantidad progresivamente hasta llegar a un litro.',
      'Si usted es diabetico, reemplace el jugo verde renovador por el jugo verde de la terapia Gerson.',
      'Puede variar el pescado con pollo de campo libre de hormonas, 2 veces por semana.',
    ],
    schedule: [
      { mealType: 'breakfast', time: '08:00 AM', label: 'Desayuno', icon: '\u{1F34E}', recipeId: 'recipe_ensalada_frutas', recipeName: 'Ensalada de Frutas ALOEC', recipeImageUrl: '', notes: 'Caminar todos los dias por media hora', items: ['Tomar una capsula de higado y pancreatina antes del desayuno', 'Caminar todos los dias por media hora'] },
      { mealType: 'morning_snack', time: '10:30 AM', label: 'Media Manana', icon: '\u{1F955}', recipeId: 'recipe_jugo_verde_renovador', recipeName: 'Jugo Verde Renovador ALOEC', recipeImageUrl: '', notes: '', items: ['Jugo verde renovador', 'A las 11 AM tomar vitamina B12'] },
      { mealType: 'lunch', time: '01:00 PM', label: 'Almuerzo', icon: '\u{1F957}', recipeId: 'recipe_pescado_vapor', recipeName: 'Pescado al Vapor con Papas y Ensalada', recipeImageUrl: '', notes: '', items: ['Tomar una capsula de higado y pancreatina antes del almuerzo', 'Ensalada colorida con vinagre de sidra de manzana', 'Pescado al vapor, papas cocinadas y jugo de zanahoria'] },
      { mealType: 'afternoon_snack', time: '03:00 PM', label: 'Media Tarde', icon: '\u{1F964}', recipeId: 'recipe_jugo_zanahoria_manzana', recipeName: 'Jugo de Zanahoria y Manzana Verde', recipeImageUrl: '', notes: 'Tomar capsula de selenio a las 16h00', items: ['Jugo de zanahoria y manzana verde', 'Tomar una capsula de higado'] },
      { mealType: 'dinner', time: '06:00 PM', label: 'Cena', icon: '\u{1F375}', recipeId: 'recipe_sopa_vegetales', recipeName: 'Sopa de Vegetales ALOEC', recipeImageUrl: '', notes: 'Enema de cafe a las 21h00', items: ['Tomar una capsula de higado y pancreatina antes de la cena', 'Una sopa de vegetales a escoger'] },
    ],
  },
  {
    id: 'protocol_obesity1',
    title: 'Protocolo para Perdida de Peso',
    subtitle: 'IMC 30 hasta 34.5 (Obesidad I)',
    description: 'Este protocolo esta disenado para pacientes con IMC entre 30 y 34.5. Incluye jugos terapeuticos, suplementos naturales y enemas de cafe (manana y noche).',
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
      'Si es su primer enema de cafe, puede comenzar con 250 ml de solucion e ir aumentando progresivamente hasta un litro.',
      'Si usted es diabetico, reemplace el jugo verde renovador por el jugo verde de la terapia Gerson.',
      'Puede variar el pescado con pollo de campo libre de hormonas, 2 veces por semana.',
    ],
    schedule: [
      { mealType: 'breakfast', time: '08:00 AM', label: 'Desayuno', icon: '\u{1F34E}', recipeId: 'recipe_ensalada_frutas', recipeName: 'Ensalada de Frutas ALOEC', recipeImageUrl: '', notes: 'Caminar todos los dias por media hora', items: ['Tomar una capsula de higado y pancreatina antes del desayuno', 'Jugo de zanahoria', 'Caminar todos los dias por media hora'] },
      { mealType: 'morning_snack', time: '10:00 AM', label: 'Media Manana', icon: '\u{1F955}', recipeId: 'recipe_jugo_verde_renovador', recipeName: 'Jugo Verde Renovador ALOEC', recipeImageUrl: '', notes: '', items: ['Jugo verde renovador', 'A las 11 AM tomar vitamina B12'] },
      { mealType: 'lunch', time: '01:00 PM', label: 'Almuerzo', icon: '\u{1F957}', recipeId: 'recipe_pescado_vapor', recipeName: 'Pescado al Vapor con Papas y Ensalada', recipeImageUrl: '', notes: 'Enema de cafe a las 14h00', items: ['Tomar una capsula de higado y pancreatina antes del almuerzo', 'Ensalada colorida con vinagre de sidra de manzana', 'Pescado al vapor, papas cocinadas y jugo de zanahoria'] },
      { mealType: 'afternoon_snack', time: '03:00 PM', label: 'Media Tarde', icon: '\u{1F964}', recipeId: 'recipe_jugo_zanahoria_manzana', recipeName: 'Jugo de Zanahoria y Manzana Verde', recipeImageUrl: '', notes: 'Tomar capsula de selenio a las 16h00', items: ['Jugo de zanahoria y manzana verde', 'Tomar una capsula de higado'] },
      { mealType: 'dinner', time: '06:00 PM', label: 'Cena', icon: '\u{1F375}', recipeId: 'recipe_sopa_vegetales', recipeName: 'Sopa de Vegetales ALOEC', recipeImageUrl: '', notes: 'Enema de cafe a las 21h00', items: ['Tomar una capsula de higado y pancreatina antes de la cena', 'Una sopa de vegetales a escoger'] },
    ],
  },
  {
    id: 'protocol_obesity2_3',
    title: 'Protocolo para Perdida de Peso',
    subtitle: 'IMC 40 o Superior (Obesidad Severa)',
    description: 'Este protocolo esta disenado para pacientes con IMC de 40 o superior. Incluye enzimas digestivas adicionales, cardo mariano para el higado y enemas de cafe. Requiere supervision medica.',
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
      'Si es su primer enema de cafe, puede comenzar con 250 ml de solucion e ir aumentando progresivamente hasta un litro.',
      'Si usted es diabetico, reemplace el jugo verde renovador por el jugo verde de la terapia Gerson.',
      'Consultar con su medico antes de iniciar este protocolo.',
    ],
    schedule: [
      { mealType: 'breakfast', time: '08:00 AM', label: 'Desayuno', icon: '\u{1F34E}', recipeId: 'recipe_ensalada_frutas', recipeName: 'Ensalada de Frutas ALOEC', recipeImageUrl: '', notes: 'Caminar todos los dias por media hora', items: ['Tomar una capsula de higado y pancreatina antes del desayuno', 'Tomar enzimas digestivas antes del desayuno', 'Jugo de zanahoria', 'Caminar todos los dias por media hora'] },
      { mealType: 'morning_snack', time: '10:00 AM', label: 'Media Manana', icon: '\u{1F955}', recipeId: 'recipe_jugo_verde_renovador', recipeName: 'Jugo Verde Renovador ALOEC', recipeImageUrl: '', notes: '', items: ['Jugo verde renovador', 'A las 11 AM tomar vitamina B12', 'Tomar una capsula de cardo mariano'] },
      { mealType: 'lunch', time: '01:00 PM', label: 'Almuerzo', icon: '\u{1F957}', recipeId: 'recipe_pescado_vapor', recipeName: 'Pescado al Vapor con Papas y Ensalada', recipeImageUrl: '', notes: 'Enema de cafe a las 14h00', items: ['Tomar una capsula de higado y pancreatina antes del almuerzo', 'Ensalada colorida con vinagre de sidra de manzana', 'Pescado al vapor, papas cocinadas y jugo de zanahoria'] },
      { mealType: 'afternoon_snack', time: '03:00 PM', label: 'Media Tarde', icon: '\u{1F964}', recipeId: 'recipe_jugo_zanahoria_manzana', recipeName: 'Jugo de Zanahoria y Manzana Verde', recipeImageUrl: '', notes: 'Tomar capsula de selenio a las 16h00', items: ['Jugo de zanahoria y manzana verde', 'Tomar una capsula de higado'] },
      { mealType: 'dinner', time: '06:00 PM', label: 'Cena', icon: '\u{1F37D}\u{FE0F}', recipeId: '', recipeName: '', recipeImageUrl: '', notes: 'Enema de cafe a las 21h00. Aderezo: vinagre de sidra y aceite de linaza.', items: ['Tomar una capsula de higado y pancreatina antes de la cena', 'Ensalada y papas al horno', 'Aderezo: vinagre de sidra de manzana y una cucharada de aceite de linaza'] },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBERSHIPS
// ═══════════════════════════════════════════════════════════════════════════════
const memberships = [
  {
    id: 'plan-mensual',
    name: 'Plan Mensual',
    price: 9.99,
    durationDays: 30,
    features: ['Acceso a todos los protocolos', 'Recordatorios diarios', 'Videocurso de Terapia Gerson', 'Recetas exclusivas', 'Seguimiento de progreso'],
    isActive: true,
  },
  {
    id: 'plan-trimestral',
    name: 'Plan Trimestral',
    price: 24.99,
    durationDays: 90,
    features: ['Todo lo del Plan Mensual', '3 meses de acceso', 'Ahorro del 17%', 'Guia de enemas de cafe'],
    isActive: true,
  },
  {
    id: 'plan-anual',
    name: 'Plan Anual',
    price: 79.99,
    durationDays: 365,
    features: ['Todo lo del Plan Trimestral', '12 meses de acceso', 'Ahorro del 33%', 'Consulta personalizada por WhatsApp'],
    isActive: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SEED
// ═══════════════════════════════════════════════════════════════════════════════
async function seed() {
  console.log('\n=== ALOEC Seed Script ===\n');

  const email = await ask('Email del admin: ');
  const password = await ask('Password del admin: ');

  console.log('\nAutenticando...');
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    console.log('Autenticado como admin.\n');
  } catch (err) {
    console.error('Error de autenticacion:', err.message);
    console.error('Verifica que el email y password sean correctos.');
    process.exit(1);
  }

  console.log('Seeding recipes...');
  for (const recipe of recipes) {
    const { id, ...data } = recipe;
    await setDoc(doc(db, 'recipes', id), {
      ...data,
      viewsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  ${recipe.title}`);
  }
  console.log(`  -> ${recipes.length} recipes created\n`);

  console.log('Seeding protocols...');
  for (const protocol of protocols) {
    const { id, ...data } = protocol;
    await setDoc(doc(db, 'diet_protocols', id), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  ${protocol.title} (${protocol.bmiCategory})`);
  }
  console.log(`  -> ${protocols.length} protocols created\n`);

  console.log('Seeding memberships...');
  for (const m of memberships) {
    const { id, ...data } = m;
    await setDoc(doc(db, 'memberships', id), {
      ...data,
      updatedAt: new Date(),
    });
    console.log(`  ${m.name} - $${m.price} / ${m.durationDays} dias`);
  }
  console.log(`  -> ${memberships.length} memberships created\n`);

  console.log('Seed completo!');
  console.log('Ve al panel admin para verificar los datos.\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
