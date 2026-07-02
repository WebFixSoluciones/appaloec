import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/protocol_day_provider.dart';

class BlockCard extends StatefulWidget {
  final ProtocolBlock block;
  final int index;
  final VoidCallback onComplete;

  const BlockCard({
    super.key,
    required this.block,
    required this.index,
    required this.onComplete,
  });

  @override
  State<BlockCard> createState() => _BlockCardState();
}

class _BlockCardState extends State<BlockCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _checkController;
  late Animation<double> _checkAnimation;

  @override
  void initState() {
    super.initState();
    _checkController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _checkAnimation = CurvedAnimation(
      parent: _checkController,
      curve: Curves.elasticOut,
    );
  }

  @override
  void dispose() {
    _checkController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(BlockCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.block.isCompleted && !oldWidget.block.isCompleted) {
      _checkController.forward(from: 0);
    }
  }

  Color get _borderColor {
    switch (widget.block.status) {
      case BlockStatus.completed:
        return AppColors.primaryGreen;
      case BlockStatus.active:
        return AppColors.primaryGreen;
      case BlockStatus.overdue:
        return AppColors.error;
      case BlockStatus.pending:
        return Colors.grey.shade100;
    }
  }

  Color get _backgroundColor {
    switch (widget.block.status) {
      case BlockStatus.completed:
        return AppColors.primaryGreen.withOpacity(0.05);
      case BlockStatus.active:
        return Colors.white;
      case BlockStatus.overdue:
        return AppColors.error.withOpacity(0.04);
      case BlockStatus.pending:
        return Colors.white;
    }
  }

  double get _elevation {
    return widget.block.status == BlockStatus.active ? 2 : 0;
  }

  @override
  Widget build(BuildContext context) {
    final meal = widget.block.meal;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 40,
            child: Column(
              children: [
                _buildTimelineCircle(),
                Container(
                  width: 2,
                  height: 60,
                  decoration: BoxDecoration(
                    color: widget.block.isCompleted
                        ? AppColors.primaryGreen
                        : Colors.grey.shade300,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Material(
              elevation: _elevation,
              borderRadius: BorderRadius.circular(12),
              color: _backgroundColor,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border(
                    left: BorderSide(
                      color: _borderColor,
                      width: widget.block.status == BlockStatus.pending ? 1 : 3,
                    ),
                  ),
                ),
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        meal.time,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            meal.label,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: widget.block.isCompleted
                                  ? AppColors.textLight
                                  : AppColors.textDark,
                              decoration: widget.block.isCompleted
                                  ? TextDecoration.lineThrough
                                  : null,
                            ),
                          ),
                          if (meal.items.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Text(
                              meal.items.first,
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textLight,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                          if (meal.notes != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              meal.notes!,
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textLight,
                                fontStyle: FontStyle.italic,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap:
                          widget.block.isCompleted ? null : widget.onComplete,
                      child: _buildStatusIcon(),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineCircle() {
    switch (widget.block.status) {
      case BlockStatus.completed:
        return ScaleTransition(
          scale: widget.block.isCompleted
              ? _checkAnimation
              : const AlwaysStoppedAnimation(1.0),
          child: Container(
            width: 20,
            height: 20,
            decoration: const BoxDecoration(
              color: AppColors.primaryGreen,
              shape: BoxShape.circle,
            ),
            child:
                const Icon(Icons.check, size: 12, color: Colors.white),
          ),
        );
      case BlockStatus.active:
        return _PulsingCircle(color: AppColors.primaryGreen);
      case BlockStatus.overdue:
        return Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.error, width: 2),
            color: AppColors.error.withOpacity(0.1),
          ),
        );
      case BlockStatus.pending:
        return Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: Colors.grey.shade300, width: 2),
          ),
        );
    }
  }

  Widget _buildStatusIcon() {
    switch (widget.block.status) {
      case BlockStatus.completed:
        return const Icon(Icons.check_circle,
            color: AppColors.primaryGreen, size: 26);
      case BlockStatus.active:
        return const Icon(Icons.radio_button_checked,
            color: AppColors.primaryGreen, size: 26);
      case BlockStatus.overdue:
        return const Icon(Icons.warning_amber,
            color: AppColors.error, size: 26);
      case BlockStatus.pending:
        return Icon(Icons.radio_button_unchecked,
            color: Colors.grey.shade300, size: 26);
    }
  }
}

class _PulsingCircle extends StatefulWidget {
  final Color color;
  const _PulsingCircle({required this.color});

  @override
  State<_PulsingCircle> createState() => _PulsingCircleState();
}

class _PulsingCircleState extends State<_PulsingCircle>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: widget.color,
            boxShadow: [
              BoxShadow(
                color: widget.color.withOpacity(0.3 * _controller.value),
                blurRadius: 8 * _controller.value,
                spreadRadius: 2 * _controller.value,
              ),
            ],
          ),
          child: const Icon(Icons.circle, size: 8, color: Colors.white),
        );
      },
    );
  }
}
