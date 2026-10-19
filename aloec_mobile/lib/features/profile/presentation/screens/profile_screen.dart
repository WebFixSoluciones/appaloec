import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/firestore_profile_repository.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Future<void> _deleteAccount(BuildContext context, WidgetRef ref) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: const [
            Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 28),
            SizedBox(width: 10),
            Text('Eliminar Cuenta'),
          ],
        ),
        content: const Text(
          'Esta acción es irreversible. Se eliminarán permanentemente tus datos de salud, progreso y membresía de ALOEC.\n\n¿Estás completamente seguro de continuar?',
          style: TextStyle(fontSize: 14, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Sí, eliminar cuenta'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        final user = FirebaseAuth.instance.currentUser;
        if (user != null) {
          await user.delete();
          await ref.read(authNotifierProvider.notifier).signOut();
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Tu cuenta ha sido eliminada con éxito.'),
                backgroundColor: AppColors.textDark,
              ),
            );
            context.go('/onboarding');
          }
        }
      } on FirebaseAuthException catch (e) {
        if (context.mounted) {
          if (e.code == 'requires-recent-login') {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Por seguridad, vuelve a iniciar sesión antes de eliminar tu cuenta.',
                ),
                backgroundColor: AppColors.error,
              ),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Error al eliminar cuenta: ${e.message}'),
                backgroundColor: AppColors.error,
              ),
            );
          }
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error inesperado: $e'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = FirebaseAuth.instance.currentUser;
    final profileAsync = ref.watch(userProfileStreamProvider);
    final isPremium = profileAsync.value?.isPremium ?? false;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF8),
      appBar: AppBar(
        title: const Text(
          'Mi Perfil',
          style: TextStyle(
            color: AppColors.textDark,
            fontWeight: FontWeight.bold,
            fontSize: 17,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 110),
        children: [
          // ─── Tarjeta Principal de Usuario ──────────────────────────────────
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey.shade200),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 46,
                      backgroundColor: AppColors.primaryGreen.withValues(alpha: 0.12),
                      backgroundImage: user?.photoURL != null && user!.photoURL!.isNotEmpty
                          ? NetworkImage(user.photoURL!)
                          : null,
                      child: user?.photoURL == null || user!.photoURL!.isEmpty
                          ? const Icon(Icons.person, size: 48, color: AppColors.primaryGreen)
                          : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: () => context.push('/edit-profile'),
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreen,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.edit, size: 16, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  user?.displayName ?? 'Usuario ALOEC',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.email ?? '',
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                ),
                const SizedBox(height: 12),

                // Badge de Membresía
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: isPremium
                        ? const Color(0xFFE8F5E9)
                        : const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isPremium
                          ? const Color(0xFFA5D6A7)
                          : const Color(0xFFFDE68A),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isPremium ? Icons.verified : Icons.lock_outline,
                        size: 16,
                        color: isPremium ? const Color(0xFF2E7D32) : const Color(0xFFB45309),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        isPremium ? 'Membresía Activa (Premium)' : 'Plan Gratuito',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isPremium ? const Color(0xFF1B5E20) : const Color(0xFF92400E),
                        ),
                      ),
                    ],
                  ),
                ),

                if (user?.emailVerified == false) ...[
                  const SizedBox(height: 10),
                  GestureDetector(
                    onTap: () async {
                      await user?.sendEmailVerification();
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Correo de verificación enviado'),
                            backgroundColor: AppColors.primaryGreen,
                          ),
                        );
                      }
                    },
                    child: const Text(
                      'Correo no verificado — Toca para reenviar',
                      style: TextStyle(
                        color: AppColors.error,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ─── Sección: Mi Bienestar & Cuenta ────────────────────────────────
          const _SectionHeader(title: 'Mi Bienestar & Protocolo'),
          const SizedBox(height: 10),
          _buildCardGroup([
            _MenuOption(
              icon: Icons.workspace_premium_outlined,
              iconColor: const Color(0xFF059669),
              title: 'Suscripción & Plan',
              subtitle: isPremium ? 'Plan activo con acceso total' : 'Desbloquea el plan completo',
              trailingText: isPremium ? 'Activo' : 'Mejorar',
              onTap: () => context.push('/subscription'),
            ),
            _MenuOption(
              icon: Icons.notifications_active_outlined,
              iconColor: const Color(0xFF3B82F6),
              title: 'Horarios y Notificaciones',
              subtitle: 'Ajusta los 5 recordatorios de jugos y comidas',
              onTap: () => context.push('/notifications'),
            ),
            _MenuOption(
              icon: Icons.calculate_outlined,
              iconColor: const Color(0xFF8B5CF6),
              title: 'Calculadora de IMC',
              subtitle: 'Revisa tu índice y protocolo asignado',
              onTap: () => context.push('/bmi-calculator'),
            ),
            _MenuOption(
              icon: Icons.person_outline,
              iconColor: const Color(0xFF64748B),
              title: 'Editar Datos Personales',
              subtitle: 'Nombre, foto de perfil y cuenta',
              onTap: () => context.push('/edit-profile'),
            ),
          ]),
          const SizedBox(height: 20),

          // ─── Sección: Comunidad y Ganancias ─────────────────────────────────
          const _SectionHeader(title: 'Comunidad & Beneficios'),
          const SizedBox(height: 10),
          _buildCardGroup([
            _MenuOption(
              icon: Icons.card_giftcard,
              iconColor: const Color(0xFF10B981),
              title: 'Programa de Referidos',
              subtitle: 'Comparte tu link y gana comisiones en efectivo',
              badge: 'Gana 20%',
              onTap: () => context.push('/referral'),
            ),
          ]),
          const SizedBox(height: 20),

          // ─── Sección: Soporte y Políticas (Google Play) ─────────────────────
          const _SectionHeader(title: 'Soporte y Legal'),
          const SizedBox(height: 10),
          _buildCardGroup([
            _MenuOption(
              icon: Icons.help_outline_rounded,
              iconColor: const Color(0xFF0EA5E9),
              title: 'Ayuda y Soporte',
              subtitle: 'Atención personalizada por WhatsApp',
              onTap: () => context.push('/help'),
            ),
            _MenuOption(
              icon: Icons.description_outlined,
              iconColor: const Color(0xFF64748B),
              title: 'Términos y Condiciones',
              subtitle: 'Condiciones de uso de la plataforma',
              onTap: () => context.push('/terms'),
            ),
            _MenuOption(
              icon: Icons.privacy_tip_outlined,
              iconColor: const Color(0xFF64748B),
              title: 'Política de Privacidad',
              subtitle: 'Protección y uso de tus datos',
              onTap: () => context.push('/privacy'),
            ),
          ]),
          const SizedBox(height: 28),

          // ─── Botón Cerrar Sesión ───────────────────────────────────────────
          SizedBox(
            width: double.infinity,
            height: 50,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.error,
                side: BorderSide(color: AppColors.error.withValues(alpha: 0.5), width: 1.2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              icon: const Icon(Icons.logout_rounded, size: 20),
              label: const Text(
                'Cerrar sesión',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
              ),
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    title: const Text('Cerrar sesión'),
                    content: const Text('¿Estás seguro de que deseas salir de tu cuenta?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(ctx).pop(false),
                        child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.error,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => Navigator.of(ctx).pop(true),
                        child: const Text('Cerrar sesión'),
                      ),
                    ],
                  ),
                );
                if (confirm == true) {
                  await ref.read(authNotifierProvider.notifier).signOut();
                  if (context.mounted) {
                    context.go('/onboarding');
                  }
                }
              },
            ),
          ),
          const SizedBox(height: 16),

          // ─── Eliminar Cuenta (Google Play Compliance) ──────────────────────
          Center(
            child: TextButton(
              onPressed: () => _deleteAccount(context, ref),
              child: Text(
                'Eliminar mi cuenta y datos personales',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade500,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCardGroup(List<_MenuOption> options) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: List.generate(options.length, (index) {
          final opt = options[index];
          final isLast = index == options.length - 1;
          return Column(
            children: [
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                leading: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: opt.iconColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(opt.icon, color: opt.iconColor, size: 20),
                ),
                title: Row(
                  children: [
                    Text(
                      opt.title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textDark,
                      ),
                    ),
                    if (opt.badge != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD1FAE5),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          opt.badge!,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF065F46),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                subtitle: Text(
                  opt.subtitle,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (opt.trailingText != null) ...[
                      Text(
                        opt.trailingText!,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                      const SizedBox(width: 4),
                    ],
                    Icon(Icons.chevron_right, size: 20, color: Colors.grey.shade400),
                  ],
                ),
                onTap: opt.onTap,
              ),
              if (!isLast)
                Divider(
                  height: 1,
                  thickness: 1,
                  indent: 68,
                  endIndent: 16,
                  color: Colors.grey.shade100,
                ),
            ],
          );
        }),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: Colors.grey.shade700,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}

class _MenuOption {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final String? badge;
  final String? trailingText;
  final VoidCallback onTap;

  _MenuOption({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    this.badge,
    this.trailingText,
    required this.onTap,
  });
}
