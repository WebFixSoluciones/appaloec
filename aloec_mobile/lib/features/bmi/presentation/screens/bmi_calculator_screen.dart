import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/bmi_entity.dart';
import '../../data/bmi_repository.dart';
import '../../../subscriptions/domain/protocol_model.dart';
import '../../../subscriptions/data/protocols_repository.dart';

class BmiCalculatorScreen extends StatefulWidget {
  const BmiCalculatorScreen({super.key});

  @override
  State<BmiCalculatorScreen> createState() => _BmiCalculatorScreenState();
}

class _BmiCalculatorScreenState extends State<BmiCalculatorScreen> {
  final _ageCtrl = TextEditingController();
  final _heightCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _scrollController = ScrollController();
  final _formKey = GlobalKey<FormState>();

  String _gender = 'Masculino';
  bool _isMetric = true;
  double? _bmi;
  double? _calculatedHeightM;
  double? _calculatedWeightKg;
  double? _minHealthyWeight;
  double? _maxHealthyWeight;
  String _statusLabel = '';
  int _statusColor = AppColors.primaryGreen.value;

  bool _saving = false;
  bool _isPremium = false;
  bool _isLoadingProtocol = false;
  ProtocolModel? _resolvedProtocol;

  @override
  void initState() {
    super.initState();
    _checkPremium();
    _heightCtrl.addListener(_onHeightChanged);
  }

  void _onHeightChanged() {
    setState(() {});
  }

