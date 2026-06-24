import 'package:flutter/material.dart';
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

      final userDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get();

      final activeProtocolId = userDoc.data()?['activeProtocolId'] as String?;
      if (activeProtocolId == null) {
        state = state.copyWith(isLoading: false);
        return;
      }

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
