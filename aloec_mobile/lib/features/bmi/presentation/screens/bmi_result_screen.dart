import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../subscriptions/domain/protocol_model.dart';
import '../../../subscriptions/data/protocols_repository.dart';
import '../../../subscriptions/presentation/screens/protocol_detail_screen.dart';

class BmiResultScreen extends StatefulWidget {
  final double bmi;
  final String status;
  final ProtocolModel? protocol;

  const BmiResultScreen({
    super.key,
    required this.bmi,
    required this.status,
    this.protocol,
  });

  @override
  State<BmiResultScreen> createState() => _BmiResultScreenState();
}

class _BmiResultScreenState extends State<BmiResultScreen> {
  final _protocolsRepo = ProtocolsRepository();
  ProtocolModel? _resolvedProtocol;
  bool _isLoadingProtocol = true;

  @override
  void initState() {
    super.initState();
    _loadProtocol();
  }

  Future<void> _loadProtocol() async {
    if (widget.protocol != null) {
      setState(() {
        _resolvedProtocol = widget.protocol;
        _isLoadingProtocol = false;
      });
      return;
    }

    try {
      final protocol = await _protocolsRepo.getProtocolForBmi(widget.bmi);
      setState(() {
        _resolvedProtocol = protocol;
        _isLoadingProtocol = false;
      });
    } catch (e) {
      debugPrint('Error loading protocol: $e');
      setState(() => _isLoadingProtocol = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoryColor = Color(ProtocolModel.getCategoryColorValue(widget.bmi));

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Tu Resultado IMC',
            style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: categoryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 16),

            // IMC Gauge
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: categoryColor.withOpacity(0.3), blurRadius: 30, spreadRadius: 5),
                ],
              ),
              child: Column(
                children: [
                  Text(widget.bmi.toStringAsFixed(1), style: TextStyle(fontSize: 52, fontWeight: FontWeight.bold, color: categoryColor)),
                  Text('IMC', style: TextStyle(fontSize: 16, color: AppColors.textLight)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Category Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
              decoration: BoxDecoration(
                color: categoryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(50),
                border: Border.all(color: categoryColor.withOpacity(0.4)),
              ),
              child: Text(widget.status, style: TextStyle(color: categoryColor, fontWeight: FontWeight.bold, fontSize: 18)),
            ),
            const SizedBox(height: 28),

            // Protocol Recommendation
            if (_isLoadingProtocol)
              const Padding(
                padding: EdgeInsets.all(20),
                child: CircularProgressIndicator(color: AppColors.primaryGreen),
              )
            else if (_resolvedProtocol != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 16, offset: const Offset(0, 6))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.recommend_rounded, color: AppColors.primaryGreen),
                        SizedBox(width: 8),
                        Text('Te Recomendamos:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(_resolvedProtocol!.title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: categoryColor)),
                    Text(_resolvedProtocol!.subtitle, style: TextStyle(fontSize: 13, color: AppColors.textLight)),
                    const SizedBox(height: 10),
                    Text(_resolvedProtocol!.description, style: TextStyle(fontSize: 13, color: AppColors.textLight, height: 1.5)),
                  ],
                ),
              ),
            ] else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: const Column(
                  children: [
                    Icon(Icons.info_outline, color: Colors.grey, size: 40),
                    SizedBox(height: 8),
                    Text('Protocolo no disponible aún', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    SizedBox(height: 4),
                    Text('El administrador pronto configurará un protocolo para tu rango de IMC.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ),
            const SizedBox(height: 20),

            // Premium CTA
            GestureDetector(
              onTap: () => context.push('/premium-upsell'),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1B5E20), Color(0xFF388E3C), Color(0xFF67B539)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [BoxShadow(color: AppColors.primaryGreen.withOpacity(0.4), blurRadius: 18, offset: const Offset(0, 6))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.workspace_premium_rounded, color: Colors.white, size: 22),
                        SizedBox(width: 8),
                        Text('Activa tu Protocolo Premium', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    const Text('Con Premium desbloqueas:', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    const SizedBox(height: 8),
                    _PremiumFeatureItem(text: 'Agenda diaria con horarios exactos de comidas'),
                    _PremiumFeatureItem(text: 'Recordatorios automáticos al celular'),
                    _PremiumFeatureItem(text: 'Videocurso completo de Terapia Gerson'),
                    _PremiumFeatureItem(text: 'Recetas exclusivas con info nutricional'),
                    const SizedBox(height: 14),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                      child: const Center(
                        child: Text('Comprar Premium ahora', style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold, fontSize: 14)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // View Protocol Preview
            if (_resolvedProtocol != null)
              GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => ProtocolDetailScreen(protocol: _resolvedProtocol!)),
                  );
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: categoryColor.withOpacity(0.4)),
                  ),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.visibility_outlined, color: categoryColor, size: 20),
                        const SizedBox(width: 8),
                        Text('Ver Vista Previa del Protocolo', style: TextStyle(color: categoryColor, fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _PremiumFeatureItem extends StatelessWidget {
  final String text;
  const _PremiumFeatureItem({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          const Icon(Icons.check_circle_outline, color: Colors.white70, size: 14),
          const SizedBox(width: 6),
          Expanded(child: Text(text, style: const TextStyle(color: Colors.white, fontSize: 12))),
        ],
      ),
    );
  }
}
