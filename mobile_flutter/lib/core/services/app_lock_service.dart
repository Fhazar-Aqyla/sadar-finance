import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';

class AppLockService {
  final LocalAuthentication _auth = LocalAuthentication();

  Future<bool> isSupported() async {
    try {
      final supported = await _auth.isDeviceSupported();
      final canCheck = await _auth.canCheckBiometrics;
      return supported || canCheck;
    } catch (_) {
      return false;
    }
  }

  Future<bool> authenticate({
    String reason = 'Verifikasi identitas Anda untuk membuka SADAR Finance',
  }) async {
    try {
      final supported = await isSupported();
      if (!supported) return true;
      return await _auth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
          useErrorDialogs: true,
        ),
      );
    } on PlatformException {
      return false;
    } catch (_) {
      return false;
    }
  }
}
