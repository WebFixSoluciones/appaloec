import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/services.dart';

class ReferralService {
  static final RegExp _codePattern = RegExp(r'^ALOE-[A-Z0-9]{4,20}$');

  static bool isValidCode(String? code) {
    if (code == null || code.isEmpty) return false;
    return _codePattern.hasMatch(code.trim().toUpperCase());
  }

  static String? sanitizeCode(String? raw) {
    if (raw == null) return null;
    final cleaned = raw.trim().toUpperCase();
    return _codePattern.hasMatch(cleaned) ? cleaned : null;
  }

  static Future<String?> detectClipboardReferralCode() async {
    try {
      final data = await Clipboard.getData(Clipboard.kTextPlain);
      final text = data?.text;
      if (text == null || text.isEmpty) return null;

      final match = RegExp(r'ALOE-[A-Z0-9]{4,20}').firstMatch(text.toUpperCase());
      if (match != null) {
        final code = match.group(0);
        if (code != null && _codePattern.hasMatch(code)) {
          return code;
        }
      }
    } catch (_) {}
    return null;
  }

  static Future<void> clearClipboard() async {
    try {
      await Clipboard.setData(const ClipboardData(text: ''));
    } catch (_) {}
  }

  static Future<Map<String, dynamic>?> lookupReferrer(String code) async {
    final doc = await FirebaseFirestore.instance
        .collection('referral_codes')
        .doc(code.toUpperCase())
        .get();
    if (!doc.exists) return null;
    return doc.data();
  }

  static Future<void> saveReferralOnRegistration({
    required String userUid,
    required String referredByCode,
  }) async {
    final lookup = await lookupReferrer(referredByCode);
    final referredByUid = lookup?['uid'] as String?;

    await FirebaseFirestore.instance.collection('users').doc(userUid).update({
      'referral.referredByCode': referredByCode,
      'referral.referredByUid': referredByUid,
      'referral.status': 'referred',
      'referral.registeredAt': FieldValue.serverTimestamp(),
    });

    await FirebaseFirestore.instance.collection('referral_events').add({
      'type': 'registered',
      'referrerUid': referredByUid,
      'referredUid': userUid,
      'referralCode': referredByCode,
      'metadata': {},
      'ipAddress': null,
      'userAgent': null,
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  static Future<String> generateReferralCode(String uid) async {
    final userDoc = await FirebaseFirestore.instance.collection('users').doc(uid).get();
    final existingCode = userDoc.data()?['referral']?['code'] as String?;
    if (existingCode != null && existingCode.isNotEmpty) return existingCode;

    final displayName = userDoc.data()?['displayName'] as String? ?? '';
    final baseName = displayName.replaceAll(RegExp(r'[^A-Za-z]'), '').toUpperCase();
    final prefix = baseName.length >= 4 ? baseName.substring(0, 4) : 'ALOE';
    final suffix = uid.substring(0, 6).toUpperCase();

    final code = 'ALOE-$prefix$suffix';

    final writeBatch = FirebaseFirestore.instance.batch();

    writeBatch.update(FirebaseFirestore.instance.collection('users').doc(uid), {
      'referral.code': code,
      'referral.codeCreatedAt': FieldValue.serverTimestamp(),
    });

    writeBatch.set(
      FirebaseFirestore.instance.collection('referral_codes').doc(code),
      {
        'uid': uid,
        'displayName': displayName,
        'createdAt': FieldValue.serverTimestamp(),
        'active': true,
      },
    );

    await writeBatch.commit();
    return code;
  }
}
