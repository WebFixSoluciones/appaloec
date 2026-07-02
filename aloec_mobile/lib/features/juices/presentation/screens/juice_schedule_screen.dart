import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/juices_provider.dart';

class JuiceScheduleScreen extends ConsumerStatefulWidget {
  const JuiceScheduleScreen({super.key});

  @override
  ConsumerState<JuiceScheduleScreen> createState() => _JuiceScheduleScreenState();
}

class _JuiceScheduleScreenState extends ConsumerState<JuiceScheduleScreen> {
  late DateTime _selectedDate;
  late List<DateTime> _weekDays;
  bool _hasActiveProtocol = false;
  bool _loadingProtocol = true;
  Map<String, dynamic>? _protocolData;

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now();
    _weekDays = _buildWeekDays(_selectedDate);
    _checkActiveProtocol();
  }

  Future<void> _checkActiveProtocol() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      if (mounted) setState(() => _loadingProtocol = false);
      return;
    }

    final doc = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();

    if (!mounted) return;

    final protocolId = doc.data()?['activeProtocolId'];

    if (protocolId != null && protocolId is String && protocolId.isNotEmpty) {
      final protocolDoc = await FirebaseFirestore.instance
          .collection('diet_protocols')
          .doc(protocolId)
          .get();

      if (!mounted) return;

      setState(() {
        _hasActiveProtocol = protocolDoc.exists;
        _protocolData = protocolDoc.data();
        _loadingProtocol = false;
      });
    } else {
      setState(() {
        _hasActiveProtocol = false;
        _loadingProtocol = false;
      });
    }
  }

  List<DateTime> _buildWeekDays(DateTime reference) {
    return List.generate(5, (i) => reference.subtract(Duration(days: 2 - i)));
  }

  String _monthName(int month) {
    const months = [
      '', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months[month];
  }

  String _dayName(int weekday) {
    const days = ['', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    return days[weekday];
  }

  List<Map<String, String>> _buildMealsFromProtocol() {
    if (_protocolData == null) return [];
    final schedule = _protocolData!['dailySchedule'];
    if (schedule == null || schedule is! List) return [];

    final List<Map<String, String>> meals = [];
    for (final day in schedule) {
      if (day['dayNumber'] == 1) {
        final juices = day['juices'] ?? [];
        for (final juice in List<dynamic>.from(juices)) {
          final recipeId = juice['recipeId'] ?? '';
          final targetTime = juice['targetTime'] ?? '';
          final mealType = _mealTypeLabel(juice['type'] ?? '');
          meals.add({
            'recipeId': recipeId is String ? recipeId : '',
            'targetTime': targetTime is String ? targetTime : '',
            'mealType': mealType,
            'type': juice['type'] is String ? juice['type'] : '',
          });
        }
      }
    }
    return meals;
  }

  String _mealTypeLabel(String type) {
    switch (type) {
      case 'breakfast_substitute': return 'Desayuno';
      case 'lunch_complement': return 'Almuerzo';
      case 'dinner_substitute': return 'Cena';
      case 'snack': return 'Snack';
      default: return type;
    }
  }

  Color _mealTypeColor(String type) {
    switch (type) {
      case 'breakfast_substitute': return Colors.orange;
      case 'lunch_complement': return Colors.blue;
      case 'dinner_substitute': return Colors.purple;
      case 'snack': return Colors.teal;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final meals = _buildMealsFromProtocol();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Mi Horario de Jugos',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Text(
                '${_monthName(_selectedDate.month)} ${_selectedDate.year}',
                style: const TextStyle(
                    fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: _weekDays.map((date) {
                final isActive = date.day == _selectedDate.day &&
                    date.month == _selectedDate.month;
                final isToday = date.day == now.day &&
                    date.month == now.month &&
                    date.year == now.year;
                return GestureDetector(
                  onTap: () => setState(() {
                    _selectedDate = date;
                  }),
                  child: _DayWidget(
                    day: _dayName(date.weekday),
                    number: date.day.toString(),
                    isActive: isActive,
                    isToday: isToday,
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 32),

            if (_loadingProtocol)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: CircularProgressIndicator(color: AppColors.primaryGreen),
                ),
              )
            else if (!_hasActiveProtocol) ...[
              const SizedBox(height: 40),
              Center(
                child: Column(
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
                      'No tienes protocolos seleccionados',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Calcula tu IMC para recibir un protocolo personalizado con tu agenda diaria de jugos.',
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
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        onPressed: () => context.push('/bmi-calculator'),
                      ),
                    ),
                  ],
                ),
              ),
            ] else if (meals.isEmpty) ...[
              const SizedBox(height: 40),
              Center(
                child: Column(
                  children: [
                    Icon(Icons.restaurant_menu, size: 48, color: Colors.grey[300]),
                    const SizedBox(height: 12),
                    const Text('Sin comidas para hoy',
                        style: TextStyle(fontSize: 14, color: Colors.grey)),
                  ],
                ),
              ),
            ] else ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.07),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: AppColors.primaryGreen.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline,
                        color: AppColors.primaryGreen, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _protocolData?['title'] is String
                            ? _protocolData!['title']
                            : 'Protocolo activo',
                        style: TextStyle(
                            fontSize: 13,
                            color: AppColors.textDark,
                            height: 1.4,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              ...meals.map((meal) {
                final type = meal['type'] ?? '';
                final color = _mealTypeColor(type);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: color.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Center(
                              child: Icon(Icons.local_drink, color: color, size: 26),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 2),
                                  margin: const EdgeInsets.only(bottom: 4),
                                  decoration: BoxDecoration(
                                    color: color.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    meal['mealType'] ?? 'Comida',
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: color),
                                  ),
                                ),
                                Text(
                                  meal['targetTime'] ?? '',
                                  style: const TextStyle(
                                      fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                          if (meal['recipeId'] is String && (meal['recipeId'] as String).isNotEmpty)
                            TextButton(
                              onPressed: () => context.push('/juice-detail/${meal['recipeId']}'),
                              child: const Text('Ver receta',
                                  style: TextStyle(fontSize: 12)),
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}

class _DayWidget extends StatelessWidget {
  final String day;
  final String number;
  final bool isActive;
  final bool isToday;

  const _DayWidget({
    required this.day,
    required this.number,
    required this.isActive,
    this.isToday = false,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
      decoration: BoxDecoration(
        color: isActive
            ? AppColors.primaryGreen
            : isToday
                ? AppColors.primaryGreen.withOpacity(0.1)
                : Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        border: isToday && !isActive
            ? Border.all(color: AppColors.primaryGreen, width: 1.5)
            : null,
      ),
      child: Column(
        children: [
          Text(day,
              style: TextStyle(
                  color: isActive
                      ? Colors.white
                      : isToday
                          ? AppColors.primaryGreen
                          : Colors.grey,
                  fontSize: 12)),
          const SizedBox(height: 4),
          Text(number,
              style: TextStyle(
                  color: isActive
                      ? Colors.white
                      : isToday
                          ? AppColors.primaryGreen
                          : Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 16)),
        ],
      ),
    );
  }
}
