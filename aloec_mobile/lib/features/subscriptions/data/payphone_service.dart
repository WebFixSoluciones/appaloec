import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class PayphoneTransactionResult {
  final int? transactionId;
  final String? errorMessage;
  final bool success;

  PayphoneTransactionResult({
    this.transactionId,
    this.errorMessage,
    required this.success,
  });
}

class PayphoneStatusResult {
  final int statusCode;
  final String transactionStatus;
  final String? authorizationCode;
  final String? cardBrand;
  final String? lastDigits;
  final String? email;
  final String? phoneNumber;
  final int amount;
  final String? clientTransactionId;
  final String? errorMessage;

  PayphoneStatusResult({
    required this.statusCode,
    required this.transactionStatus,
    this.authorizationCode,
    this.cardBrand,
    this.lastDigits,
    this.email,
    this.phoneNumber,
    required this.amount,
    this.clientTransactionId,
    this.errorMessage,
  });

  bool get isApproved => statusCode == 3;
  bool get isCanceled => statusCode == 2;
  bool get isPending => statusCode == 1;

  factory PayphoneStatusResult.fromPayphoneJson(Map<String, dynamic> json) {
    return PayphoneStatusResult(
      statusCode: json['statusCode'] ?? 0,
      transactionStatus: json['transactionStatus'] ?? '',
      authorizationCode: json['authorizationCode'],
      cardBrand: json['cardBrand'],
      lastDigits: json['lastDigits'],
      email: json['email'],
      phoneNumber: json['phoneNumber'],
      amount: json['amount'] ?? 0,
      clientTransactionId: json['clientTransactionId'],
      errorMessage: json['message'],
    );
  }
}

class PayphoneService {
  static const String _prodBaseUrl =
      'https://pay.payphonetodoesposible.com/api';
  static const String _sandboxBaseUrl =
      'https://pay.payphonetodoesposible.com/api';

  static const Duration _timeout = Duration(seconds: 15);

  final String _token;
  final String _storeId;
  final bool _isSandbox;

  PayphoneService({
    required String token,
    required String storeId,
    bool isSandbox = false,
  })  : _token = token,
        _storeId = storeId,
        _isSandbox = isSandbox;

  String get _baseUrl => _isSandbox ? _sandboxBaseUrl : _prodBaseUrl;

  Map<String, String> get _headers => {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
      };

  String _cleanPhone(String phone) {
    return phone.replaceAll(RegExp(r'[^0-9]'), '');
  }

  /// Crea una transaccion de venta en Payphone.
  /// [amountCents] es el monto total en centavos (ej: $9.99 = 999).
  Future<PayphoneTransactionResult> createSale({
    required String phoneNumber,
    required int amountCents,
    required String clientTransactionId,
    required String reference,
    String countryCode = '593',
  }) async {
    try {
      final cleanPhone = _cleanPhone(phoneNumber);

      final body = <String, dynamic>{
        'phoneNumber': cleanPhone,
        'countryCode': countryCode,
        'amount': amountCents,
        'amountWithoutTax': amountCents,
        'amountWithTax': 0,
        'tax': 0,
        'service': 0,
        'tip': 0,
        'clientTransactionId': clientTransactionId,
        'reference': reference,
        'storeId': _storeId,
        'currency': 'USD',
        'timeZone': -5,
      };

      final response = await http
          .post(
            Uri.parse('$_baseUrl/Sale'),
            headers: _headers,
            body: jsonEncode(body),
          )
          .timeout(_timeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final txId = data['transactionId'] as int?;
        if (txId != null) {
          return PayphoneTransactionResult(success: true, transactionId: txId);
        }
        return PayphoneTransactionResult(
          success: false,
          errorMessage: _parseError(data, 'Respuesta invalida de Payphone'),
        );
      }

      String errorMsg;
      try {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        errorMsg = _parseError(data, 'Error HTTP ${response.statusCode}');
      } catch (_) {
        errorMsg = 'Error del servidor (${response.statusCode})';
      }

      return PayphoneTransactionResult(success: false, errorMessage: errorMsg);
    } on http.ClientException catch (e) {
      return PayphoneTransactionResult(
        success: false,
        errorMessage: 'Error de conexion: ${e.message}',
      );
    } on TimeoutException {
      return PayphoneTransactionResult(
        success: false,
        errorMessage: 'Tiempo de espera agotado. Intenta nuevamente.',
      );
    } catch (e) {
      return PayphoneTransactionResult(
        success: false,
        errorMessage: 'Error inesperado: $e',
      );
    }
  }

  /// Consulta el estado de una transaccion por su ID.
  Future<PayphoneStatusResult?> checkTransactionStatus(
      int transactionId) async {
    try {
      final response = await http
          .get(
            Uri.parse('$_baseUrl/Sale/$transactionId'),
            headers: _headers,
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        return PayphoneStatusResult.fromPayphoneJson(data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  String _parseError(Map<String, dynamic> data, String fallback) {
    if (data['message'] is String && (data['message'] as String).isNotEmpty) {
      return data['message'];
    }
    if (data['error'] is String && (data['error'] as String).isNotEmpty) {
      return data['error'];
    }
    if (data['errors'] is Map) {
      final errors = data['errors'] as Map;
      final msgs = errors.values.whereType<String>().toList();
      if (msgs.isNotEmpty) return msgs.join('. ');
    }
    return fallback;
  }
}
