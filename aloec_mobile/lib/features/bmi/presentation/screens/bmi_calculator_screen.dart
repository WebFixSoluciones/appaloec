import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/aloec_button.dart';
import '../../../../core/widgets/aloec_text_field.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/bmi_entity.dart';
import '../../../subscriptions/domain/protocol_model.dart';

class BmiCalculatorScreen extends StatefulWidget {
  const BmiCalculatorScreen({super.key});

  @override
  State<BmiCalculatorScreen> createState() => _BmiCalculatorScreenState();
}

class _BmiCalculatorScreenState extends State<BmiCalculatorScreen> {
  final _ageCtrl = TextEditingController();
  final _heightCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  String _gender = 'Masculino';
  bool _isMetric = true;
  double? _bmi;
  String _statusLabel = '';
  int _statusColor = AppColors.primaryGreen.value;

  @override
  void dispose() {
    _ageCtrl.dispose();
    _heightCtrl.dispose();
    _weightCtrl.dispose();
    super.dispose();
  }

  void _calculate() {
    if (!_formKey.currentState!.validate()) return;

    double height = double.tryParse(_heightCtrl.text.trim()) ?? 0;
    double weight = double.tryParse(_weightCtrl.text.trim()) ?? 0;

    if (!_isMetric) {
      // Convertir de pulgadas/libras a cm/kg
      height = height * 2.54;
      weight = weight * 0.453592;
    }

    if (height <= 0 || weight <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor ingresa valores válidos de altura y peso.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final heightM = height / 100;
    final calculatedBmi = weight / (heightM * heightM);

    setState(() {
      _bmi = calculatedBmi;
      _statusLabel = ProtocolModel.getCategoryLabel(calculatedBmi);
      _statusColor = ProtocolModel.getCategoryColorValue(calculatedBmi);
    });
  }

  void _viewProtocol() {
    if (_bmi == null) {
      _showNeedCalculationSnackbar();
      return;
    }
    // Show premium paywall modal first
    _showPremiumModal();
  }

  void _showNeedCalculationSnackbar() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Primero calcula tu IMC para ver el protocolo sugerido.'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  void _showPremiumModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _PremiumProtocolModal(
        bmi: _bmi!,
        statusLabel: _statusLabel,
        statusColor: Color(_statusColor),
        onBuyPremium: () {
          context.pop();
          context.push('/premium-upsell');
        },
        onViewProtocol: () {
          context.pop();
          context.push('/bmi-result', extra: {
            'bmi': _bmi,
            'status': _statusLabel,
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Calculadora de IMC',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ─── Subtitle ────────────────────────────────────────────────
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calculate_outlined,
                        color: AppColors.primaryGreen),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Calcula tu Índice de Masa Corporal y recibe un protocolo médico personalizado.',
                        style: TextStyle(
                            fontSize: 13,
                            color: AppColors.textLight,
                            height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ─── Género ──────────────────────────────────────────────────
              const Text('Género',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 12),
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
              const SizedBox(height: 28),

              // ─── Unidades ────────────────────────────────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Ingresa los detalles',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  Row(
                    children: [
                      Text(_isMetric ? 'Métrico' : 'Estándar',
                          style: const TextStyle(
                              fontSize: 12, color: AppColors.primaryGreen,
                              fontWeight: FontWeight.bold)),
                      Switch(
                        value: _isMetric,
                        activeColor: AppColors.primaryGreen,
                        onChanged: (val) => setState(() => _isMetric = val),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // ─── Campos ──────────────────────────────────────────────────
              AloecTextField(
                controller: _ageCtrl,
                hintText: _isMetric ? 'Edad (años)' : 'Age (years)',
                prefixIcon: Icons.cake_outlined,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 14),
              AloecTextField(
                controller: _heightCtrl,
                hintText: _isMetric ? 'Altura (cm)' : 'Height (inches)',
                prefixIcon: Icons.height,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
              ),
              const SizedBox(height: 14),
              AloecTextField(
                controller: _weightCtrl,
                hintText: _isMetric ? 'Peso (kg)' : 'Weight (lbs)',
                prefixIcon: Icons.monitor_weight_outlined,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
              ),
              const SizedBox(height: 28),

              // ─── Resultado IMC ───────────────────────────────────────────
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 400),
                child: _bmi != null
                    ? _BmiResultDisplay(
                        key: ValueKey(_bmi),
                        bmi: _bmi!,
                        statusLabel: _statusLabel,
                        statusColor: Color(_statusColor),
                        onViewProtocol: _viewProtocol,
                      )
                    : _BmiScaleInfo(),
              ),
              const SizedBox(height: 24),

              // ─── Botón Calcular ──────────────────────────────────────────
              AloecButton(
                text: 'Calcular IMC',
                onPressed: _calculate,
              ),

              if (_bmi != null) ...[
                const SizedBox(height: 12),
                // CTA secundario para ver protocolo
                GestureDetector(
                  onTap: _viewProtocol,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1B5E20), Color(0xFF67B539)],
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.workspace_premium_rounded,
                            color: Colors.white, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Ver mi Protocolo Premium 🌟',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Widgets privados ─────────────────────────────────────────────────────────

class _BmiScaleInfo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Escala IMC',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          const SizedBox(height: 10),
          _ScaleRow(color: Colors.blue, label: 'Bajo peso', range: '< 18.5'),
          _ScaleRow(color: AppColors.primaryGreen, label: 'Peso normal', range: '18.5 – 24.9'),
          _ScaleRow(color: Colors.orange, label: 'Sobrepeso', range: '25 – 29.9'),
          _ScaleRow(color: Colors.deepOrange, label: 'Obesidad I', range: '30 – 34.5'),
          _ScaleRow(color: Colors.red[900]!, label: 'Obesidad Severa', range: '≥ 35'),
        ],
      ),
    );
  }
}

