import '../profile_entity.dart';

abstract class ProfileRepository {
  Future<ProfileEntity?> getProfile(String uid);
  Future<void> updateProfile(ProfileEntity profile);
  Future<void> updateProfilePhoto(String uid, String filePath);
}
