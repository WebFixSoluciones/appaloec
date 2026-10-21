import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/referral_service.dart';

class ReferralDashboardScreen extends StatefulWidget {
  const ReferralDashboardScreen({super.key});

  @override
  State<ReferralDashboardScreen> createState() => _ReferralDashboardScreenState();
}

class _ReferralDashboardScreenState extends State<ReferralDashboardScreen> {
  final _user = FirebaseAuth.instance.currentUser;
  String? _referralCode;

  @override
  void initState() {
    super.initState();
    _loadReferralCode();
  }

  Future<void> _loadReferralCode() async {
    final user = _user;
    if (user == null) return;
    final code = await ReferralService.generateReferralCode(user.uid);
    if (mounted) setState(() => _referralCode = code);
  }

  Future<void> _copyCode() async {
    if (_referralCode == null) return;
    await Clipboard.setData(ClipboardData(text: _referralCode!));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.check_circle, color: Colors.white, size: 18),
              SizedBox(width: 8),
              Text('Código copiado al portapapeles'),
            ],
          ),
          backgroundColor: AppColors.primaryGreen,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  Future<void> _copyLink() async {
    if (_referralCode == null) return;
    final link = 'https://app.alimentacionorganicaec.net/?ref=$_referralCode';
    await Clipboard.setData(ClipboardData(text: link));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.link, color: Colors.white, size: 18),
              SizedBox(width: 8),
              Text('Enlace de referido copiado al portapapeles'),
            ],
          ),
          backgroundColor: AppColors.primaryGreen,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  Future<void> _shareWhatsApp() async {
    if (_referralCode == null) return;
    final link = 'https://app.alimentacionorganicaec.net/?ref=$_referralCode';
    final msg =
        '¡Hola! Te recomiendo ALOEC para transformar tu salud con jugoterapia viva y protocolos nutricionales. 🌱\n\nRegístrate con mi código: *$_referralCode*\n$link';
    final encoded = Uri.encodeComponent(msg);
    final uri = Uri.parse('https://wa.me/?text=$encoded');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null) return const SizedBox.shrink();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF8),
      appBar: AppBar(
        title: const Text(
          'Programa de Referidos',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 17,
            color: AppColors.textDark,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: AppColors.textDark),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ─── Hero Card ──────────────────────────────────────────────────
            _buildCodeHeroCard(),
            const SizedBox(height: 16),

            // ─── Acciones de Compartir Rápido ───────────────────────────────
            _buildShareActionRow(),
            const SizedBox(height: 24),

            // ─── Resumen de Ganancias ───────────────────────────────────────
            _buildBalanceCard(),
            const SizedBox(height: 24),

            // ─── Accesos Rápidos (Agrupados) ────────────────────────────────
            const Text(
              'Gestión de Afiliado',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 10),
            _buildGroupedQuickActions(),
            const SizedBox(height: 24),

            // ─── Últimos Referidos ──────────────────────────────────────────
            const Text(
              'Actividad Reciente',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 10),
            _buildRecentReferrals(),
          ],
        ),
      ),
    );
  }

  Widget _buildCodeHeroCard() {
    final link = _referralCode != null
        ? 'app.alimentacionorganicaec.net/?ref=$_referralCode'
        : 'Cargando...';

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF064E3B), Color(0xFF047857), Color(0xFF059669)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF064E3B).withValues(alpha: 0.25),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.card_giftcard, color: Color(0xFFFBBF24), size: 24),
              ),
              const SizedBox(width: 8),
              const Text(
                'Gana el 20% de comisión por venta',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'Tu código personal:',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: _copyCode,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.18),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _referralCode ?? '...',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Icon(Icons.copy_rounded, color: Colors.white70, size: 18),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            link,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 11,
              decoration: TextDecoration.underline,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildShareActionRow() {
    return Row(
      children: [
        Expanded(
          child: _SharePillButton(
            icon: Icons.copy,
            label: 'Copiar Link',
            color: const Color(0xFF0F172A),
            onTap: _copyLink,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _SharePillButton(
            icon: Icons.chat,
            label: 'WhatsApp',
            color: const Color(0xFF16A34A),
            onTap: _shareWhatsApp,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _SharePillButton(
            icon: Icons.share_rounded,
            label: 'Compartir',
            color: AppColors.primaryGreen,
            onTap: () => context.push('/referral/share', extra: _referralCode),
          ),
        ),
      ],
    );
  }

  Widget _buildBalanceCard() {
    return StreamBuilder<DocumentSnapshot>(
      stream: FirebaseFirestore.instance.collection('users').doc(_user!.uid).snapshots(),
      builder: (context, snapshot) {
        final data = snapshot.data?.data() as Map<String, dynamic>?;
        final balance = data?['affiliateBalance'] as Map<String, dynamic>?;
        final pending = (balance?['pendingUSD'] as num?)?.toDouble() ?? 0;
        final approved = (balance?['approvedUSD'] as num?)?.toDouble() ?? 0;
        final paid = (balance?['paidUSD'] as num?)?.toDouble() ?? 0;

        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Balance de Comisiones',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textDark),
                  ),
                  GestureDetector(
                    onTap: () => context.push('/referral/earnings'),
                    child: const Text(
                      'Ver detalle →',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  _BalanceCardItem(
                    label: 'Pendiente',
                    amount: pending,
                    color: const Color(0xFFD97706),
                    bgColor: const Color(0xFFFEF3C7),
                  ),
                  const SizedBox(width: 10),
                  _BalanceCardItem(
                    label: 'Disponible',
                    amount: approved,
                    color: const Color(0xFF059669),
                    bgColor: const Color(0xFFD1FAE5),
                  ),
                  const SizedBox(width: 10),
                  _BalanceCardItem(
                    label: 'Pagado',
                    amount: paid,
                    color: const Color(0xFF2563EB),
                    bgColor: const Color(0xFFDBEAFE),
                  ),
                ],
              ),
              if (approved >= 15) ...[
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _handleRequestPayout(approved),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.account_balance_wallet, size: 18),
                    label: Text(
                      'Solicitar Retiro de \$${approved.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ),
              ] else if (approved > 0) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.amber.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, size: 16, color: Colors.amber.shade800),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Monto mínimo para solicitar retiro: \$15.00 USD (Tienes \$${approved.toStringAsFixed(2)})',
                          style: TextStyle(fontSize: 11, color: Colors.amber.shade900, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Future<void> _handleRequestPayout(double amount) async {
    final user = _user;
    if (user == null) return;

    // Verificar si ya tiene una solicitud pendiente
    final pendingPayouts = await FirebaseFirestore.instance
        .collection('payouts')
        .where('uid', isEqualTo: user.uid)
        .where('status', isEqualTo: 'pending')
        .get();

    if (pendingPayouts.docs.isNotEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Ya tienes una solicitud de retiro pendiente de revisión.'),
          backgroundColor: Colors.orange.shade800,
        ),
      );
      return;
    }

    // Obtener métodos de pago
    final methodsSnap = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .collection('payout_methods')
        .get();

    if (methodsSnap.docs.isEmpty) {
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Método de Cobro Requerido', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: const Text(
            'Para recibir tus comisiones, primero debes registrar tu cuenta bancaria ecuatoriana o PayPal.',
            style: TextStyle(fontSize: 13),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () {
                Navigator.pop(ctx);
                context.push('/referral/methods');
              },
              child: const Text('Configurar Cuenta', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
      return;
    }

    // Elegir método predeterminado o el primero
    final defaultDoc = methodsSnap.docs.firstWhere(
      (d) => (d.data()['isDefault'] as bool? ?? false) == true,
      orElse: () => methodsSnap.docs.first,
    );
    final methodData = defaultDoc.data();

    if (!mounted) return;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Confirmar Retiro', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Column(
                children: [
                  const Text('Monto a transferir', style: TextStyle(fontSize: 12, color: Color(0xFF166534))),
                  const SizedBox(height: 4),
                  Text(
                    '\$${amount.toStringAsFixed(2)} USD',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF14532D)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Destino: ${methodData['label'] ?? methodData['type'] ?? 'Cuenta configurada'}',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              'Tu retiro será revisado y transferido por el administrador a tu cuenta.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                try {
                  await FirebaseFirestore.instance.collection('payouts').add({
                    'uid': user.uid,
                    'userName': user.displayName ?? 'Afiliado',
                    'userEmail': user.email ?? '',
                    'amountUSD': amount,
                    'status': 'pending',
                    'methodSnapshot': methodData,
                    'createdAt': FieldValue.serverTimestamp(),
                    'updatedAt': FieldValue.serverTimestamp(),
                  });

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('¡Solicitud de retiro enviada con éxito!'),
                        backgroundColor: AppColors.primaryGreen,
                      ),
                    );
                    context.push('/referral/payout-history');
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error al solicitar retiro: $e'), backgroundColor: Colors.red),
                    );
                  }
                }
              },
              child: const Text('Enviar Solicitud de Retiro', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGroupedQuickActions() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          _MenuTile(
            icon: Icons.people_alt_outlined,
            iconColor: const Color(0xFF10B981),
            title: 'Mis Referidos Registrados',
            subtitle: 'Personas que se han registrado con tu enlace',
            onTap: () => context.push('/referral/referred'),
          ),
          Divider(height: 1, indent: 64, endIndent: 16, color: Colors.grey.shade100),
          _MenuTile(
            icon: Icons.account_balance_wallet_outlined,
            iconColor: const Color(0xFF3B82F6),
            title: 'Métodos de Pago / Cobro',
            subtitle: 'Configura tu cuenta bancaria o PayPal para recibir fondos',
            onTap: () => context.push('/referral/methods'),
          ),
          Divider(height: 1, indent: 64, endIndent: 16, color: Colors.grey.shade100),
          _MenuTile(
            icon: Icons.history_rounded,
            iconColor: const Color(0xFF8B5CF6),
            title: 'Historial de Retiros',
            subtitle: 'Revisa tus pagos transferidos y comprobantes',
            onTap: () => context.push('/referral/payout-history'),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentReferrals() {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('referral_events')
          .where('referrerUid', isEqualTo: _user!.uid)
          .where('type', isEqualTo: 'registered')
          .orderBy('createdAt', descending: true)
          .limit(3)
          .snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const SizedBox.shrink();
        final docs = snapshot.data!.docs;
        if (docs.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              children: [
                Icon(Icons.share_outlined, size: 36, color: Colors.grey.shade400),
                const SizedBox(height: 8),
                Text(
                  'Aún no tienes referidos registrados',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey.shade700, fontSize: 13),
                ),
                const SizedBox(height: 4),
                Text(
                  'Comparte tu enlace con amigos, familiares o en redes para generar tus primeras comisiones.',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: docs.asMap().entries.map((entry) {
              final index = entry.key;
              final doc = entry.value;
              final data = doc.data() as Map<String, dynamic>;
              final date = (data['createdAt'] as Timestamp?)?.toDate();
              final isLast = index == docs.length - 1;

              return Column(
                children: [
                  ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    leading: Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(
                        color: Color(0xFFE8F5E9),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.person, color: AppColors.primaryGreen, size: 20),
                    ),
                    title: const Text(
                      'Nuevo Usuario Invitado',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textDark),
                    ),
                    subtitle: Text(
                      date != null ? _formatDate(date) : 'Reciente',
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                    ),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD1FAE5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Registrado',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                      ),
                    ),
                  ),
                  if (!isLast)
                    Divider(height: 1, indent: 64, endIndent: 16, color: Colors.grey.shade100),
                ],
              );
            }).toList(),
          ),
        );
      },
    );
  }

  String _formatDate(DateTime d) => '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
}

class _SharePillButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _SharePillButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ElevatedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, size: 16, color: Colors.white),
        label: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}

class _BalanceCardItem extends StatelessWidget {
  final String label;
  final double amount;
  final Color color;
  final Color bgColor;

  const _BalanceCardItem({
    required this.label,
    required this.amount,
    required this.color,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Text(
              '\$${amount.toStringAsFixed(2)}',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _MenuTile({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: iconColor.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColors.textDark,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
      ),
      trailing: Icon(Icons.chevron_right, size: 20, color: Colors.grey.shade400),
      onTap: onTap,
    );
  }
}