  Future<void> _checkPremium() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    try {
      final doc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get();
      if (mounted) {
        setState(() {
          _isPremium = doc.data()?['isPremium'] == true;
        });
      }
    } catch (e) {
      debugPrint('Error checking premium status: $e');
    }
  }

  @override
  void dispose() {
    _heightCtrl.removeListener(_onHeightChanged);
    _ageCtrl.dispose();
    _heightCtrl.dispose();
    _weightCtrl.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  /// Feedback visual amigable en tiempo real mientras el usuario escribe la estatura.
  String? get _heightDetectionFeedback {
    final raw = _heightCtrl.text.replaceAll(',', '.').trim();
    if (raw.isEmpty) return null;
    final val = double.tryParse(raw);
    if (val == null || val <= 0) return null;

    if (!_isMetric) {
      final cm = (val * 2.54).round();
      return '✓ Detectado: ${val.toStringAsFixed(1)} pulgadas ($cm cm)';
    }

    if (val < 3.0) {
      final cm = (val * 100).round();
      return '✓ Detectado automáticamente: ${val.toStringAsFixed(2)} m ($cm cm)';
    } else if (val >= 30.0 && val <= 280.0) {
      final m = val / 100.0;
      return '✓ Detectado automáticamente: ${val.toStringAsFixed(0)} cm (${m.toStringAsFixed(2)} m)';
    } else {
      return 'Por favor ingresa una altura válida (ej. 1.56 m o 156 cm)';
    }
  }

  /// Parsea la altura a metros de forma inteligente y a prueba de errores.
  double _parseHeightToMeters(String raw) {
    final clean = raw.replaceAll(',', '.').trim();
    final val = double.tryParse(clean) ?? 0.0;
    if (val <= 0) return 0.0;

    if (!_isMetric) {
      return val * 0.0254; // pulgadas a metros
    }

    if (val < 3.0) {
      // El usuario escribió en metros (ej. 1.56 o 1.70)
      return val;
    } else if (val >= 30.0 && val <= 280.0) {
      // El usuario escribió en centímetros (ej. 156 o 170)
      return val / 100.0;
    }
    return val / 100.0;
  }

  /// Parsea el peso a kilogramos sanitizando coma o punto.
  double _parseWeightToKg(String raw) {
    final clean = raw.replaceAll(',', '.').trim();
    final val = double.tryParse(clean) ?? 0.0;
    if (val <= 0) return 0.0;

    if (!_isMetric) {
      return val * 0.45359237; // libras a kilogramos
    }
    return val;
  }

  Future<void> _calculate() async {
    FocusScope.of(context).unfocus();

    final age = int.tryParse(_ageCtrl.text.trim()) ?? 0;
    final heightM = _parseHeightToMeters(_heightCtrl.text);
    final weightKg = _parseWeightToKg(_weightCtrl.text);

    if (age <= 0 || age > 120) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor ingresa una edad válida.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (heightM < 0.5 || heightM > 2.6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor ingresa una estatura válida (ej. 1.56 m o 156 cm).'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (weightKg < 20 || weightKg > 350) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor ingresa un peso válido en kilogramos.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final calculatedBmi = weightKg / (heightM * heightM);
    final heightCm = heightM * 100.0;

    // Rango de peso saludable (IMC 18.5 a 24.9 según la OMS)
    final minHealthy = 18.5 * (heightM * heightM);
    final maxHealthy = 24.9 * (heightM * heightM);

    setState(() {
      _bmi = calculatedBmi;
      _calculatedHeightM = heightM;
      _calculatedWeightKg = weightKg;
      _minHealthyWeight = minHealthy;
      _maxHealthyWeight = maxHealthy;
      _statusLabel = BmiEntity.categoryLabelFromValue(calculatedBmi);
      _statusColor = BmiEntity.categoryColorValueFromValue(calculatedBmi);
      _isLoadingProtocol = true;
    });

    // Desplazamiento fluido hacia abajo para mostrar el diagnóstico de inmediato
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          390.0,
          duration: const Duration(milliseconds: 650),
          curve: Curves.easeOutCubic,
        );
      }
    });

    // Guardar registro en Firestore
    _saveRecord(calculatedBmi, heightCm, weightKg);

    // Cargar protocolo correspondiente
    try {
      final protocol = await ProtocolsRepository().getProtocolForBmi(calculatedBmi);
      if (mounted) {
        setState(() {
          _resolvedProtocol = protocol;
          _isLoadingProtocol = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading protocol for BMI: $e');
      if (mounted) setState(() => _isLoadingProtocol = false);
    }
  }

  Future<void> _saveRecord(double bmiValue, double heightCm, double weightKg) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    setState(() => _saving = true);

    try {
      final record = BmiEntity(
        uid: user.uid,
        age: int.tryParse(_ageCtrl.text.trim()) ?? 0,
        heightCm: heightCm,
        weightKg: weightKg,
        bmiValue: bmiValue,
        status: BmiEntity.categoryFromValue(bmiValue),
        createdAt: DateTime.now(),
      );
      await BmiRepository().saveRecord(record);
    } catch (e) {
      debugPrint('Error saving BMI record: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _onOpenProtocol() {
    if (_bmi == null) return;

    if (_isPremium) {
      if (_resolvedProtocol != null) {
        context.push('/protocol-detail', extra: {
          'protocol': _resolvedProtocol,
        });
      } else {
        context.push('/bmi-result', extra: {
          'bmi': _bmi,
          'status': _statusLabel,
          'protocol': null,
        });
      }
      return;
    }

    _showPremiumModal();
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
            'protocol': _resolvedProtocol,
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBFDFB),
      appBar: AppBar(
        title: const Text(
          'Calculadora de IMC',
          style: TextStyle(
            color: Color(0xFF1E293B),
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          controller: _scrollController,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Banner Informativo
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.primaryGreen.withOpacity(0.2),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen.withOpacity(0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.health_and_safety_rounded,
                        color: AppColors.primaryGreen,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Calcula tu Índice de Masa Corporal y recibe tu protocolo nutricional personalizado.',
                        style: TextStyle(
                          fontSize: 13,
                          color: Color(0xFF334155),
                          height: 1.35,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Selector de Género con Iconos
              const Text(
                'Género',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                  color: Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  _GenderPill(
                    title: 'Masculino',
                    icon: Icons.male_rounded,
                    isSelected: _gender == 'Masculino',
                    onTap: () => setState(() => _gender = 'Masculino'),
                  ),
                  const SizedBox(width: 12),
                  _GenderPill(
                    title: 'Femenino',
                    icon: Icons.female_rounded,
                    isSelected: _gender == 'Femenino',
                    onTap: () => setState(() => _gender = 'Femenino'),
                  ),
                ],
              ),
              const SizedBox(height: 22),

              // Encabezado de Campos y Switch de Unidades
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Ingresa tus datos',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  Row(
                    children: [
                      Text(
                        _isMetric ? 'Métrico (cm/kg)' : 'Imperial (in/lb)',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.primaryGreen,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Transform.scale(
                        scale: 0.85,
                        child: Switch(
                          value: _isMetric,
                          activeColor: AppColors.primaryGreen,
                          onChanged: (val) {
                            setState(() {
                              _isMetric = val;
                              _bmi = null; // Reiniciar resultado para re-cálculo
                            });
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Tarjeta contenedora de inputs
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: [
                    // Campo 1: Edad
                    _DataInputField(
                      controller: _ageCtrl,
                      label: 'Edad',
                      hintText: 'Ej. 35',
                      prefixIcon: Icons.cake_outlined,
                      suffixText: 'años',
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 16),

                    // Campo 2: Estatura / Altura con detección inteligente
                    _DataInputField(
                      controller: _heightCtrl,
                      label: 'Estatura / Altura',
                      hintText: _isMetric ? 'Ej. 1.56 m o 156 cm' : 'Ej. 65',
                      prefixIcon: Icons.height_rounded,
                      suffixText: _isMetric ? 'm / cm' : 'pulgadas',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      feedbackText: _heightDetectionFeedback,
                    ),
                    const SizedBox(height: 16),

                    // Campo 3: Peso Actual
                    _DataInputField(
                      controller: _weightCtrl,
                      label: 'Peso Actual',
                      hintText: _isMetric ? 'Ej. 70' : 'Ej. 154',
                      prefixIcon: Icons.monitor_weight_outlined,
                      suffixText: _isMetric ? 'kg' : 'lbs',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Botón Principal de Acción: Calcular
              GestureDetector(
                onTap: _saving ? null : _calculate,
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
                        color: AppColors.primaryGreen.withOpacity(0.35),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.calculate_rounded,
                        color: Colors.white,
                        size: 22,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _saving ? 'Guardando...' : 'Calcular mi Diagnóstico',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // ── SECCIÓN INTEGRADA DE RESULTADO (TODO EN LA MISMA PANTALLA) ──
              if (_bmi != null) ...[
                _IntegratedBmiResultCard(
                  bmi: _bmi!,
                  heightM: _calculatedHeightM ?? 1.6,
                  weightKg: _calculatedWeightKg ?? 70.0,
                  minHealthyWeight: _minHealthyWeight ?? 50.0,
                  maxHealthyWeight: _maxHealthyWeight ?? 65.0,
                  statusLabel: _statusLabel,
                  statusColor: Color(_statusColor),
                  isLoadingProtocol: _isLoadingProtocol,
                  protocol: _resolvedProtocol,
                  onOpenProtocol: _onOpenProtocol,
                ),
              ] else ...[
                // Escala de referencia informativa antes de calcular
                _BmiReferenceCard(),
              ],
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES UI: SELECTOR DE GÉNERO CON ICONOS
// ─────────────────────────────────────────────────────────────────────────────
class _GenderPill extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _GenderPill({
    required this.title,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.primaryGreen.withOpacity(0.08)
                : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? AppColors.primaryGreen : Colors.grey.shade300,
              width: isSelected ? 2.0 : 1.0,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.primaryGreen.withOpacity(0.12),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : [],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 24,
                color: isSelected ? AppColors.primaryGreen : Colors.grey.shade600,
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  color: isSelected ? AppColors.primaryGreen : const Color(0xFF1E293B),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  fontSize: 15,
                ),
              ),
              if (isSelected) ...[
                const SizedBox(width: 6),
                const Icon(
                  Icons.check_rounded,
                  size: 18,
                  color: AppColors.primaryGreen,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPO DE ENTRADA CON SUFIJO Y MENSAJE DE CONFIRMACIÓN EN TIEMPO REAL
// ─────────────────────────────────────────────────────────────────────────────
class _DataInputField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String hintText;
  final IconData prefixIcon;
  final String suffixText;
  final TextInputType keyboardType;
  final String? feedbackText;

  const _DataInputField({
    required this.controller,
    required this.label,
    required this.hintText,
    required this.prefixIcon,
    required this.suffixText,
    required this.keyboardType,
    this.feedbackText,
  });

  @override
  Widget build(BuildContext context) {
    final hasFeedback = feedbackText != null && feedbackText!.isNotEmpty;
    final isError = hasFeedback && feedbackText!.startsWith('Por favor');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: Row(
            children: [
              Padding(
                padding: const EdgeInsets.only(left: 12, right: 8),
                child: Icon(prefixIcon, color: Colors.grey.shade600, size: 22),
              ),
              Expanded(
                child: TextField(
                  controller: controller,
                  keyboardType: keyboardType,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                  decoration: InputDecoration(
                    hintText: hintText,
                    hintStyle: TextStyle(
                      color: Colors.grey.shade400,
                      fontWeight: FontWeight.normal,
                      fontSize: 14,
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              Container(
                margin: const EdgeInsets.only(right: 10),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  suffixText,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade700,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (hasFeedback) ...[
          const SizedBox(height: 5),
          Padding(
            padding: const EdgeInsets.only(left: 4),
            child: Row(
              children: [
                Icon(
                  isError ? Icons.warning_amber_rounded : Icons.check_circle_outline_rounded,
                  size: 14,
                  color: isError ? Colors.red.shade700 : const Color(0xFF1B5E20),
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    feedbackText!,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isError ? Colors.red.shade700 : const Color(0xFF1B5E20),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN INTEGRADA DE RESULTADO (TODO EN LA MISMA PANTALLA)
// ─────────────────────────────────────────────────────────────────────────────
class _IntegratedBmiResultCard extends StatelessWidget {
  final double bmi;
  final double heightM;
  final double weightKg;
  final double minHealthyWeight;
  final double maxHealthyWeight;
  final String statusLabel;
  final Color statusColor;
  final bool isLoadingProtocol;
  final ProtocolModel? protocol;
  final VoidCallback onOpenProtocol;

  const _IntegratedBmiResultCard({
    required this.bmi,
    required this.heightM,
    required this.weightKg,
    required this.minHealthyWeight,
    required this.maxHealthyWeight,
    required this.statusLabel,
    required this.statusColor,
    required this.isLoadingProtocol,
    required this.protocol,
    required this.onOpenProtocol,
  });

  @override
  Widget build(BuildContext context) {
    // Cálculo de diferencia con respecto al peso saludable
    String statusSubtitle = '';
    if (bmi < 18.5) {
      final diff = (minHealthyWeight - weightKg).clamp(0.0, 999.0);
      statusSubtitle = 'A ${diff.toStringAsFixed(1)} kg de tu peso ideal mínimo';
    } else if (bmi <= 24.9) {
      statusSubtitle = '¡Felicidades! Estás en tu rango saludable';
    } else {
      final diff = (weightKg - maxHealthyWeight).clamp(0.0, 999.0);
      statusSubtitle = 'A solo ${diff.toStringAsFixed(1)} kg de tu peso ideal';
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: statusColor.withOpacity(0.25), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: statusColor.withOpacity(0.12),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Fila 1: Indicador Circular + Categoría y Diferencia
          Row(
            children: [
              // Gauge Circular
              _CircularBmiGauge(
                bmi: bmi,
                color: statusColor,
              ),
              const SizedBox(width: 18),
              // Detalles de categoría
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: statusColor.withOpacity(0.3)),
                      ),
                      child: Text(
                        statusLabel,
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      statusSubtitle,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF475569),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),

          // Fila 2: Barra de Espectro OMS de 4 Colores con Aguja
          _BmiSpectrumBar(currentBmi: bmi),
          const SizedBox(height: 20),

          // Fila 3: Rango de Peso Saludable Recomendado
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFC8E6C9)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.eco_rounded,
                  color: AppColors.primaryGreen,
                  size: 22,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF1B5E20),
                      ),
                      children: [
                        const TextSpan(text: 'Tu peso saludable recomendado: '),
                        TextSpan(
                          text:
                              '${minHealthyWeight.toStringAsFixed(1)} kg - ${maxHealthyWeight.toStringAsFixed(1)} kg',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Fila 4: Tarjeta de Protocolo Sugerido
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Color(0xFFE8F5E9),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.spa_rounded,
                        color: AppColors.primaryGreen,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Protocolo Sugerido:',
                            style: TextStyle(
                              fontSize: 11,
                              color: Color(0xFF64748B),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            protocol?.title ?? 'Desintoxicación y Jugos Alcalinizantes',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (protocol?.subtitle.isNotEmpty == true) ...[
                  const SizedBox(height: 8),
                  Text(
                    protocol!.subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF64748B),
                      height: 1.35,
                    ),
                  ),
                ],
                const SizedBox(height: 14),

                // Botón para acceder al protocolo y menú diario
                GestureDetector(
                  onTap: onOpenProtocol,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.primaryGreen,
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(
                          Icons.menu_book_rounded,
                          color: AppColors.primaryGreen,
                          size: 18,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Ver mi Protocolo y Menú Diario',
                          style: TextStyle(
                            color: AppColors.primaryGreen,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
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

// ─────────────────────────────────────────────────────────────────────────────
// GAUGE CIRCULAR CON VALOR DE IMC
// ─────────────────────────────────────────────────────────────────────────────
class _CircularBmiGauge extends StatelessWidget {
  final double bmi;
  final Color color;

  const _CircularBmiGauge({
    required this.bmi,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 90,
      height: 90,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: const Size(90, 90),
            painter: _GaugeRingPainter(color: color, bmi: bmi),
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                bmi.toStringAsFixed(1),
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
              const Text(
                'IMC',
                style: TextStyle(
                  fontSize: 11,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _GaugeRingPainter extends CustomPainter {
  final Color color;
  final double bmi;

  _GaugeRingPainter({required this.color, required this.bmi});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 6;

    final bgPaint = Paint()
      ..color = color.withOpacity(0.15)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 7
      ..strokeCap = StrokeCap.round;

    final activePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 7
      ..strokeCap = StrokeCap.round;

    // Arco de fondo (270 grados)
    const startAngle = 135 * (math.pi / 180);
    const sweepTotal = 270 * (math.pi / 180);

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepTotal,
      false,
      bgPaint,
    );

    // Mapeo de IMC (15.0 a 40.0)
    final clamped = bmi.clamp(15.0, 40.0);
    final factor = (clamped - 15.0) / (40.0 - 15.0);
    final activeSweep = sweepTotal * factor;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      activeSweep,
      false,
      activePaint,
    );
  }

  @override
  bool shouldRepaint(covariant _GaugeRingPainter oldDelegate) {
    return oldDelegate.bmi != bmi || oldDelegate.color != color;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BARRA DE ESPECTRO OMS DE 4 COLORES CON AGUJA / PUNTERO
// ─────────────────────────────────────────────────────────────────────────────
class _BmiSpectrumBar extends StatelessWidget {
  final double currentBmi;

  const _BmiSpectrumBar({required this.currentBmi});

  @override
  Widget build(BuildContext context) {
    // Mapeo de la aguja entre 15 y 40 de IMC (factor 0.0 a 1.0)
    final clampedBmi = currentBmi.clamp(15.0, 40.0);
    final progress = (clampedBmi - 15.0) / (40.0 - 15.0);

    return Column(
      children: [
        // Indicador del puntero con valor
        LayoutBuilder(
          builder: (context, constraints) {
            final barWidth = constraints.maxWidth;
            final pointerLeft = (progress * barWidth).clamp(10.0, barWidth - 30.0);

            return Stack(
              clipBehavior: Clip.none,
              children: [
                SizedBox(height: 22, width: barWidth),
                Positioned(
                  left: pointerLeft - 10,
                  top: 0,
                  child: Column(
                    children: [
                      Text(
                        currentBmi.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      const Icon(
                        Icons.arrow_drop_down,
                        size: 14,
                        color: Color(0xFF1E293B),
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),

        // Barra de 4 segmentos
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: Row(
            children: [
              const Expanded(
                flex: 18,
                child: SizedBox(
                  height: 8,
                  child: ColoredBox(color: Color(0xFF2196F3)),
                ),
              ),
              const SizedBox(width: 2),
              const Expanded(
                flex: 30,
                child: SizedBox(
                  height: 8,
                  child: ColoredBox(color: Color(0xFF2E7D32)),
                ),
              ),
              const SizedBox(width: 2),
              const Expanded(
                flex: 25,
                child: SizedBox(
                  height: 8,
                  child: ColoredBox(color: Color(0xFFFF9800)),
                ),
              ),
              const SizedBox(width: 2),
              const Expanded(
                flex: 27,
                child: SizedBox(
                  height: 8,
                  child: ColoredBox(color: Color(0xFFD32F2F)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 6),

        // Leyendas de la escala
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            _ScaleLegend(label: 'Bajo peso\n<18.5', color: Color(0xFF2196F3)),
            _ScaleLegend(label: 'Normal\n18.5-24.9', color: Color(0xFF2E7D32)),
            _ScaleLegend(label: 'Sobrepeso\n25-29.9', color: Color(0xFFFF9800)),
            _ScaleLegend(label: 'Obesidad\n>30', color: Color(0xFFD32F2F)),
          ],
        ),
      ],
    );
  }
}

class _ScaleLegend extends StatelessWidget {
  final String label;
  final Color color;

  const _ScaleLegend({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      textAlign: TextAlign.center,
      style: const TextStyle(
        fontSize: 10,
        color: Color(0xFF64748B),
        fontWeight: FontWeight.w600,
        height: 1.2,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ESCALA DE REFERENCIA ANTES DE CALCULAR
// ─────────────────────────────────────────────────────────────────────────────
class _BmiReferenceCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Clasificación de la OMS (IMC)',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 12),
          _ReferenceRow(color: const Color(0xFF2196F3), label: 'Bajo peso', range: '< 18.5'),
          _ReferenceRow(color: const Color(0xFF2E7D32), label: 'Peso saludable', range: '18.5 – 24.9'),
          _ReferenceRow(color: const Color(0xFFFF9800), label: 'Sobrepeso', range: '25.0 – 29.9'),
          _ReferenceRow(color: const Color(0xFFF4511E), label: 'Obesidad Grado I', range: '30.0 – 34.9'),
          _ReferenceRow(color: const Color(0xFFD32F2F), label: 'Obesidad Severa (II / III)', range: '≥ 35.0'),
        ],
      ),
    );
  }
}

class _ReferenceRow extends StatelessWidget {
  final Color color;
  final String label;
  final String range;

  const _ReferenceRow({
    required this.color,
    required this.label,
    required this.range,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, color: Color(0xFF334155)),
            ),
          ),
          Text(
            range,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL PREMIUM INFORMATIVO PARA USUARIOS FREE
// ─────────────────────────────────────────────────────────────────────────────
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
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: statusColor.withOpacity(0.3)),
            ),
            child: Text(
              'Tu IMC: ${bmi.toStringAsFixed(1)} • $statusLabel',
              style: TextStyle(
                color: statusColor,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Desbloquea tu Protocolo Médico Completo',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          const Text(
            'Tu plan nutricional personalizado con cronograma diario y recordatorios automáticos.',
            style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primaryGreen.withOpacity(0.05),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.primaryGreen.withOpacity(0.2)),
            ),
            child: Column(
              children: const [
                _ModalFeatureRow(icon: '🗓️', text: 'Agenda diaria personalizada con horarios exactos'),
                _ModalFeatureRow(icon: '🔔', text: 'Recordatorios automáticos para cada jugo y comida'),
                _ModalFeatureRow(icon: '🥤', text: 'Recetas de jugos verdes exclusivas para tu metabolismo'),
                _ModalFeatureRow(icon: '📊', text: 'Seguimiento de peso y evolución semanal'),
              ],
            ),
          ),
          const SizedBox(height: 20),
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
                    fontSize: 15,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          TextButton(
            onPressed: onViewProtocol,
            child: const Text(
              'Ver vista previa gratuita',
              style: TextStyle(color: AppColors.primaryGreen, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}

class _ModalFeatureRow extends StatelessWidget {
  final String icon;
  final String text;

  const _ModalFeatureRow({required this.icon, required this.text});

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
              style: const TextStyle(fontSize: 13, color: Color(0xFF1E293B)),
            ),
          ),
        ],
      ),
    );
  }
}
