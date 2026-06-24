# Bottom Navigation Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 5-tab bottom navigation with a 4-tab Wellness Premium floating nav (Hoy, Recetas, Progreso, Perfil) + FAB, add the "Hoy" protocol timeline screen, and fix the logout state bug.

**Architecture:** Custom floating bottom nav built with `Container` + `GestureDetector` (no native `NavigationBar`). The "Hoy" screen is a vertical timeline rendering `ProtocolMealItem` blocks with 4 visual states (completed, active, pending, overdue). Logout fix uses `GoRouterRefreshStream` to bind auth state changes to router redirects, eliminating manual navigation and adding provider invalidation.

**Tech Stack:** Flutter 3.2+, Riverpod 2.5, GoRouter 17.2, Firebase Auth/Firestore, existing `ProtocolModel` + `ProtocolMealItem` from `lib/features/subscriptions/domain/protocol_model.dart`.

## Global Constraints

- Dart SDK >=3.2.0, Flutter stable channel
- All UI text in Spanish
- Colors from `lib/core/constants/app_colors.dart` — no new color constants
- State management: Riverpod `StateNotifierProvider` pattern (match `auth_provider.dart`)
- Navigation: GoRouter (existing `goRouter` instance in `app_router.dart`)
- No new dependencies — use only what's in `pubspec.yaml`
- Reuse existing models: `ProtocolModel`, `ProtocolMealItem`, `RecipeEntity`
- `SelectProtocolNotification` moves from `juice_schedule_screen.dart` to the new "Hoy" screen

---

### Task 1: Fix Logout — GoRouter Auth Redirect + Provider Invalidation

**Files:**
- Modify: `lib/core/router/app_router.dart` (lines 1-109)
- Modify: `lib/features/profile/presentation/screens/profile_screen.dart` (lines 123-149)

**Interfaces:**
- Consumes: `authRepositoryProvider` from `lib/features/auth/data/firebase_auth_repository.dart:10`, `authNotifierProvider` from `lib/features/auth/presentation/providers/auth_provider.dart:22`
- Produces: Auth-driven router redirect (automatic navigation on sign-out), clean provider invalidation on logout

- [ ] **Step 1: Add GoRouterRefreshStream to app_router.dart**

Create a `GoRouterRefreshStream` class and wire it into the existing `goRouter`. Add this class above the `goRouter` declaration:

```dart
import 'dart:async';

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
```

Then add `refreshListenable` to the `GoRouter` constructor:

```dart
final goRouter = GoRouter(
  initialLocation: '/splash',
  refreshListenable: GoRouterRefreshStream(
    FirebaseAuth.instance.authStateChanges(),
  ),
  observers: [
    FirebaseAnalyticsObserver(analytics: FirebaseAnalytics.instance),
  ],
  redirect: (context, state) {
    final user = FirebaseAuth.instance.currentUser;
    final isPublicRoute = _publicRoutes.contains(state.matchedLocation);
    if (user == null && !isPublicRoute) {
      return '/splash';
    }
    return null;
  },
  routes: [
    // ... keep all existing routes unchanged
  ],
);
```

Add the missing import at the top:
```dart
import 'dart:async';
```

- [ ] **Step 2: Fix logout in profile_screen.dart**

Replace the `onPressed` callback of the logout button (lines 123-149). Remove the manual `context.go('/splash')` and add provider invalidation:

```dart
onPressed: () async {
  final confirm = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Cerrar sesion'),
      content: const Text('Estas seguro de que deseas cerrar sesion?'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('Cancelar'),
        ),
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(true),
          child: const Text('Cerrar sesion',
              style: TextStyle(color: AppColors.error)),
        ),
      ],
    ),
  );
  if (confirm == true) {
    await ref.read(authNotifierProvider.notifier).signOut();
    // GoRouter redirect handles navigation automatically
    // No need for context.go('/splash')
  }
},
```

- [ ] **Step 3: Verify the fix**