class _ScaleRow extends StatelessWidget {
  final Color color;
  final String label;
  final String range;
  const _ScaleRow({required this.color, required this.label, required this.range});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 8),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 12))),
          Text(range, style: TextStyle(fontSize: 12, color: AppColors.textLight, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _BmiResultDisplay extends StatelessWidget {
  final double bmi;
  final String statusLabel;
  final Color statusColor;
  final VoidCallback onViewProtocol;

  const _BmiResultDisplay({
    super.key,
    required this.bmi,
    required this.statusLabel,
    required this.statusColor,
    required this.onViewProtocol,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: statusColor.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: statusColor.withOpacity(0.15),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: statusColor,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: statusColor.withOpacity(0.4),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    bmi.toStringAsFixed(1),
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 20),
                  ),
                  const Text('IMC',
                      style: TextStyle(color: Colors.white70, fontSize: 10)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  statusLabel,
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: statusColor),
                ),
                const SizedBox(height: 4),
                Text(
                  'Tu resultado de IMC es ${bmi.toStringAsFixed(1)}',
                  style: TextStyle(fontSize: 12, color: AppColors.textLight),
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: onViewProtocol,
                  child: Text(
                    'Ver protocolo sugerido →',
                    style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Modal bottom sheet de upsell premium con protocolo sugerido.
class _PremiumProtocolModal extends StatelessWidget {
  final double bmi;
  final String statusLabel;
  final Color statusColor;
  final VoidCallback onBuyPremium;
  final VoidCallback onViewProtocol;

  const _PremiumProtocolModal({
    required this.bmi,
    required this.statusLabel,
    required this.statusColor,
    required this.onBuyPremium,
    required this.onViewProtocol,
  });

  @override
  Widget build(BuildContext context) {
    final protocolTitle = 'Protocolo ${ProtocolModel.getCategoryLabel(bmi)}';
    final protocolSubtitle = 'IMC ${bmi.toStringAsFixed(1)} – ${statusLabel}';
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
                color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
          ),
          const SizedBox(height: 20),

          // IMC badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: statusColor.withOpacity(0.3)),
            ),
            child: Text(
              'Tu IMC: ${bmi.toStringAsFixed(1)} – $statusLabel',
              style: TextStyle(
                  color: statusColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 14),
            ),
          ),
          const SizedBox(height: 16),

          Text(
            'Te recomendamos el:',
            style: TextStyle(color: AppColors.textLight, fontSize: 13),
          ),
          const SizedBox(height: 6),
          Text(
            protocolTitle,
            style: const TextStyle(
                fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textDark),
            textAlign: TextAlign.center,
          ),
          Text(
            protocolSubtitle,
            style: TextStyle(fontSize: 13, color: AppColors.textLight),
          ),
          const SizedBox(height: 20),

          // Premium features list
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primaryGreen.withOpacity(0.05),
              borderRadius: BorderRadius.circular(14),
              border:
                  Border.all(color: AppColors.primaryGreen.withOpacity(0.2)),
            ),
            child: Column(
              children: const [
                _FeatureRow(icon: '🗓️', text: 'Agenda diaria personalizada con horarios exactos'),
                _FeatureRow(icon: '🔔', text: 'Recordatorios automáticos para cada comida'),
                _FeatureRow(icon: '🎓', text: 'Acceso al videocurso de Terapia Gerson'),
                _FeatureRow(icon: '🥤', text: 'Recetas de jugos verdes exclusivas'),
                _FeatureRow(icon: '📊', text: 'Seguimiento de progreso semanal'),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Buy premium button
          GestureDetector(
            onTap: onBuyPremium,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1B5E20), Color(0xFF67B539)],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryGreen.withOpacity(0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Center(
                child: Text(
                  '⭐ Comprar Premium y Desbloquear',
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Preview button (free preview)
          TextButton(
            onPressed: onViewProtocol,
            child: const Text(
              'Ver vista previa gratuita →',
              style: TextStyle(color: AppColors.primaryGreen, fontSize: 13),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _FeatureRow extends StatelessWidget {
  final String icon;
  final String text;
  const _FeatureRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, color: AppColors.textDark),
            ),
          ),
        ],
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
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 110,
        height: 100,
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGreen : Colors.grey[100],
          borderRadius: BorderRadius.circular(16),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primaryGreen.withOpacity(0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon,
                size: 40, color: isSelected ? Colors.white : Colors.grey),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                  color: isSelected ? Colors.white : Colors.grey,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal),
            )
          ],
        ),
      ),
    );
  }
}
