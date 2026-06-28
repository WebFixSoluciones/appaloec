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
    if (!mounted) return;
    setState(() => _isLoading = true);

    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        if (mounted) {
          setState(() => _isLoading = false);
        }
        return;
      }

      // 1. Fetch latest BMI record
      try {
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
        } else {
          _latestBmi = null;
          _bmiCategory = null;
          _bmiDate = null;
        }
      } catch (e) {
        debugPrint('Error loading BMI: $e');
        _latestBmi = null;
        _bmiCategory = null;
        _bmiDate = null;
      }

      // 2. Fetch protocol progress to compute streak
      int streak = 0;
      try {
        // Query the last 90 progress documents in a single call using built-in document ID ordering
        final progressSnapshot = await FirebaseFirestore.instance
            .collection('users')
            .doc(user.uid)
            .collection('protocol_progress')
            .orderBy(FieldPath.documentId, descending: true)
            .limit(90)
            .get();

        final completedDates = <String>{};
        for (var docSnap in progressSnapshot.docs) {
          final data = docSnap.data();
          if ((data['completedBlocks'] as List?)?.isNotEmpty == true) {
            completedDates.add(docSnap.id);
          }
        }

        final now = DateTime.now();
        final todayKey =
            '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
        final yesterday = now.subtract(const Duration(days: 1));
        final yesterdayKey =
            '${yesterday.year}-${yesterday.month.toString().padLeft(2, '0')}-${yesterday.day.toString().padLeft(2, '0')}';

        String startKey = '';
        if (completedDates.contains(todayKey)) {
          startKey = todayKey;
        } else if (completedDates.contains(yesterdayKey)) {
          startKey = yesterdayKey;
        }

        if (startKey.isNotEmpty) {
          var checkDate = startKey == todayKey ? now : yesterday;
          for (var i = 0; i < 90; i++) {
            final key =
                '${checkDate.year}-${checkDate.month.toString().padLeft(2, '0')}-${checkDate.day.toString().padLeft(2, '0')}';
            if (completedDates.contains(key)) {
              streak++;
              checkDate = checkDate.subtract(const Duration(days: 1));
            } else {
              break;
            }
          }
        }
      } catch (e) {
        debugPrint('Error loading streak: $e');
        streak = 0;
      }

      if (!mounted) return;
      setState(() {
        _streak = streak;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('General error in _loadData: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
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
                  _buildBmiCard(),
                  const SizedBox(height: 16),
                  _buildStreakCard(),
                  const SizedBox(height: 16),
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
                        style: const TextStyle(
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
                style: const TextStyle(fontSize: 13, color: AppColors.textLight),
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
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Cumplimiento semanal',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.textDark,
            ),
          ),
          Spacer(),
          Center(
            child: Text(
              'Grafico disponible pronto',
              style: TextStyle(fontSize: 13, color: AppColors.textLight),
            ),
          ),
          Spacer(),
        ],
      ),
    );
  }
}
