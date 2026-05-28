import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class JuiceScheduleScreen extends StatelessWidget {
  const JuiceScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Horario de jugos', style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Fake calendar strip
            const Center(child: Text('mayo 2022', style: TextStyle(fontWeight: FontWeight.bold))),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _DayWidget(day: 'Mar', number: '11', isActive: false),
                _DayWidget(day: 'Mié', number: '12', isActive: false),
                _DayWidget(day: 'Jue', number: '13', isActive: false),
                _DayWidget(day: 'Vie', number: '14', isActive: true),
                _DayWidget(day: 'Sáb', number: '15', isActive: false),
              ],
            ),
            const SizedBox(height: 32),
            _MealSection(
              title: 'Desayuno',
              calories: '2 comidas | 230 calorías',
              juices: [
                _JuiceTile(name: 'Jugo de remolacha', time: '07:00', isDone: true),
                _JuiceTile(name: 'Jugo de limon', time: '07:30', isDone: false),
              ],
            ),
            _MealSection(
              title: 'Almuerzo',
              calories: '2 comidas | 500 calorías',
              juices: [
                _JuiceTile(name: 'Jugo de remolacha', time: '13:00', isDone: false),
                _JuiceTile(name: 'Jugo de limon', time: '13:30', isDone: false),
              ],
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppColors.primaryGreen,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}

class _DayWidget extends StatelessWidget {
  final String day;
  final String number;
  final bool isActive;

  const _DayWidget({required this.day, required this.number, required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      decoration: BoxDecoration(
        color: isActive ? AppColors.primaryGreen : Colors.transparent,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Column(
        children: [
          Text(day, style: TextStyle(color: isActive ? Colors.white : Colors.grey)),
          const SizedBox(height: 4),
          Text(number, style: TextStyle(color: isActive ? Colors.white : Colors.black, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _MealSection extends StatelessWidget {
  final String title;
  final String calories;
  final List<Widget> juices;

  const _MealSection({required this.title, required this.calories, required this.juices});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Text(calories, style: const TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
        const SizedBox(height: 16),
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

  const _JuiceTile({required this.name, required this.time, required this.isDone});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(color: Colors.orange[100], borderRadius: BorderRadius.circular(10)),
        child: const Icon(Icons.local_drink, color: Colors.orange), // Placeholder
      ),
      title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(time, style: const TextStyle(color: Colors.grey)),
      trailing: Icon(
        Icons.check_circle,
        color: isDone ? AppColors.primaryGreen : Colors.grey[300],
      ),
    );
  }
}
