import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class PayoutMethodsScreen extends StatefulWidget {
  const PayoutMethodsScreen({super.key});

  @override
  State<PayoutMethodsScreen> createState() => _PayoutMethodsScreenState();
}

class _PayoutMethodsScreenState extends State<PayoutMethodsScreen> {
  final _user = FirebaseAuth.instance.currentUser;

  @override
  Widget build(BuildContext context) {
    if (_user == null) return const SizedBox.shrink();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Métodos de cobro'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddMethodDialog(),
        icon: const Icon(Icons.add),
        label: const Text('Agregar método'),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('users').doc(_user.uid)
            .collection('payout_methods')
            .snapshots(),
        builder: (context, snapshot) {
          final docs = snapshot.data?.docs ?? [];
          if (docs.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Text('Sin métodos de cobro.\nAgrega uno para recibir tus ganancias.',
                    textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final data = docs[index].data() as Map<String, dynamic>;
              final type = data['type'] as String? ?? '';
              final label = data['label'] as String? ?? '';
              final isDefault = data['isDefault'] as bool? ?? false;
              final details = data['details'] as Map<String, dynamic>? ?? {};
              final icon = _typeIcon(type);
              final subtitle = _typeSubtitle(type, details);
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(backgroundColor: Colors.green.shade50, child: Icon(icon, color: Colors.green)),
                  title: Row(
                    children: [
                      Text(label.isNotEmpty ? label : _typeLabel(type)),
                      if (isDefault) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(6)),
                          child: const Text('Default', style: TextStyle(fontSize: 10, color: Colors.green)),
                        ),
                      ],
                    ],
                  ),
                  subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.red),
                    onPressed: () => _deleteMethod(docs[index].id),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _showAddMethodDialog() {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => _AddMethodSheet(onAdd: (type, label, details) async {
        await FirebaseFirestore.instance
            .collection('users').doc(_user!.uid)
            .collection('payout_methods')
            .add({
          'type': type,
          'label': label,
          'details': details,
          'isDefault': false,
          'isVerified': false,
          'createdAt': FieldValue.serverTimestamp(),
          'updatedAt': FieldValue.serverTimestamp(),
        });
        if (ctx.mounted) Navigator.of(ctx).pop();
      }),
    );
  }

  Future<void> _deleteMethod(String id) async {
    await FirebaseFirestore.instance
        .collection('users').doc(_user!.uid)
        .collection('payout_methods')
        .doc(id)
        .delete();
  }

  IconData _typeIcon(String t) {
    switch (t) {
      case 'paypal': return Icons.paypal;
      case 'binance': return Icons.currency_bitcoin;
      case 'bank_ec': return Icons.account_balance;
      default: return Icons.payment;
    }
  }

  String _typeLabel(String t) {
    switch (t) {
      case 'paypal': return 'PayPal';
      case 'binance': return 'Binance';
      case 'bank_ec': return 'Banco Ecuador';
      default: return t;
    }
  }

  String _typeSubtitle(String t, Map<String, dynamic> d) {
    switch (t) {
      case 'paypal': return d['email'] ?? '';
      case 'binance': return d['payId'] ?? '';
      case 'bank_ec': return '${d['bank'] ?? ''} ${d['accountNumber'] ?? ''}';
      default: return '';
    }
  }
}

class _AddMethodSheet extends StatefulWidget {
  final Function(String type, String label, Map<String, String> details) onAdd;
  const _AddMethodSheet({required this.onAdd});

  @override
  State<_AddMethodSheet> createState() => _AddMethodSheetState();
}

class _AddMethodSheetState extends State<_AddMethodSheet> {
  String _type = 'paypal';
  final _labelCtrl = TextEditingController();
  final _detail1Ctrl = TextEditingController();
  final _detail2Ctrl = TextEditingController();

  @override
  void dispose() {
    _labelCtrl.dispose();
    _detail1Ctrl.dispose();
    _detail2Ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Agregar método de cobro', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _type,
            items: const [
              DropdownMenuItem(value: 'paypal', child: Text('PayPal')),
              DropdownMenuItem(value: 'binance', child: Text('Binance')),
              DropdownMenuItem(value: 'bank_ec', child: Text('Transferencia Ecuador')),
            ],
            onChanged: (v) => setState(() => _type = v!),
            decoration: const InputDecoration(border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12)))),
          ),
          const SizedBox(height: 12),
          TextField(controller: _labelCtrl, decoration: const InputDecoration(labelText: 'Nombre descriptivo', border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))))),
          const SizedBox(height: 12),
          TextField(controller: _detail1Ctrl, decoration: InputDecoration(
            labelText: _type == 'paypal' ? 'Email de PayPal' : _type == 'binance' ? 'Pay ID de Binance' : 'Banco',
            border: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
          )),
          if (_type == 'bank_ec') ...[
            const SizedBox(height: 12),
            TextField(controller: _detail2Ctrl, decoration: const InputDecoration(labelText: 'Número de cuenta', border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))))),
          ],
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              final details = <String, String>{};
              if (_type == 'paypal') details['email'] = _detail1Ctrl.text;
              if (_type == 'binance') details['payId'] = _detail1Ctrl.text;
              if (_type == 'bank_ec') {
                details['bank'] = _detail1Ctrl.text;
                details['accountNumber'] = _detail2Ctrl.text;
              }
              widget.onAdd(_type, _labelCtrl.text, details);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF064E3B),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Guardar'),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
