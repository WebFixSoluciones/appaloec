import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import 'package:go_router/go_router.dart';

class JuiceDetailScreen extends StatelessWidget {
  final String juiceId;

  const JuiceDetailScreen({super.key, required this.juiceId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.orange[50],
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: Colors.black), onPressed: () => context.pop()),
        actions: [
          IconButton(icon: const Icon(Icons.more_horiz, color: Colors.black), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              height: 250,
              color: Colors.orange[50],
              child: const Icon(Icons.local_drink, size: 150, color: Colors.orange),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Zumo de naranja', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      Icon(Icons.favorite, color: AppColors.error),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('Antioxidante, Vitamina C', style: TextStyle(color: Colors.grey)),
                  const SizedBox(height: 24),
                  const Text('Nutrición', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: const [
                      _NutritionChip(icon: Icons.local_fire_department, label: '180kCal'),
                      _NutritionChip(icon: Icons.water_drop, label: '30g grasas'),
                      _NutritionChip(icon: Icons.fitness_center, label: '20g proteínas'),
                    ],
                  ),
                  const SizedBox(height: 32),
                  const Text('Descripciones', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 16),
                  const Text(
                    'El jugo de naranja es un extracto líquido de la fruta del naranjo, producido al exprimir o escariar naranjas. Viene en varias variedades diferentes, que incluyen naranja sanguina, naranjas navel, naranja valencia, clementina y mandarina. Leer más...',
                    style: TextStyle(color: Colors.grey, height: 1.5),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

class _NutritionChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _NutritionChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.orange),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}
