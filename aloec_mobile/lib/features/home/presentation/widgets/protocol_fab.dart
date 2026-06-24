import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../providers/protocol_day_provider.dart';

class ProtocolFab extends ConsumerWidget {
  const ProtocolFab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dayState = ref.watch(protocolDayProvider);
    final notifier = ref.read(protocolDayProvider.notifier);

    if (dayState.protocol == null || notifier.nextPendingIndex == -1) {
      return const SizedBox.shrink();
    }

    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withValues(alpha: 0.35),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: GestureDetector(
        onLongPress: () => _showBlockSelector(context, ref),
        child: FloatingActionButton(
          backgroundColor: AppColors.primaryGreen,
          elevation: 0,
          onPressed: () {
            HapticFeedback.mediumImpact();
            final index = notifier.nextPendingIndex;
            if (index >= 0) {
              notifier.markBlockCompleted(index);
              final block = dayState.blocks[index];
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('${block.meal.label} completado'),
                  backgroundColor: AppColors.primaryGreen,
                  duration: const Duration(seconds: 2),
                ),
              );
            }
          },
          child: const Icon(Icons.check_rounded, color: Colors.white, size: 28),
        ),
      ),
    );
  }

  void _showBlockSelector(BuildContext context, WidgetRef ref) {
    final dayState = ref.read(protocolDayProvider);
    final notifier = ref.read(protocolDayProvider.notifier);

    HapticFeedback.mediumImpact();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.45,
        minChildSize: 0.3,
        maxChildSize: 0.7,
        builder: (_, scrollController) {
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                const SizedBox(height: 12),
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 16),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Marcar como completado',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textDark,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: ListView.builder(
                    controller: scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: dayState.blocks.length,
                    itemBuilder: (context, index) {
                      final block = dayState.blocks[index];
                      return ListTile(
                        leading: Icon(
                          block.isCompleted
                              ? Icons.check_circle
                              : Icons.radio_button_unchecked,
                          color: block.isCompleted
                              ? AppColors.primaryGreen
                              : AppColors.textLight,
                        ),
                        title: Text(
                          block.meal.label,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            decoration: block.isCompleted
                                ? TextDecoration.lineThrough
                                : null,
                            color: block.isCompleted
                                ? AppColors.textLight
                                : AppColors.textDark,
                          ),
                        ),
                        subtitle: Text(block.meal.time,
                            style:
                                const TextStyle(fontSize: 12, color: AppColors.textLight)),
                        trailing: block.isCompleted
                            ? null
                            : const Icon(Icons.chevron_right, color: AppColors.textLight),
                        onTap: block.isCompleted
                            ? null
                            : () {
                                HapticFeedback.lightImpact();
                                notifier.markBlockCompleted(index);
                                Navigator.of(ctx).pop();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content:
                                        Text('${block.meal.label} completado'),
                                    backgroundColor: AppColors.primaryGreen,
                                    duration: const Duration(seconds: 2),
                                  ),
                                );
                              },
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
