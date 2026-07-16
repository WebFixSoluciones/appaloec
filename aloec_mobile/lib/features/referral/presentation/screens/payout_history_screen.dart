import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class PayoutHistoryScreen extends StatelessWidget {
  const PayoutHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return const SizedBox.shrink();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Historial de retiros'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('payouts')
            .where('uid', isEqualTo: uid)
            .orderBy('createdAt', descending: true)
            .snapshots(),
        builder: (context, snapshot) {
          final docs = snapshot.data?.docs ?? [];
          if (docs.isEmpty) {
            return const Center(
              child: Text('Sin retiros realizados', style: TextStyle(color: Colors.grey)),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final data = docs[index].data() as Map<String, dynamic>;
              final amount = (data['amountUSD'] as num?)?.toDouble() ?? 0;
              final status = data['status'] as String? ?? '';
              final method = data['methodSnapshot'] as Map<String, dynamic>? ?? {};
              final date = (data['createdAt'] as Timestamp?)?.toDate();
              final colors = _statusColor(status);
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  title: Text('\$${amount.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${method['label'] ?? method['type'] ?? ''}  •  ${date != null ? '${date.day}/${date.month}/${date.year}' : ''}',
                      style: const TextStyle(fontSize: 12)),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: colors.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                    child: Text(_statusLabel(status), style: TextStyle(fontSize: 11, color: colors, fontWeight: FontWeight.w600)),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'completed': return Colors.green;
      case 'processing': return Colors.blue;
      case 'rejected': return Colors.red;
      default: return Colors.orange;
    }
  }

  String _statusLabel(String s) {
    switch (s) {
      case 'completed': return 'Completado';
      case 'processing': return 'En proceso';
      case 'rejected': return 'Rechazado';
      default: return 'Pendiente';
    }
  }
}
