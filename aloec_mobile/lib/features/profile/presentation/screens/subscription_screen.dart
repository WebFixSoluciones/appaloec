import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  String _membershipName = 'Gratuito';
  bool _isPremium = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _loading = false);
      return;
    }

    try {
      final userDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get();

      if (userDoc.exists) {
        final data = userDoc.data()!;
        final isP = data['isPremium'] == true;
        final membershipId = data['membershipId'] as String?;

        String name = 'Gratuito';
        if (isP && membershipId != null && membershipId != 'free') {
          try {
            final mDoc = await FirebaseFirestore.instance
                .collection('memberships')
                .doc(membershipId)
                .get();
            if (mDoc.exists) {
              name = mDoc.data()?['name'] ?? 'Premium';
            } else {
              name = 'Premium';
            }
          } catch (_) {
            name = 'Premium';
          }
        }

        setState(() {
          _isPremium = isP;
          _membershipName = name;
        });
      }
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _openWhatsApp() async {
    const phone = '593999504321';
    const message = 'Hola ALOEC, quiero informacion sobre los planes.';
    final encoded = Uri.encodeComponent(message);
    final uris = [
      Uri.parse('whatsapp://send?phone=$phone&text=$encoded'),
      Uri.parse('https://wa.me/$phone?text=$encoded'),
    ];
    for (final uri in uris) {
      try {
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
          return;
        }
      } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: AppColors.backgroundLight,
        appBar: AppBar(
            title: const Text('Mi Suscripcion'),
            backgroundColor: Colors.white,
            foregroundColor: Colors.black,
            elevation: 0),
        body: const Center(
            child: CircularProgressIndicator(color: AppColors.primaryGreen)),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Mi Suscripcion'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _isPremium
                    ? [const Color(0xFF1B5E20), const Color(0xFF67B539)]
                    : [Colors.grey.shade600, Colors.grey.shade400],
              ),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              children: [
                Icon(
                  _isPremium ? Icons.workspace_premium : Icons.card_giftcard,
                  color: Colors.white,
                  size: 48,
                ),
                const SizedBox(height: 12),
                Text(
                  _isPremium ? 'Plan Activo' : 'Plan Gratuito',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 4),
                Text(
                  _membershipName,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          if (_isPremium) ...[
            _buildTile(
              icon: Icons.check_circle,
              color: Colors.green,
              title: 'Acceso a protocolos personalizados',
            ),
            _buildTile(
              icon: Icons.check_circle,
              color: Colors.green,
              title: 'Recordatorios diarios automaticos',
            ),
            _buildTile(
              icon: Icons.check_circle,
              color: Colors.green,
              title: 'Videocurso de Terapia Gerson',
            ),
            _buildTile(
              icon: Icons.check_circle,
              color: Colors.green,
              title: 'Recetas exclusivas de jugos verdes',
            ),
            _buildTile(
              icon: Icons.check_circle,
              color: Colors.green,
              title: 'Seguimiento de progreso',
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton.icon(
                onPressed: () => context.push('/premium-upsell'),
                icon: const Icon(Icons.upgrade),
                label: const Text('Cambiar de plan',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primaryGreen,
                  side: const BorderSide(color: AppColors.primaryGreen),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  const Icon(Icons.lock_outline,
                      size: 40, color: AppColors.textLight),
                  const SizedBox(height: 12),
                  const Text('Desbloquea todo el contenido',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: AppColors.textDark)),
                  const SizedBox(height: 6),
                  const Text(
                    'Accede a protocolos personalizados, videocursos, recetas exclusivas y mucho mas.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: AppColors.textLight,
                        fontSize: 13,
                        height: 1.4),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      onPressed: () => context.push('/premium-upsell'),
                      icon: const Icon(Icons.workspace_premium),
                      label: const Text('Ver Planes Premium',
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: OutlinedButton.icon(
                      onPressed: _openWhatsApp,
                      icon: const Icon(Icons.chat,
                          color: Color(0xFF25D366)),
                      label: const Text('Comprar en Efectivo',
                          style: TextStyle(
                              color: Color(0xFF25D366),
                              fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(
                            color: Color(0xFF25D366), width: 2),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTile({
    required IconData icon,
    required Color color,
    required String title,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(title,
                  style: const TextStyle(
                      fontSize: 14, color: AppColors.textDark)),
            ),
          ],
        ),
      ),
    );
  }
}
