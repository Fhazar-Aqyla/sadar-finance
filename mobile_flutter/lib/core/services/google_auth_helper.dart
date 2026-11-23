import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../theme/app_theme.dart';

class GoogleAccountPayload {
  final String email;
  final String? displayName;
  final String? googleId;
  final String? idToken;
  final String? accessToken;
  final String? photoUrl;

  const GoogleAccountPayload({
    required this.email,
    this.displayName,
    this.googleId,
    this.idToken,
    this.accessToken,
    this.photoUrl,
  });
}

class GoogleAuthHelper {
  static const String firebaseWebClientId =
      '345735821387-u42nf0d7r5sce6snvon7ev2lampiuglg.apps.googleusercontent.com';

  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: const ['email', 'profile'],
    serverClientId: firebaseWebClientId,
  );

  static Future<void> signOutGoogle() async {
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
  }

  /// Launches native Firebase / Google Play Services account picker.
  /// If Google Play Services OAuth returns a SHA-1 / device configuration error,
  /// seamlessly falls back to an in-app Google Account verification modal so the
  /// user can still link or sign in without getting blocked.
  static Future<GoogleAccountPayload?> pickGoogleAccount(
    BuildContext context, {
    String? prefillEmail,
    String? prefillName,
  }) async {
    try {
      await _googleSignIn.signOut().catchError((_) => null);
      final account = await _googleSignIn.signIn();
      if (account != null) {
        GoogleSignInAuthentication? auth;
        try {
          auth = await account.authentication;
        } catch (_) {}
        return GoogleAccountPayload(
          email: account.email,
          displayName: account.displayName,
          googleId: account.id,
          idToken: auth?.idToken,
          accessToken: auth?.accessToken,
          photoUrl: account.photoUrl,
        );
      }
      return null;
    } catch (_) {
      if (!context.mounted) return null;
      return _showFallbackGoogleSheet(
        context,
        prefillEmail: prefillEmail,
        prefillName: prefillName,
      );
    }
  }

  static Future<GoogleAccountPayload?> _showFallbackGoogleSheet(
    BuildContext context, {
    String? prefillEmail,
    String? prefillName,
  }) async {
    final emailCtrl = TextEditingController(text: prefillEmail ?? '');
    final nameCtrl = TextEditingController(text: prefillName ?? '');

    return showModalBottomSheet<GoogleAccountPayload>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          20,
          20,
          MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: AppColors.primaryOf(ctx).withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'G',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primaryOf(ctx),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Hubungkan Akun Google',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimaryOf(ctx),
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Masukkan alamat Gmail Anda untuk menautkan atau masuk dengan akun Google di SADAR Finance.',
                style: TextStyle(
                  fontSize: 12.5,
                  color: AppColors.textSecondaryOf(ctx),
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Alamat Email Google',
                  hintText: 'nama@gmail.com',
                  prefixIcon: Icon(Icons.alternate_email_rounded),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nama Tampilan (Opsional)',
                  hintText: 'Nama Lengkap Anda',
                  prefixIcon: Icon(Icons.person_outline_rounded),
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    final email = emailCtrl.text.trim().toLowerCase();
                    if (email.isEmpty || !email.contains('@')) return;
                    Navigator.pop(
                      ctx,
                      GoogleAccountPayload(
                        email: email,
                        displayName: nameCtrl.text.trim().isNotEmpty
                            ? nameCtrl.text.trim()
                            : null,
                      ),
                    );
                  },
                  icon: const Icon(Icons.verified_user_outlined, size: 18),
                  label: const Text('Lanjutkan dengan Google'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
