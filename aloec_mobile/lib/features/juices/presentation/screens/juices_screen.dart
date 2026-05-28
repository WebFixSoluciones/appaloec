import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../domain/juice_entity.dart';
import '../../../../core/constants/app_colors.dart';

class JuicesScreen extends StatelessWidget {
  const JuicesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final juices = JuiceEntity.mockJuices;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Jugos Naturales', style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              decoration: InputDecoration(
                hintText: 'Buscar jugo',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(15),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text('Popular', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.separated(
                itemCount: juices.length,
                separatorBuilder: (context, index) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  final juice = juices[index];
                  return Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [
                        BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 5))
                      ],
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      leading: Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(color: Colors.orange[50], borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.local_drink, color: Colors.orange), // Placeholder image
                      ),
                      title: Text(juice.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('Medio | ${juice.prepTimeMins} minutos | ${juice.calories}kCal', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      trailing: IconButton(
                        icon: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
                        onPressed: () => context.push('/juice-detail/${juice.id}'),
                      ),
                    ),
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }
}
