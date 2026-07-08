import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
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
  static const Duration _timeout = Duration(seconds: 30);

  final String _token;
  final String _storeId;
  final String _baseUrl;

  PayphoneService({
    required String token,
    required String storeId,
    bool isSandbox = false,
  })  : _token = token,
        _storeId = storeId,
        _baseUrl = 'https://pay.payphonetodoesposible.com/api';

  Map<String, String> get _headers => {
        'Authorization': 'Bearer $_token',
        'Content-Type': 'application/json',
      };

  String _cleanNumber(String input) {
    return input.replaceAll(RegExp(r'[^0-9]'), '');
  }

  Future<PayphoneTransactionResult> createPaymentLink({
    required int amountCents,
    required String clientTransactionId,
    required String email,
    required String reference,
    String? phoneNumber,
  }) async {
    try {
      final body = <String, dynamic>{
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
        'email': email.isNotEmpty ? email : 'cliente@aloec.com',
        if (phoneNumber != null && phoneNumber.isNotEmpty)
          'phoneNumber': _cleanNumber(phoneNumber),
      };

      final response = await http
          .post(
            Uri.parse('$_baseUrl/links'),
            headers: _headers,
            body: jsonEncode(body),
          )
          .timeout(_timeout);

      debugPrint('PayPhone /links status: ${response.statusCode}');
      debugPrint('PayPhone /links body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final decoded = jsonDecode(response.body);
        if (decoded is String) {
          debugPrint('PayPhone /links returned link URL directly: $decoded');
          return PayphoneTransactionResult(
            success: true,
            transactionId: 0,
          )..paymentUrl = decoded;
        } else if (decoded is Map<String, dynamic>) {
          debugPrint('PayPhone /links parsed map: paymentId=${decoded['paymentId']}, payWithPayPhone=${decoded['payWithPayPhone']}, payUrl=${decoded['payUrl']}');
          final paymentId = (decoded['paymentId'] ?? decoded['id'] ?? decoded['transactionId']) as int?;
          final payUrl = (decoded['payWithPayPhone'] ?? decoded['payUrl'] ?? decoded['url'] ?? decoded['paymentUrl']) as String?;

          if (payUrl != null) {
            return PayphoneTransactionResult(
              success: true,
              transactionId: paymentId ?? 0,
            )..paymentUrl = payUrl;
          }
        }

        return PayphoneTransactionResult(
          success: false,
          errorMessage: 'Respuesta incompleta de Payphone',
        );
      }

      String errorMsg;
      try {
        final data = jsonDecode(response.body);
        if (data is Map<String, dynamic>) {
          errorMsg = _parseError(data, 'Error HTTP ${response.statusCode}');
        } else {
          errorMsg = 'Error HTTP ${response.statusCode}';
        }
      } catch (_) {
        errorMsg = 'Error al conectar con el servidor de pago. Intenta nuevamente.';
      }

      return PayphoneTransactionResult(success: false, errorMessage: errorMsg);
    } on http.ClientException catch (e) {
      debugPrint('PayPhone link creation error: ${e.message} | URL: $_baseUrl');
      return PayphoneTransactionResult(
        success: false,
        errorMessage: 'Error de conexion. Verifica tu acceso a internet.',
      );
    } on TimeoutException {
      debugPrint('PayPhone link creation timeout');
      return PayphoneTransactionResult(
        success: false,
        errorMessage: 'Tiempo de espera agotado. Intenta nuevamente.',
      );
    } catch (e) {
      debugPrint('PayPhone link creation unexpected: $e');
      return PayphoneTransactionResult(
        success: false,
        errorMessage: 'Error al procesar el pago. Intenta nuevamente.',
      );
    }
  }

  Future<PayphoneStatusResult?> checkPaymentStatus(int paymentId) async {
    try {
      final response = await http
          .get(
            Uri.parse('$_baseUrl/Pay/$paymentId'),
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

  Future<PayphoneTransactionResult> createCardSale({
    required String cardNumber,
    required int expMonth,
    required int expYear,
    required String cvc,
    required String holderName,
    required int amountCents,
    required String clientTransactionId,
    required String reference,
  }) async {
    try {
      final cleanCard = _cleanNumber(cardNumber);

      final body = <String, dynamic>{
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
        'card': {
          'number': cleanCard,
          'expMonth': expMonth,
          'expYear': expYear,
          'cvc': cvc,
          'holderName': holderName,
        },
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
        errorMsg = 'Error al conectar con el servidor de pago.';
      }

      return PayphoneTransactionResult(success: false, errorMessage: errorMsg);
    } on http.ClientException catch (e) {
      return PayphoneTransactionResult(
        success: false,
        errorMessage: 'Error de conexion. Verifica tu acceso a internet.',
      );
    } on TimeoutException {
      return PayphoneTransactionResult(
        success: false,
        errorMessage: 'Tiempo de espera agotado. Intenta nuevamente.',
      );
    } catch (e) {
      return PayphoneTransactionResult(
        success: false,
        errorMessage: 'Error al procesar la tarjeta. Intenta nuevamente.',
      );
    }
  }

  Future<PayphoneStatusResult?> checkTransactionStatus(int transactionId) async {
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

final _payphoneExpando = Expando<String>();

extension PayphoneTransactionResultExt on PayphoneTransactionResult {
  String? get paymentUrl => _payphoneExpando[this];
  set paymentUrl(String? value) => _payphoneExpando[this] = value;
}