Run: `cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile" && flutter analyze lib/core/router/app_router.dart lib/features/profile/presentation/screens/profile_screen.dart`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
git add lib/core/router/app_router.dart lib/features/profile/presentation/screens/profile_screen.dart
git commit -m "fix: auth-driven router redirect and provider cleanup on logout"
```

---

### Task 2: Create WellnessBottomNav Widget

**Files:**
- Create: `lib/features/home/presentation/widgets/wellness_bottom_nav.dart`

**Interfaces:**
- Consumes: `AppColors` from `lib/core/constants/app_colors.dart`
- Produces: `WellnessBottomNav({required int selectedIndex, required ValueChanged<int> onDestinationSelected})` — custom floating nav widget used by `HomeScreen`

- [ ] **Step 1: Create the WellnessBottomNav widget**

Create `lib/features/home/presentation/widgets/wellness_bottom_nav.dart`:

```dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class WellnessBottomNav extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;

  const WellnessBottomNav({
    super.key,
    required this.selectedIndex,
    required this.onDestinationSelected,
  });

  static const _items = [
    _NavItem(
      label: 'Hoy',
      icon: Icons.calendar_today_outlined,
      activeIcon: Icons.calendar_today,
    ),
    _NavItem(
      label: 'Recetas',
      icon: Icons.restaurant_menu_outlined,
      activeIcon: Icons.restaurant_menu,
    ),
    _NavItem(
      label: 'Progreso',
      icon: Icons.insights_outlined,
      activeIcon: Icons.insights,
    ),
    _NavItem(
      label: 'Perfil',
      icon: Icons.person_outline,
      activeIcon: Icons.person,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      height: 68,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: List.generate(_items.length, (index) {
          final item = _items[index];
          final isSelected = index == selectedIndex;
          return Expanded(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => onDestinationSelected(index),
              child: _NavItemWidget(
                item: item,
                isSelected: isSelected,
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _NavItem {
  final String label;
  final IconData icon;
  final IconData activeIcon;

  const _NavItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
  });
}

class _NavItemWidget extends StatelessWidget {
  final _NavItem item;
  final bool isSelected;

  const _NavItemWidget({
    super.key,
    required this.item,
    required this.isSelected,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 200),
      transitionBuilder: (child, animation) =>
          FadeTransition(opacity: animation, child: child),
      child: Column(
        key: ValueKey(isSelected),
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isSelected ? item.activeIcon : item.icon,
            color: isSelected ? AppColors.primaryGreen : AppColors.textLight,
            size: isSelected ? 26 : 24,
          ),
          const SizedBox(height: 4),
          Text(
            item.label,
            style: TextStyle(
              color: isSelected ? AppColors.primaryGreen : AppColors.textLight,
              fontSize: isSelected ? 12 : 11,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
          const SizedBox(height: 3),
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: isSelected ? 5 : 0,
            height: isSelected ? 5 : 0,
            decoration: const BoxDecoration(
              color: AppColors.primaryGreen,
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile" && flutter analyze lib/features/home/presentation/widgets/wellness_bottom_nav.dart`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
git add lib/features/home/presentation/widgets/wellness_bottom_nav.dart
git commit -m "feat: add WellnessBottomNav floating navigation widget"
```

---

### Task 3: Create Protocol Day Provider + Block State Model

**Files:**
- Create: `lib/features/home/presentation/providers/protocol_day_provider.dart`

**Interfaces:**
- Consumes: `ProtocolModel` and `ProtocolMealItem` from `lib/features/subscriptions/domain/protocol_model.dart`, `FirebaseAuth` + `FirebaseFirestore`
- Produces:
  - `ProtocolBlock` — data class wrapping a `ProtocolMealItem` with `BlockStatus` (completed, active, pending, overdue) and `isCompleted` flag
  - `ProtocolDayState` — holds `List<ProtocolBlock> blocks`, `ProtocolModel? protocol`, `List<String> activities`, `List<String> notes`, `int currentDay`, `int totalDays`, loading/error status
  - `protocolDayProvider` — `StateNotifierProvider<ProtocolDayNotifier, ProtocolDayState>`
  - `ProtocolDayNotifier.markBlockCompleted(int index)` — marks block done
  - `ProtocolDayNotifier.nextPendingIndex` — getter for FAB tap

- [ ] **Step 1: Create the provider file**

Create `lib/features/home/presentation/providers/protocol_day_provider.dart`:

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../subscriptions/domain/protocol_model.dart';

enum BlockStatus { completed, active, pending, overdue }

class ProtocolBlock {
  final ProtocolMealItem meal;
  final BlockStatus status;
  final bool isCompleted;

  const ProtocolBlock({
    required this.meal,
    required this.status,
    this.isCompleted = false,
  });

  ProtocolBlock copyWith({BlockStatus? status, bool? isCompleted}) {
    return ProtocolBlock(
      meal: meal,
      status: status ?? this.status,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}

class ProtocolDayState {
  final List<ProtocolBlock> blocks;
  final ProtocolModel? protocol;
  final List<String> activities;
  final List<String> notes;
  final int currentDay;
  final int totalDays;
  final bool isLoading;
  final String? error;

  const ProtocolDayState({
    this.blocks = const [],
    this.protocol,
    this.activities = const [],
    this.notes = const [],
    this.currentDay = 0,
    this.totalDays = 0,
    this.isLoading = true,
    this.error,
  });

  double get completionPercent {
    if (blocks.isEmpty) return 0;
    final done = blocks.where((b) => b.isCompleted).length;
    return done / blocks.length;
  }

  ProtocolDayState copyWith({
    List<ProtocolBlock>? blocks,
    ProtocolModel? protocol,
    List<String>? activities,
    List<String>? notes,
    int? currentDay,
    int? totalDays,
    bool? isLoading,
    String? error,
  }) {
    return ProtocolDayState(
      blocks: blocks ?? this.blocks,
      protocol: protocol ?? this.protocol,
      activities: activities ?? this.activities,
      notes: notes ?? this.notes,
      currentDay: currentDay ?? this.currentDay,
      totalDays: totalDays ?? this.totalDays,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

final protocolDayProvider =
    StateNotifierProvider<ProtocolDayNotifier, ProtocolDayState>((ref) {
  return ProtocolDayNotifier();
});

class ProtocolDayNotifier extends StateNotifier<ProtocolDayState> {
  ProtocolDayNotifier() : super(const ProtocolDayState()) {
    loadProtocol();
  }

  Future<void> loadProtocol() async {
    state = state.copyWith(isLoading: true);
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        state = state.copyWith(isLoading: false);
        return;
      }

      // Get user's active protocol ID
      final userDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get();

      final activeProtocolId = userDoc.data()?['activeProtocolId'] as String?;
      if (activeProtocolId == null) {
        state = state.copyWith(isLoading: false);
        return;
      }

      // Load the protocol
      final protocolDoc = await FirebaseFirestore.instance
          .collection('diet_protocols')
          .doc(activeProtocolId)
          .get();

      if (!protocolDoc.exists) {
        state = state.copyWith(isLoading: false);
        return;
      }

      final protocol =
          ProtocolModel.fromFirestore(protocolDoc.id, protocolDoc.data()!);

      // Load today's completion status
      final today = DateTime.now();
      final todayKey =
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

      final completionDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .collection('protocol_progress')
          .doc(todayKey)
          .get();

      final completedIndices =
          List<int>.from(completionDoc.data()?['completedBlocks'] ?? []);

      // Build blocks with status
      final now = TimeOfDay.now();
      final blocks = <ProtocolBlock>[];

      for (var i = 0; i < protocol.schedule.length; i++) {
        final meal = protocol.schedule[i];
        final isCompleted = completedIndices.contains(i);

        BlockStatus status;
        if (isCompleted) {
          status = BlockStatus.completed;
        } else {
          final mealTime = _parseTime(meal.time);
          if (mealTime != null) {
            final mealMinutes = mealTime.hour * 60 + mealTime.minute;
            final nowMinutes = now.hour * 60 + now.minute;

            if ((nowMinutes - mealMinutes).abs() <= 30) {
              status = BlockStatus.active;
            } else if (nowMinutes > mealMinutes + 30) {
              status = BlockStatus.overdue;
            } else {
              status = BlockStatus.pending;
            }
          } else {
            status = BlockStatus.pending;
          }
        }

        blocks.add(ProtocolBlock(
          meal: meal,
          status: status,
          isCompleted: isCompleted,
        ));
      }

      state = state.copyWith(
        blocks: blocks,
        protocol: protocol,
        notes: protocol.importantNotes,
        currentDay: (completionDoc.data()?['dayNumber'] as int?) ?? 1,
        totalDays: 21,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  int get nextPendingIndex {
    for (var i = 0; i < state.blocks.length; i++) {
      if (!state.blocks[i].isCompleted) return i;
    }
    return -1;
  }

  Future<void> markBlockCompleted(int index) async {
    if (index < 0 || index >= state.blocks.length) return;

    final updatedBlocks = List<ProtocolBlock>.from(state.blocks);
    updatedBlocks[index] = updatedBlocks[index].copyWith(
      isCompleted: true,
      status: BlockStatus.completed,
    );
    state = state.copyWith(blocks: updatedBlocks);

    // Persist to Firestore
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final today = DateTime.now();
    final todayKey =
        '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

    final completedIndices = updatedBlocks
        .asMap()
        .entries
        .where((e) => e.value.isCompleted)
        .map((e) => e.key)
        .toList();

    await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .collection('protocol_progress')
        .doc(todayKey)
        .set({
      'completedBlocks': completedIndices,
      'dayNumber': state.currentDay,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  TimeOfDay? _parseTime(String timeStr) {
    // Handles "07:00 AM", "13:00", "1:00 PM" etc.
    final cleaned = timeStr.replaceAll(RegExp(r'\s*(AM|PM)\s*', caseSensitive: false), '');
    final parts = cleaned.split(':');
    if (parts.length != 2) return null;

    int? hour = int.tryParse(parts[0].trim());
    final int? minute = int.tryParse(parts[1].trim());
    if (hour == null || minute == null) return null;

    if (timeStr.toUpperCase().contains('PM') && hour != 12) hour += 12;
    if (timeStr.toUpperCase().contains('AM') && hour == 12) hour = 0;

    return TimeOfDay(hour: hour, minute: minute);
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile" && flutter analyze lib/features/home/presentation/providers/protocol_day_provider.dart`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
git add lib/features/home/presentation/providers/protocol_day_provider.dart
git commit -m "feat: add ProtocolDayNotifier with block states and Firestore persistence"
```

---

### Task 4: Create BlockCard Widget

**Files:**
- Create: `lib/features/home/presentation/widgets/block_card.dart`

**Interfaces:**
- Consumes: `ProtocolBlock` and `BlockStatus` from `lib/features/home/presentation/providers/protocol_day_provider.dart`, `AppColors` from `lib/core/constants/app_colors.dart`
- Produces: `BlockCard({required ProtocolBlock block, required int index, required VoidCallback onComplete})` — card widget for a single protocol timeline block

- [ ] **Step 1: Create the BlockCard widget**

Create `lib/features/home/presentation/widgets/block_card.dart`:

```dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
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
          // Timeline column: circle + line
          SizedBox(
            width: 40,
            child: Column(
              children: [
                _buildTimelineCircle(),
                if (widget.index >= 0) // always show line except possibly last
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
          // Card content
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
                    // Time badge
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
                    // Title + subtitle
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
                              style: TextStyle(
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
                              style: TextStyle(
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
                    // Status icon / complete button
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
        return Icon(Icons.radio_button_checked,
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
```

- [ ] **Step 2: Verify it compiles**

Run: `cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile" && flutter analyze lib/features/home/presentation/widgets/block_card.dart`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
git add lib/features/home/presentation/widgets/block_card.dart
git commit -m "feat: add BlockCard widget with 4 visual states and animations"
```

---

### Task 5: Create TodayScreen (Protocol Timeline)

**Files:**
- Create: `lib/features/home/presentation/screens/today_screen.dart`

**Interfaces:**
- Consumes: `protocolDayProvider` from `lib/features/home/presentation/providers/protocol_day_provider.dart`, `BlockCard` from `lib/features/home/presentation/widgets/block_card.dart`, `AppColors` from `lib/core/constants/app_colors.dart`
- Produces: `TodayScreen()` — ConsumerStatefulWidget, the main "Hoy" tab screen with protocol timeline, AppBar with ALOEC branding + courses icon + date, staggered fade-in animation

- [ ] **Step 1: Create the TodayScreen**

Create `lib/features/home/presentation/screens/today_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../providers/protocol_day_provider.dart';
import '../widgets/block_card.dart';

class TodayScreen extends ConsumerStatefulWidget {
  const TodayScreen({super.key});

  @override
  ConsumerState<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends ConsumerState<TodayScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  String _formatDate(DateTime date) {
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const months = [
      '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return '${days[date.weekday - 1]} ${date.day} ${months[date.month]}';
  }

  @override
  Widget build(BuildContext context) {
    final dayState = ref.watch(protocolDayProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: AppColors.backgroundLight,
        elevation: 0,
        leadingWidth: 100,
        leading: Padding(
          padding: const EdgeInsets.only(left: 16),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'ALOEC',
              style: TextStyle(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.w800,
                fontSize: 20,
              ),
            ),
          ),
        ),
        title: Text(
          _formatDate(DateTime.now()),
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: AppColors.textLight,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.school_outlined, color: AppColors.textDark),
            onPressed: () {
              // Navigate to courses — reuse existing route
              // CoursesScreen is no longer a tab, show it as a pushed screen
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const _CoursesPageWrapper(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined,
                color: AppColors.textDark),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Proximamente')),
              );
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: dayState.isLoading
          ? const Center(
              child:
                  CircularProgressIndicator(color: AppColors.primaryGreen))
          : dayState.protocol == null
              ? _buildEmptyState()
              : _buildTimeline(dayState),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.assignment_outlined,
                  size: 50, color: AppColors.primaryGreen),
            ),
            const SizedBox(height: 20),
            const Text(
              'No tienes un protocolo activo',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Calcula tu IMC para recibir un protocolo personalizado.',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textLight,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                icon: const Icon(Icons.calculate),
                label: const Text('Calcular mi IMC',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600)),
                onPressed: () => context.push('/bmi-calculator'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeline(ProtocolDayState dayState) {
    return RefreshIndicator(
      color: AppColors.primaryGreen,
      onRefresh: () =>
          ref.read(protocolDayProvider.notifier).loadProtocol(),
      child: ListView(
        controller: _scrollController,
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        children: [
          // Protocol header with progress
          _buildProtocolHeader(dayState),
          const SizedBox(height: 20),

          // Timeline blocks
          ...dayState.blocks.asMap().entries.map((entry) {
            return TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: 1),
              duration: Duration(milliseconds: 300 + entry.key * 50),
              curve: Curves.easeOut,
              builder: (context, value, child) {
                return Opacity(
                  opacity: value,
                  child: Transform.translate(
                    offset: Offset(0, 20 * (1 - value)),
                    child: child,
                  ),
                );
              },
              child: BlockCard(
                block: entry.value,
                index: entry.key,
                onComplete: () => ref
                    .read(protocolDayProvider.notifier)
                    .markBlockCompleted(entry.key),
              ),
            );
          }),

          // Notes section
          if (dayState.notes.isNotEmpty) ...[
            const SizedBox(height: 16),
            _buildNotesSection(dayState.notes),
          ],
        ],
      ),
    );
  }

  Widget _buildProtocolHeader(ProtocolDayState dayState) {
    final percent = dayState.completionPercent;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Protocolo Dia ${dayState.currentDay} / ${dayState.totalDays}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),
              Text(
                '${(percent * 100).toInt()}%',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryGreen,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: percent),
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeOut,
              builder: (context, value, _) {
                return LinearProgressIndicator(
                  value: value,
                  minHeight: 8,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primaryGreen),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotesSection(List<String> notes) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.amber.withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.push_pin, size: 16, color: Colors.amber),
              SizedBox(width: 6),
              Text(
                'Notas importantes',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...notes.map((note) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('  ', style: TextStyle(fontSize: 13)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        note,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textLight,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

/// Wrapper to show CoursesScreen as a standalone page from AppBar
class _CoursesPageWrapper extends StatelessWidget {
  const _CoursesPageWrapper();

  @override
  Widget build(BuildContext context) {
    // Import and use existing CoursesScreen
    return const Scaffold(
      body: _CoursesPlaceholder(),
    );
  }
}

class _CoursesPlaceholder extends StatelessWidget {
  const _CoursesPlaceholder();
  @override
  Widget build(BuildContext context) {
    // This will be replaced with actual CoursesScreen import
    return const SizedBox.shrink();
  }
}
```

Note: The `_CoursesPageWrapper` is a placeholder. In the next task when we wire up HomeScreen, we'll import `CoursesScreen` directly.

- [ ] **Step 2: Replace the courses placeholder with the real import**

At the top of `today_screen.dart`, add:
```dart
import '../../../courses/presentation/screens/courses_screen.dart';
```

Replace the `_CoursesPageWrapper` and `_CoursesPlaceholder` classes at the bottom with:
```dart
class _CoursesPageWrapper extends StatelessWidget {
  const _CoursesPageWrapper();

  @override
  Widget build(BuildContext context) {
    return const CoursesScreen();
  }
}
```

Delete the `_CoursesPlaceholder` class entirely.

- [ ] **Step 3: Verify it compiles**

Run: `cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile" && flutter analyze lib/features/home/presentation/screens/today_screen.dart`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
git add lib/features/home/presentation/screens/today_screen.dart
git commit -m "feat: add TodayScreen with protocol timeline, staggered animations, and notes"
```

---

### Task 6: Create ProgressScreen

**Files:**
- Create: `lib/features/progress/presentation/screens/progress_screen.dart`

**Interfaces:**
- Consumes: `AppColors` from `lib/core/constants/app_colors.dart`, `BmiCalculatorScreen` via GoRouter push to `/bmi-calculator`, `FirebaseAuth` + `FirebaseFirestore` for BMI records
- Produces: `ProgressScreen()` — ConsumerWidget showing BMI card, compliance stats, streak badge

- [ ] **Step 1: Create the ProgressScreen**

Create directories first:
```bash
mkdir -p "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile/lib/features/progress/presentation/screens"
```

Create `lib/features/progress/presentation/screens/progress_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../subscriptions/domain/protocol_model.dart';

class ProgressScreen extends ConsumerStatefulWidget {
  const ProgressScreen({super.key});

  @override
  ConsumerState<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends ConsumerState<ProgressScreen> {
  double? _latestBmi;
  String? _bmiCategory;
  DateTime? _bmiDate;
  bool _isLoading = true;
  int _streak = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _isLoading = false);
      return;
    }

    // Load latest BMI record
    final bmiSnapshot = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .collection('bmi_records')
        .orderBy('date', descending: true)
        .limit(1)
        .get();

    if (bmiSnapshot.docs.isNotEmpty) {
      final data = bmiSnapshot.docs.first.data();
      _latestBmi = (data['bmi'] as num?)?.toDouble();
      _bmiCategory = data['category'] as String?;
      final timestamp = data['date'] as Timestamp?;
      _bmiDate = timestamp?.toDate();
    }

    // Calculate streak from protocol_progress
    int streak = 0;
    var date = DateTime.now();
    for (var i = 0; i < 90; i++) {
      final key =
          '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      final doc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .collection('protocol_progress')
          .doc(key)
          .get();

      if (doc.exists &&
          (doc.data()?['completedBlocks'] as List?)?.isNotEmpty == true) {
        streak++;
        date = date.subtract(const Duration(days: 1));
      } else {
        break;
      }
    }

    if (!mounted) return;
    setState(() {
      _streak = streak;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Mi Progreso'),
        backgroundColor: AppColors.backgroundLight,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primaryGreen))
          : RefreshIndicator(
              color: AppColors.primaryGreen,
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // BMI Card
                  _buildBmiCard(),
                  const SizedBox(height: 16),
                  // Streak
                  _buildStreakCard(),
                  const SizedBox(height: 16),
                  // Placeholder for weekly chart
                  _buildWeeklyPlaceholder(),
                ],
              ),
            ),
    );
  }

  Widget _buildBmiCard() {
    final hasBmi = _latestBmi != null;
    final color = hasBmi
        ? Color(ProtocolModel.getCategoryColorValue(_latestBmi!))
        : AppColors.textLight;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    hasBmi ? _latestBmi!.toStringAsFixed(1) : '--',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: color,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Indice de Masa Corporal',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      hasBmi
                          ? _bmiCategory ??
                              ProtocolModel.getCategoryLabel(_latestBmi!)
                          : 'Sin calcular',
                      style: TextStyle(
                        fontSize: 13,
                        color: color,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if (_bmiDate != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        'Ultimo calculo: ${_bmiDate!.day}/${_bmiDate!.month}/${_bmiDate!.year}',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.textLight,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryGreen,
                side: const BorderSide(color: AppColors.primaryGreen),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.calculate, size: 18),
              label: Text(hasBmi ? 'Recalcular IMC' : 'Calcular IMC'),
              onPressed: () => context.push('/bmi-calculator'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStreakCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.orange.withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child:
                const Icon(Icons.local_fire_department, color: Colors.orange, size: 28),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$_streak dias consecutivos',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                _streak > 0 ? 'Sigue asi!' : 'Completa bloques para empezar tu racha',
                style: TextStyle(fontSize: 13, color: AppColors.textLight),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWeeklyPlaceholder() {
    return Container(
      padding: const EdgeInsets.all(20),
      height: 200,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Cumplimiento semanal',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.textDark,
            ),
          ),
          const Spacer(),
          Center(
            child: Text(
              'Grafico disponible pronto',
              style: TextStyle(fontSize: 13, color: AppColors.textLight),
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile" && flutter analyze lib/features/progress/presentation/screens/progress_screen.dart`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
git add lib/features/progress/presentation/screens/progress_screen.dart
git commit -m "feat: add ProgressScreen with BMI card, streak, and weekly placeholder"
```

---

### Task 7: Create ProtocolFab Widget

**Files:**
- Create: `lib/features/home/presentation/widgets/protocol_fab.dart`

**Interfaces:**
- Consumes: `protocolDayProvider` from `lib/features/home/presentation/providers/protocol_day_provider.dart`, `AppColors` from `lib/core/constants/app_colors.dart`
- Produces: `ProtocolFab({required WidgetRef ref})` — FAB widget with tap (mark next) and long press (show sheet)

- [ ] **Step 1: Create the ProtocolFab widget**

Create `lib/features/home/presentation/widgets/protocol_fab.dart`:

```dart
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

    // Don't show FAB if no protocol or all completed
    if (dayState.protocol == null || notifier.nextPendingIndex == -1) {
      return const SizedBox.shrink();
    }

    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.35),
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
                // Handle bar
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
                                TextStyle(fontSize: 12, color: AppColors.textLight)),
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
```

- [ ] **Step 2: Verify it compiles**

Run: `cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile" && flutter analyze lib/features/home/presentation/widgets/protocol_fab.dart`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
git add lib/features/home/presentation/widgets/protocol_fab.dart
git commit -m "feat: add ProtocolFab with tap-to-complete and long-press block selector"
```

---

### Task 8: Rewire HomeScreen — New Tabs + Floating Nav + FAB

**Files:**
- Modify: `lib/features/home/presentation/screens/home_screen.dart` (full rewrite)

**Interfaces:**
- Consumes:
  - `WellnessBottomNav` from `lib/features/home/presentation/widgets/wellness_bottom_nav.dart`
  - `ProtocolFab` from `lib/features/home/presentation/widgets/protocol_fab.dart`
  - `TodayScreen` from `lib/features/home/presentation/screens/today_screen.dart`
  - `JuicesScreen` from `lib/features/juices/presentation/screens/juices_screen.dart`
  - `ProgressScreen` from `lib/features/progress/presentation/screens/progress_screen.dart`
  - `ProfileScreen` from `lib/features/profile/presentation/screens/profile_screen.dart`
- Produces: Updated `HomeScreen` with 4 tabs, floating nav, FAB, animated transitions

- [ ] **Step 1: Rewrite home_screen.dart**

Replace the entire content of `lib/features/home/presentation/screens/home_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../juices/presentation/screens/juices_screen.dart';
import '../../../profile/presentation/screens/profile_screen.dart';
import '../../../progress/presentation/screens/progress_screen.dart';
import '../widgets/wellness_bottom_nav.dart';
import '../widgets/protocol_fab.dart';
import 'today_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    TodayScreen(),
    JuicesScreen(),
    ProgressScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        transitionBuilder: (child, animation) =>
            FadeTransition(opacity: animation, child: child),
        child: IndexedStack(
          key: ValueKey(_selectedIndex),
          index: _selectedIndex,
          children: _screens,
        ),
      ),
      floatingActionButton: const ProtocolFab(),
      bottomNavigationBar: WellnessBottomNav(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
        },
      ),
    );
  }
}
```

- [ ] **Step 2: Move SelectProtocolNotification to a shared location**

The `SelectProtocolNotification` class in `juice_schedule_screen.dart` (line 395) is now unused by HomeScreen since we removed the IMC tab switch. It's only used internally by `JuiceScheduleScreen` (which is no longer a tab). Leave it in place — it doesn't break anything and `JuiceScheduleScreen` may still be used as a standalone screen.

- [ ] **Step 3: Verify the full app compiles**

Run: `cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile" && flutter analyze`
Expected: No errors (warnings about unused imports are acceptable)

- [ ] **Step 4: Commit**

```bash
cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
git add lib/features/home/presentation/screens/home_screen.dart
git commit -m "feat: rewire HomeScreen with 4-tab Wellness Premium nav, FAB, and animated transitions"
```

---

### Task 9: Final Integration Fixes and Verification

**Files:**
- Possibly modify: any file with compilation errors from integration
- Verify: full app analysis

**Interfaces:**
- Consumes: all files created/modified in Tasks 1-8
- Produces: a fully compiling, integrated app

- [ ] **Step 1: Run full analysis**

Run: `cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile" && flutter analyze`
Expected: No errors

If there are errors, fix them. Common issues:
- Missing imports
- `AnimatedBuilder` should be `AnimatedBuilder` (verify it exists in Flutter — if not, use `AnimatedWidget` pattern or `ListenableBuilder`)
- Unused imports from the old 5-tab setup in `home_screen.dart`

- [ ] **Step 2: Fix any AnimatedBuilder issue in block_card.dart**

Note: `AnimatedBuilder` was renamed to `AnimatedBuilder` in Flutter — verify. If the analyzer flags it, replace with `ListenableBuilder`:

In `block_card.dart`, the `_PulsingCircleState.build` method — if `AnimatedBuilder` doesn't exist, replace:
```dart
// Replace:
return AnimatedBuilder(
// With:
return AnimatedBuilder(
```

Actually, the correct Flutter class name is `AnimatedBuilder`. If the analyzer reports it doesn't exist, it's because the correct name is `AnimatedBuilder` — which IS the correct name in Flutter. If there's a typo, fix it. The class is in `package:flutter/widgets.dart`.

- [ ] **Step 3: Verify GoRouter routes still work**

Check that all existing routes in `app_router.dart` are unaffected. The only change was adding `refreshListenable` — no routes were modified.

- [ ] **Step 4: Commit any fixes**

```bash
cd "E:/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
git add -A
git commit -m "fix: resolve integration issues from bottom nav redesign"
```

- [ ] **Step 5: End-to-end verification checklist**

Manually verify (or run on device/emulator):
1. App launches to splash, login works
2. After login, HomeScreen shows 4 tabs (Hoy, Recetas, Progreso, Perfil)
3. Bottom nav is floating with rounded corners and shadow
4. Tapping each tab shows the correct screen with fade transition
5. "Hoy" tab shows protocol timeline (or empty state with "Calcular IMC" button)
6. FAB appears when protocol is active, tap marks next block, long press shows sheet
7. "Recetas" tab shows recipe grid (existing JuicesScreen)
8. "Progreso" tab shows BMI card with recalculate button + streak
9. "Perfil" tab shows profile with logout button
10. Logout: confirm dialog -> sign out -> auto-redirect to splash (no manual navigation)
11. Login as different user -> no stale data
12. Courses accessible via school icon in AppBar of "Hoy" tab
