import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/services/version_service.dart';
import '../../../juices/presentation/screens/juices_screen.dart';
import '../../../profile/presentation/screens/profile_screen.dart';
import '../../../progress/presentation/screens/progress_screen.dart';
import '../providers/home_tab_provider.dart';
import '../widgets/wellness_bottom_nav.dart';
import '../widgets/protocol_fab.dart';
import 'today_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  final int initialIndex;
  const HomeScreen({super.key, this.initialIndex = 1});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.initialIndex != 1) {
        ref.read(homeTabProvider.notifier).state = widget.initialIndex;
      }
      // Verificar si hay actualización opcional en tienda o novedades tras actualizar
      VersionService.checkAppUpdateAndWhatsNew(context);
    });
  }

  final List<Widget> _screens = const [
    TodayScreen(),
    JuicesScreen(),
    ProgressScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final selectedIndex = ref.watch(homeTabProvider);

    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        transitionBuilder: (child, animation) =>
            FadeTransition(opacity: animation, child: child),
        child: IndexedStack(
          key: ValueKey(selectedIndex),
          index: selectedIndex,
          children: _screens,
        ),
      ),
      floatingActionButton: selectedIndex == 0 ? const ProtocolFab() : null,
      bottomNavigationBar: WellnessBottomNav(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) {
          ref.read(homeTabProvider.notifier).state = index;
        },
      ),
    );
  }
}
