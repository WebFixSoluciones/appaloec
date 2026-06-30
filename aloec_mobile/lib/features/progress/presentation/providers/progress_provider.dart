import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class DailyCompliance {
  final DateTime date;
  final String dayLabel;
  final int completed;
  final int total;
  final double percentage;

  const DailyCompliance({
    required this.date,
    required this.dayLabel,
    required this.completed,
    required this.total,
    required this.percentage,
  });
}

class ProgressState {
  final double? latestBmi;
  final String? bmiCategory;
  final DateTime? bmiDate;
  final int streak;
  final List<DailyCompliance> weeklyCompliance;
  final bool isLoading;
  final String? error;

  const ProgressState({
    this.latestBmi,
    this.bmiCategory,
    this.bmiDate,
    this.streak = 0,
    this.weeklyCompliance = const [],
    this.isLoading = true,
    this.error,
  });

  double get weeklyAverage {
    if (weeklyCompliance.isEmpty) return 0;
    final sum = weeklyCompliance.fold<double>(
        0, (prev, d) => prev + d.percentage);
    return sum / weeklyCompliance.length;
  }

  ProgressState copyWith({
    double? latestBmi,
    String? bmiCategory,
    DateTime? bmiDate,
    int? streak,
    List<DailyCompliance>? weeklyCompliance,
    bool? isLoading,
    String? error,
  }) {
    return ProgressState(
      latestBmi: latestBmi ?? this.latestBmi,
      bmiCategory: bmiCategory ?? this.bmiCategory,
      bmiDate: bmiDate ?? this.bmiDate,
      streak: streak ?? this.streak,
      weeklyCompliance: weeklyCompliance ?? this.weeklyCompliance,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

final progressProvider =
    StateNotifierProvider<ProgressNotifier, ProgressState>((ref) {
  return ProgressNotifier();
});

class ProgressNotifier extends StateNotifier<ProgressState> {
  ProgressNotifier() : super(const ProgressState()) {
    loadAll();
  }

  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      state = state.copyWith(isLoading: false);
      return;
    }

    try {
      final results = await Future.wait([
        _loadBmi(user.uid).timeout(
          const Duration(seconds: 8),
          onTimeout: () => _BmiResult(null, null, null),
        ),
        _loadWeeklyAndStreak(user.uid).timeout(
          const Duration(seconds: 10),
          onTimeout: () => _WeeklyResult(0, <DailyCompliance>[]),
        ),
      ]);

      final bmiResult = results[0] as _BmiResult;
      final weeklyResult = results[1] as _WeeklyResult;

      state = state.copyWith(
        latestBmi: bmiResult.bmi,
        bmiCategory: bmiResult.category,
        bmiDate: bmiResult.date,
        streak: weeklyResult.streak,
        weeklyCompliance: weeklyResult.compliance,
        isLoading: false,
      );
    } catch (e) {
      debugPrint('ProgressNotifier error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<_BmiResult> _loadBmi(String uid) async {
    try {
      final bmiSnapshot = await FirebaseFirestore.instance
          .collection('users')
          .doc(uid)
          .collection('bmi_records')
          .orderBy('date', descending: true)
          .limit(1)
          .get();

      if (bmiSnapshot.docs.isEmpty) return const _BmiResult(null, null, null);

      final data = bmiSnapshot.docs.first.data();
      return _BmiResult(
        (data['bmi'] as num?)?.toDouble(),
        data['category'] as String?,
        (data['date'] as Timestamp?)?.toDate(),
      );
    } catch (e) {
      debugPrint('_loadBmi error: $e');
      return const _BmiResult(null, null, null);
    }
  }

  Future<_WeeklyResult> _loadWeeklyAndStreak(String uid) async {
    try {
      final userDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(uid)
          .get();

      final activeProtocolId = userDoc.data()?['activeProtocolId'] as String?;
      int totalBlocks = 0;

      if (activeProtocolId != null) {
        final protocolDoc = await FirebaseFirestore.instance
            .collection('diet_protocols')
            .doc(activeProtocolId)
            .get();

        if (protocolDoc.exists) {
          final schedule = protocolDoc.data()?['schedule'] as List<dynamic>?;
          totalBlocks = schedule?.length ?? 0;
        }
      }

      final now = DateTime.now();
      final List<String> dateKeys = [];
      final List<DateTime> dates = [];
      final List<String> labels = [];

      for (var i = 6; i >= 0; i--) {
        final d = now.subtract(Duration(days: i));
        dateKeys.add(
            '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}');
        dates.add(d);
        labels.add(_dayLabel(d));
      }

      final progressSnap = await FirebaseFirestore.instance
          .collection('users')
          .doc(uid)
          .collection('protocol_progress')
          .where(FieldPath.documentId, whereIn: dateKeys)
          .get();

      final Map<String, int> completedMap = {};
      for (final doc in progressSnap.docs) {
        final blocks = doc.data()['completedBlocks'] as List<dynamic>?;
        if (blocks != null && blocks.isNotEmpty) {
          completedMap[doc.id] = blocks.length;
        }
      }

      final compliance = <DailyCompliance>[];
      for (var i = 0; i < dateKeys.length; i++) {
        final completed = completedMap[dateKeys[i]] ?? 0;
        final total = totalBlocks > 0 ? totalBlocks : 0;
        final pct = total > 0 ? (completed / total * 100).clamp(0, 100).toDouble() : 0.0;
        compliance.add(DailyCompliance(
          date: dates[i],
          dayLabel: labels[i],
          completed: completed,
          total: total,
          percentage: pct,
        ));
      }

      final streak = _computeStreak(completedMap, now);

      return _WeeklyResult(streak, compliance);
    } catch (e) {
      debugPrint('_loadWeeklyAndStreak error: $e');
      return const _WeeklyResult(0, <DailyCompliance>[]);
    }
  }

  int _computeStreak(Map<String, int> completedMap, DateTime now) {
    final todayKey =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    final yesterday = now.subtract(const Duration(days: 1));
    final yesterdayKey =
        '${yesterday.year}-${yesterday.month.toString().padLeft(2, '0')}-${yesterday.day.toString().padLeft(2, '0')}';

    DateTime checkDate;

    if (completedMap.containsKey(todayKey)) {
      checkDate = now;
    } else if (completedMap.containsKey(yesterdayKey)) {
      checkDate = yesterday;
    } else {
      return 0;
    }

    int streak = 0;
    for (var i = 0; i < 90; i++) {
      final key =
          '${checkDate.year}-${checkDate.month.toString().padLeft(2, '0')}-${checkDate.day.toString().padLeft(2, '0')}';
      if (completedMap.containsKey(key)) {
        streak++;
        checkDate = checkDate.subtract(const Duration(days: 1));
      } else {
        break;
      }
    }
    return streak;
  }

  String _dayLabel(DateTime d) {
    switch (d.weekday) {
      case 1:
        return 'L';
      case 2:
        return 'M';
      case 3:
        return 'X';
      case 4:
        return 'J';
      case 5:
        return 'V';
      case 6:
        return 'S';
      case 7:
        return 'D';
      default:
        return '';
    }
  }
}

class _BmiResult {
  final double? bmi;
  final String? category;
  final DateTime? date;

  const _BmiResult(this.bmi, this.category, this.date);
}

class _WeeklyResult {
  final int streak;
  final List<DailyCompliance> compliance;

  const _WeeklyResult(this.streak, this.compliance);
}
