import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _remindersEnabled = true;
  String _breakfastTime = '08:00';
  String _lunchTime = '13:00';
  String _dinnerTime = '18:00';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    try {
      final doc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get();

      if (doc.exists) {
        final data = doc.data()!;
        setState(() {
          _remindersEnabled = data['notificationsEnabled'] != false;
          if (data['reminderSettings'] != null) {
            final settings = data['reminderSettings'] as List;
            for (final s in settings) {
              final label = s['label'] as String?;
              final time = s['time'] as String?;
              if (label == 'breakfast' && time != null) _breakfastTime = time;
              if (label == 'lunch' && time != null) _lunchTime = time;
              if (label == 'dinner' && time != null) _dinnerTime = time;
            }
          }
        });
      }
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _save() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
      'notificationsEnabled': _remindersEnabled,
      'reminderSettings': [
        {'label': 'breakfast', 'time': _breakfastTime},
        {'label': 'lunch', 'time': _lunchTime},
        {'label': 'dinner', 'time': _dinnerTime},
      ],
    }, SetOptions(merge: true));

    final ns = NotificationService();
    if (_remindersEnabled) {
      final meals = <ProtocolMealNotification>[];
      meals.add(ProtocolMealNotification(
        hour: int.parse(_breakfastTime.split(':')[0]),
        minute: int.parse(_breakfastTime.split(':')[1]),
        title: 'Desayuno ALOEC',
        body: 'Hora de tu desayuno saludable',
      ));
      meals.add(ProtocolMealNotification(
        hour: int.parse(_lunchTime.split(':')[0]),
        minute: int.parse(_lunchTime.split(':')[1]),
        title: 'Almuerzo ALOEC',
        body: 'Hora de tu almuerzo nutritivo',
      ));
      meals.add(ProtocolMealNotification(
        hour: int.parse(_dinnerTime.split(':')[0]),
        minute: int.parse(_dinnerTime.split(':')[1]),
        title: 'Cena ALOEC',
        body: 'Hora de tu cena ligera',
      ));
      await ns.scheduleProtocolNotifications(meals);
    } else {
      await ns.cancelAllNotifications();
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Preferencias guardadas'),
            backgroundColor: Colors.green),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: AppColors.backgroundLight,
        appBar: AppBar(
            title: const Text('Notificaciones'),
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
        title: const Text('Notificaciones'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.notifications_active,
                      color: AppColors.primaryGreen),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Recordatorios diarios',
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 2),
                      Text(
                          _remindersEnabled ? 'Activados' : 'Desactivados',
                          style: const TextStyle(
                              color: AppColors.textLight, fontSize: 13)),
                    ],
                  ),
                ),
                Switch(
                  value: _remindersEnabled,
                  activeColor: AppColors.primaryGreen,
                  onChanged: (val) =>
                      setState(() => _remindersEnabled = val),
                ),
              ],
            ),
          ),
          if (_remindersEnabled) ...[
            const SizedBox(height: 20),
            _buildTimePicker(
                'Desayuno', Icons.wb_sunny, _breakfastTime,
                (t) => setState(() => _breakfastTime = t)),
            _buildTimePicker(
                'Almuerzo', Icons.wb_cloudy, _lunchTime,
                (t) => setState(() => _lunchTime = t)),
            _buildTimePicker(
                'Cena', Icons.nights_stay, _dinnerTime,
                (t) => setState(() => _dinnerTime = t)),
          ],
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('Guardar preferencias',
                  style: TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimePicker(
      String label, IconData icon, String currentTime, Function(String) onChanged) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primaryGreen, size: 22),
          const SizedBox(width: 14),
          Expanded(
            child: Text(label,
                style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 15)),
          ),
          GestureDetector(
            onTap: () async {
              final time = await showTimePicker(
                context: context,
                initialTime: TimeOfDay(
                  hour: int.parse(currentTime.split(':')[0]),
                  minute: int.parse(currentTime.split(':')[1]),
                ),
              );
              if (time != null) {
                onChanged(
                    '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}');
              }
            },
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(currentTime,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: AppColors.primaryGreen)),
            ),
          ),
        ],
      ),
    );
  }
}
