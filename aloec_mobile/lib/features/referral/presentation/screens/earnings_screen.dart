import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

enum EarningsFilter { all, pending, approved, paid }

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {
  EarningsFilter _filter = EarningsFilter.all;

  @override
  Widget build(BuildContext context) {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return const SizedBox.shrink();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Mis ganancias'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: EarningsFilter.values.map((f) {
                final labels = {EarningsFilter.all: 'Todas', EarningsFilter.pending: 'Pendiente', EarningsFilter.approved: 'Aprobado', EarningsFilter.paid: 'Pagado'};
                final selected = _filter == f;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(labels[f]!),
                    selected: selected,
                    onSelected: (_) => setState(() => _filter = f),
                    selectedColor: Colors.green.shade100,
                    checkmarkColor: Colors.green,
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('commissions')
            .where('referrerUid', isEqualTo: uid)
            .orderBy('createdAt', descending: true)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          var docs = snapshot.data?.docs ?? [];
          if (_filter != EarningsFilter.all) {
            final status = _filter.name;
            docs = docs.where((d) => (d.data() as Map<String, dynamic>)['status'] == status).toList();
          }
          if (docs.isEmpty) {
            return const Center(child: Text('Sin comisiones', style: TextStyle(color: Colors.grey)));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final data = docs[index].data() as Map<String, dynamic>;
              final amount = (data['amountUSD'] as num?)?.toDouble() ?? 0;
              final status = data['status'] as String? ?? '';
              final trigger = data['triggerType'] as String? ?? '';
              final date = (data['createdAt'] as Timestamp?)?.toDate();
              final colors = _statusColor(status);
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(backgroundColor: colors.withOpacity(0.15), child: Icon(Icons.monetization_on, color: colors, size: 20)),
                  title: Text('\$${amount.toStringAsFixed(2)}', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  subtitle: Text('${_triggerLabel(trigger)}  •  ${date != null ? '${date.day}/${date.month}/${date.year}' : ''}',
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
      case 'approved': return Colors.green;
      case 'paid': return Colors.blue;
      case 'rejected': return Colors.red;
      default: return Colors.orange;
    }
  }

  String _statusLabel(String s) {
    switch (s) {
      case 'approved': return 'Aprobado';
      case 'paid': return 'Pagado';
      case 'rejected': return 'Rechazado';
      default: return 'Pendiente';
    }
  }

  String _triggerLabel(String t) {
    switch (t) {
      case 'registration': return 'Registro';
      case 'first_purchase': return 'Primera compra';
      case 'purchase': return 'Compra';
      default: return t;
    }
  }
}
