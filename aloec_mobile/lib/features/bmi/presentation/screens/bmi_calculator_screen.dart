import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/aloec_button.dart';
import '../../../../core/widgets/aloec_text_field.dart';
import '../../../../core/constants/app_colors.dart';

class BmiCalculatorScreen extends StatefulWidget {
  const BmiCalculatorScreen({super.key});

  @override
  State<BmiCalculatorScreen> createState() => _BmiCalculatorScreenState();
}

class _BmiCalculatorScreenState extends State<BmiCalculatorScreen> {
  final _ageCtrl = TextEditingController();
  final _heightCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();

  String _gender = 'Masculino';
  bool _isMetric = true;
  double _bmi = 18.5; // Mock for UI

  void _showPremiumModal() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Align(
                alignment: Alignment.topRight,
                child: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => context.pop(),
                ),
              ),
              const Text(
                'Ver programa de dieta',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              const Text(
                'Para ver el programa de la dieta debe ser un miembro premium.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              AloecButton(
                text: 'Comprar Premium',
                onPressed: () {
                  context.pop();
                  context.push('/premium-upsell');
                },
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Calculadora de IMC', style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Género', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                _GenderButton(
                  title: 'Masculino',
                  icon: Icons.male,
                  isSelected: _gender == 'Masculino',
                  onTap: () => setState(() => _gender = 'Masculino'),
                ),
                const SizedBox(width: 16),
                _GenderButton(
                  title: 'Femenino',
                  icon: Icons.female,
                  isSelected: _gender == 'Femenino',
                  onTap: () => setState(() => _gender = 'Femenino'),
                ),
              ],
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Ingrese los detalles', style: TextStyle(fontWeight: FontWeight.bold)),
                Row(
                  children: [
                    const Text('Estándar', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    Switch(
                      value: _isMetric,
                      activeColor: AppColors.primaryGreen,
                      onChanged: (val) => setState(() => _isMetric = val),
                    ),
                    const Text('Métrico', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            AloecTextField(
              controller: _ageCtrl,
              hintText: 'Su edad',
              prefixIcon: Icons.cake_outlined,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            AloecTextField(
              controller: _heightCtrl,
              hintText: 'Tu altura',
              prefixIcon: Icons.height,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            AloecTextField(
              controller: _weightCtrl,
              hintText: 'Tu peso',
              prefixIcon: Icons.monitor_weight_outlined,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 32),
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '${_bmi.toStringAsFixed(1)}\nNormal',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'Bajo peso = <18,5\nPeso normal = 18,5–24,9\nSobrepeso = 25–29,9\nObesidad = IMC de 30 o más',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ),
                TextButton(
                  onPressed: _showPremiumModal,
                  child: const Text('Ver horario >', style: TextStyle(color: AppColors.primaryGreen)),
                )
              ],
            ),
            const SizedBox(height: 32),
            AloecButton(
              text: 'Calcular IMC',
              onPressed: () {},
            )
          ],
        ),
      ),
    );
  }
}

class _GenderButton extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _GenderButton({
    required this.title,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 100,
        height: 100,
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGreen : Colors.grey[100],
          borderRadius: BorderRadius.circular(15),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: isSelected ? Colors.white : Colors.grey),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(color: isSelected ? Colors.white : Colors.grey),
            )
          ],
        ),
      ),
    );
  }
}
