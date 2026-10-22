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
      case 'bank_ec': return 'Transferencia Bancaria';
      case 'binance': return 'Binance Pay';
      case 'paypal': return 'PayPal';
      default: return t;
    }
  }

  String _typeSubtitle(String t, Map<String, dynamic> d) {
    switch (t) {
      case 'bank_ec':
        final bName = d['bankName'] ?? d['bank'] ?? 'Banco';
        final acc = d['accountNumber'] ?? '';
        final accType = d['accountType'] ?? '';
        return '$bName ($accType) • $acc';
      case 'binance': return 'Pay ID: ${d['payId'] ?? ''}';
      case 'paypal': return d['paypalEmail'] ?? d['email'] ?? '';
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
  String _type = 'bank_ec';
  String _accountType = 'Ahorros';
  final _labelCtrl = TextEditingController();
  final _bankCtrl = TextEditingController();
  final _accountNumberCtrl = TextEditingController();
  final _holderCtrl = TextEditingController();
  final _idNumberCtrl = TextEditingController();
  final _payIdCtrl = TextEditingController();
  final _paypalEmailCtrl = TextEditingController();

  @override
  void dispose() {
    _labelCtrl.dispose();
    _bankCtrl.dispose();
    _accountNumberCtrl.dispose();
    _holderCtrl.dispose();
    _idNumberCtrl.dispose();
    _payIdCtrl.dispose();
    _paypalEmailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Agregar método de cobro', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
              IconButton(icon: const Icon(Icons.close, size: 20), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 14),
          DropdownButtonFormField<String>(
            initialValue: _type,
            items: const [
              DropdownMenuItem(value: 'bank_ec', child: Text('Transferencia Bancaria (Ecuador)')),
              DropdownMenuItem(value: 'binance', child: Text('Binance Pay (Pay ID)')),
              DropdownMenuItem(value: 'paypal', child: Text('PayPal')),
            ],
            onChanged: (v) => setState(() => _type = v!),
            decoration: const InputDecoration(
              labelText: 'Tipo de método',
              border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
            ),
          ),
          const SizedBox(height: 12),

          if (_type == 'bank_ec') ...[
            TextField(
              controller: _bankCtrl,
              decoration: const InputDecoration(
                labelText: 'Banco (ej. Banco Pichincha, Guayaquil, etc.) *',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
              ),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _accountType,
              items: const [
                DropdownMenuItem(value: 'Ahorros', child: Text('Cuenta de Ahorros')),
                DropdownMenuItem(value: 'Corriente', child: Text('Cuenta Corriente')),
              ],
              onChanged: (v) => setState(() => _accountType = v!),
              decoration: const InputDecoration(
                labelText: 'Tipo de Cuenta',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _accountNumberCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Número de cuenta *',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _holderCtrl,
              decoration: const InputDecoration(
                labelText: 'Nombre completo del titular *',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _idNumberCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Cédula o RUC del titular *',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
              ),
            ),
          ] else if (_type == 'binance') ...[
            TextField(
              controller: _payIdCtrl,
              decoration: const InputDecoration(
                labelText: 'Binance Pay ID *',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _labelCtrl,
              decoration: const InputDecoration(
                labelText: 'Usuario / Alias de Binance (opcional)',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
              ),
            ),
          ] else if (_type == 'paypal') ...[
            TextField(
              controller: _paypalEmailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Correo electrónico de PayPal *',
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
              ),
            ),
          ],

          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              final details = <String, String>{};
              String methodLabel = _labelCtrl.text.trim();

              if (_type == 'bank_ec') {
                if (_bankCtrl.text.trim().isEmpty || _accountNumberCtrl.text.trim().isEmpty) {
                  return;
                }
                details['bank'] = _bankCtrl.text.trim();
                details['bankName'] = _bankCtrl.text.trim();
                details['accountType'] = _accountType;
                details['accountNumber'] = _accountNumberCtrl.text.trim();
                details['holderName'] = _holderCtrl.text.trim();
                details['idNumber'] = _idNumberCtrl.text.trim();
                if (methodLabel.isEmpty) {
                  methodLabel = '${_bankCtrl.text.trim()} - $_accountType';
                }
              } else if (_type == 'binance') {
                if (_payIdCtrl.text.trim().isEmpty) return;
                details['payId'] = _payIdCtrl.text.trim();
                if (methodLabel.isEmpty) {
                  methodLabel = 'Binance Pay (${_payIdCtrl.text.trim()})';
                }
              } else if (_type == 'paypal') {
                if (_paypalEmailCtrl.text.trim().isEmpty) return;
                details['email'] = _paypalEmailCtrl.text.trim();
                details['paypalEmail'] = _paypalEmailCtrl.text.trim();
                if (methodLabel.isEmpty) {
                  methodLabel = 'PayPal (${_paypalEmailCtrl.text.trim()})';
                }
              }

              widget.onAdd(_type, methodLabel, details);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF064E3B),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Guardar Cuenta de Cobro', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
