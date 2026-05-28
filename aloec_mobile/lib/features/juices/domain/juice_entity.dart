class JuiceEntity {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final int calories;
  final int prepTimeMins;

  JuiceEntity({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.calories,
    required this.prepTimeMins,
  });

  // Mock data for initial development
  static List<JuiceEntity> mockJuices = [
    JuiceEntity(
      id: '1',
      name: 'Jugo de remolacha',
      description: 'Jugo nutritivo con remolacha y antioxidantes.',
      imageUrl: 'assets/images/beet_juice.png',
      calories: 230,
      prepTimeMins: 30,
    ),
    JuiceEntity(
      id: '2',
      name: 'Zumo de naranja',
      description: 'El clásico zumo de naranja para empezar el día.',
      imageUrl: 'assets/images/orange_juice.png',
      calories: 180,
      prepTimeMins: 15,
    ),
  ];
}
