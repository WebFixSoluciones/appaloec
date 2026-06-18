import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class JuiceScheduleScreen extends StatefulWidget {
  const JuiceScheduleScreen({super.key});

  @override
  State<JuiceScheduleScreen> createState() => _JuiceScheduleScreenState();
}

class _JuiceScheduleScreenState extends State<JuiceScheduleScreen> {
  late DateTime _selectedDate;
  late List<DateTime> _weekDays;

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now();
    _weekDays = _buildWeekDays(_selectedDate);
  }

  List<DateTime> _buildWeekDays(DateTime reference) {
    // Obtiene los 5 días alrededor del día actual (2 antes, hoy, 2 después)
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
    const days = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return days[weekday];
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
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
            // Calendario strip con fecha real
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

            // Indicador si no hay plan asignado
            Container(
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
                      'Activa un protocolo para ver tu agenda diaria personalizada.',
                      style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textLight,
                          height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            _MealSection(
              title: 'Desayuno',
              calories: '2 tomas · 230 kcal',
              juices: const [
                _JuiceTile(
                    name: 'Jugo de remolacha',
                    time: '07:00',
                    isDone: true),
                _JuiceTile(
                    name: 'Jugo de limón y jengibre',
                    time: '07:30',
                    isDone: false),
              ],
            ),
            _MealSection(
              title: 'Almuerzo',
              calories: '2 tomas · 500 kcal',
              juices: const [
                _JuiceTile(
                    name: 'Jugo de zanahoria y manzana',
                    time: '13:00',
                    isDone: false),
                _JuiceTile(
                    name: 'Jugo verde detox',
                    time: '13:30',
                    isDone: false),
              ],
            ),
            _MealSection(
              title: 'Cena',
              calories: '1 toma · 150 kcal',
              juices: const [
                _JuiceTile(
                    name: 'Jugo de manzana natural',
                    time: '18:00',
                    isDone: false),
              ],
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: AppColors.primaryGreen,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Agregar toma',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
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

class _MealSection extends StatelessWidget {
  final String title;
  final String calories;
  final List<Widget> juices;

  const _MealSection(
      {required this.title,
      required this.calories,
      required this.juices});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title,
                style: const TextStyle(
                    fontWeight: FontWeight.bold, fontSize: 18)),
            Text(calories,
                style: const TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
        const SizedBox(height: 12),
        ...juices,
        const SizedBox(height: 24),
      ],
    );
  }
}

class _JuiceTile extends StatelessWidget {
  final String name;
  final String time;
  final bool isDone;

  const _JuiceTile(
      {required this.name, required this.time, required this.isDone});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: isDone
            ? AppColors.primaryGreen.withOpacity(0.05)
            : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDone
              ? AppColors.primaryGreen.withOpacity(0.3)
              : Colors.grey.shade200,
        ),
      ),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
              color: isDone
                  ? AppColors.primaryGreen.withOpacity(0.15)
                  : Colors.orange[50],
              borderRadius: BorderRadius.circular(12)),
          child: Icon(Icons.local_drink,
              color: isDone ? AppColors.primaryGreen : Colors.orange),
        ),
        title: Text(name,
            style: TextStyle(
                fontWeight: FontWeight.bold,
                decoration: isDone ? TextDecoration.lineThrough : null,
                color: isDone ? AppColors.textLight : AppColors.textDark)),
        subtitle: Text(time,
            style: const TextStyle(color: Colors.grey, fontSize: 12)),
        trailing: Icon(
          isDone ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
          color: isDone ? AppColors.primaryGreen : Colors.grey[300],
          size: 26,
        ),
      ),
    );
  }
}
