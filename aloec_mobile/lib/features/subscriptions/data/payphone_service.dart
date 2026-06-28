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
  final int statusCode; // 1=Pendiente, 2=Cancelado, 3=Aprobado
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

  factory PayphoneStatusResult.fromJson(Map<String, dynamic> json) {
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
    );
  }
}

class PayphoneService {
  static const String _baseUrl = 'https://pay.payphonetodoesposible.com/api';

  final String _token;
  final String _storeId;

  PayphoneService({required String token, required String storeId})
      : _token = token,
        _storeId = storeId;

  Map<String, String> get _headers => {
        'Authorization': 'bearer $_token',
        'Content-Type': 'application/json',
      };

  /// Crea una transacción de venta en Payphone.
  /// [amountCents] es el monto total en centavos (ej: $9.99 = 999)
  Future<PayphoneTransactionResult> createSale({
    required String phoneNumber,
    required int amountCents,
    required String clientTransactionId,
    required String reference,
    String countryCode = '593',
  }) async {
    try {
      final body = {
        'phoneNumber': phoneNumber,
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

      final response = await http.post(
        Uri.parse('$_baseUrl/Sale'),
        headers: _headers,
        body: jsonEncode(body),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return PayphoneTransactionResult(
          success: true,
          transactionId: data['transactionId'],
        );
      } else {
        final data = jsonDecode(response.body);
        return PayphoneTransactionResult(
          success: false,
          errorMessage: data['message'] ?? 'Error al crear la transacción',
        );
      }
    } catch (e) {
      return PayphoneTransactionResult(
        success: false,
        errorMessage: 'Error de conexión: $e',
      );
    }
  }

  /// Consulta el estado de una transacción por su ID.
  Future<PayphoneStatusResult?> checkTransactionStatus(int transactionId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/Sale/$transactionId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return PayphoneStatusResult.fromJson(data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
