import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/services/google_auth_helper.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/finance_provider.dart';
import '../../widgets/sadar_logo.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  int _passwordScore(String pw) {
    int s = 0;
    if (pw.length >= 8) s++;
    if (RegExp(r'[A-Z]').hasMatch(pw)) s++;
    if (RegExp(r'[a-z]').hasMatch(pw)) s++;
    if (RegExp(r'\d').hasMatch(pw)) s++;
    if (RegExp(r'[@$!%*?&#]').hasMatch(pw)) s++;
    return s;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await ref.read(authProvider.notifier).register(
          firstName: _firstNameCtrl.text,
          lastName: _lastNameCtrl.text,
          email: _emailCtrl.text,
          password: _passwordCtrl.text,
          phoneNumber: _phoneCtrl.text,
        );
    if (ok && mounted) {
      final user = ref.read(authProvider).user;
      ref.read(financeProvider.notifier).loadAll(userId: user?.id);
      context.go('/dashboard');
    }
  }

  Future<void> _signUpWithGoogle() async {
    final picked = await GoogleAuthHelper.pickGoogleAccount(context);
    if (picked == null || !mounted) return;
    final ok = await ref.read(authProvider.notifier).signInWithGoogle(
          googleId: picked.googleId,
          email: picked.email,
          displayName: picked.displayName,
          photoUrl: picked.photoUrl,
        );
    if (ok && mounted) {
      final user = ref.read(authProvider).user;
      ref.read(financeProvider.notifier).loadAll(userId: user?.id);
      context.go('/dashboard');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final isDark = AppColors.isDark(context);
    final pw = _passwordCtrl.text;
    final score = _passwordScore(pw);
    final strengthColor = score <= 2
        ? AppColors.danger
        : score <= 4
            ? AppColors.warning
            : AppColors.success;
    final strengthLabel = score == 0
        ? ''
        : score <= 2
            ? 'Lemah'
            : score <= 4
                ? 'Sedang'
                : 'Kuat';

    return Scaffold(
      backgroundColor: AppColors.bgOf(context),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Matching Hero Header with SADAR Logo
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0xFF0A1E36),
                    AppColors.brandNavy,
                    AppColors.primary,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(32),
                ),
              ),
              child: Stack(
                children: [
                  Positioned(
                    top: -35,
                    right: -30,
                    child: Container(
                      width: 150,
                      height: 150,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.accent.withValues(alpha: 0.16),
                      ),
                    ),
                  ),
                  SafeArea(
                    bottom: false,
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 10, 22, 42),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              IconButton(
                                onPressed: () => context.pop(),
                                style: IconButton.styleFrom(
                                  backgroundColor:
                                      Colors.white.withValues(alpha: 0.12),
                                ),
                                icon: const Icon(
                                  Icons.arrow_back_rounded,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 12),
                              const SadarLogo(
                                variant: SadarLogoVariant.light,
                                height: 22,
                                showFinanceSubtitle: true,
                                alignment: CrossAxisAlignment.center,
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 6),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Buat Akun Baru',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 25,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: -0.4,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Mulai atur budget 50/30/20, pindai struk otomatis, dan raih skor finansial sehat.',
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.8),
                                    fontSize: 13.5,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Elevated Form Card
            Transform.translate(
              offset: const Offset(0, -22),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceOf(context),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.borderOf(context)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black
                                .withValues(alpha: isDark ? 0.35 : 0.08),
                            blurRadius: 24,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (auth.error != null) ...[
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppColors.danger.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color:
                                        AppColors.danger.withValues(alpha: 0.35),
                                  ),
                                ),
                                child: Text(
                                  auth.error!,
                                  style: const TextStyle(
                                    color: AppColors.danger,
                                    fontSize: 12.5,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 14),
                            ],
                            Row(
                              children: [
                                Expanded(
                                  child: TextFormField(
                                    controller: _firstNameCtrl,
                                    textInputAction: TextInputAction.next,
                                    decoration: const InputDecoration(
                                      labelText: 'Nama Depan',
                                      prefixIcon:
                                          Icon(Icons.person_outline_rounded),
                                    ),
                                    validator: (v) =>
                                        (v == null || v.trim().length < 2)
                                            ? 'Min. 2 huruf'
                                            : null,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: TextFormField(
                                    controller: _lastNameCtrl,
                                    textInputAction: TextInputAction.next,
                                    decoration: const InputDecoration(
                                      labelText: 'Nama Belakang',
                                    ),
                                    validator: (v) =>
                                        (v == null || v.trim().length < 2)
                                            ? 'Min. 2 huruf'
                                            : null,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            TextFormField(
                              controller: _emailCtrl,
                              keyboardType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.next,
                              decoration: const InputDecoration(
                                labelText: 'Alamat Email',
                                hintText: 'nama@email.com',
                                prefixIcon: Icon(Icons.email_outlined),
                              ),
                              validator: (v) {
                                if (v == null || !v.contains('@')) {
                                  return 'Masukkan email yang valid';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 14),
                            TextFormField(
                              controller: _phoneCtrl,
                              keyboardType: TextInputType.phone,
                              textInputAction: TextInputAction.next,
                              decoration: const InputDecoration(
                                labelText: 'No. Handphone (Opsional)',
                                hintText: '+62812...',
                                prefixIcon: Icon(Icons.phone_outlined),
                              ),
                            ),
                            const SizedBox(height: 14),
                            TextFormField(
                              controller: _passwordCtrl,
                              obscureText: _obscure,
                              onChanged: (_) => setState(() {}),
                              decoration: InputDecoration(
                                labelText: 'Kata Sandi',
                                hintText: 'Minimal 8 karakter',
                                prefixIcon:
                                    const Icon(Icons.lock_outline_rounded),
                                suffixIcon: IconButton(
                                  onPressed: () =>
                                      setState(() => _obscure = !_obscure),
                                  icon: Icon(
                                    _obscure
                                        ? Icons.visibility_outlined
                                        : Icons.visibility_off_outlined,
                                  ),
                                ),
                              ),
                              validator: (v) {
                                if (v == null || v.length < 8) {
                                  return 'Minimal 8 karakter';
                                }
                                final pattern = RegExp(
                                  r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])',
                                );
                                if (!pattern.hasMatch(v)) {
                                  return 'Wajib ada huruf besar, kecil, angka & simbol';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 10),
                            // Live password strength bar + compact chips
                            if (pw.isNotEmpty) ...[
                              Row(
                                children: [
                                  Expanded(
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(99),
                                      child: LinearProgressIndicator(
                                        value: score / 5,
                                        minHeight: 6,
                                        backgroundColor:
                                            AppColors.borderOf(context),
                                        valueColor: AlwaysStoppedAnimation(
                                          strengthColor,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    strengthLabel,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: strengthColor,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                            ],
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: [
                                _RulePill('8+ Karakter', pw.length >= 8),
                                _RulePill(
                                  'Huruf Besar',
                                  RegExp(r'[A-Z]').hasMatch(pw),
                                ),
                                _RulePill(
                                  'Angka',
                                  RegExp(r'\d').hasMatch(pw),
                                ),
                                _RulePill(
                                  'Simbol (@\$!#)',
                                  RegExp(r'[@$!%*?&#]').hasMatch(pw),
                                ),
                              ],
                            ),
                            const SizedBox(height: 22),
                            Container(
                              height: 52,
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [AppColors.primary, AppColors.accent],
                                  begin: Alignment.centerLeft,
                                  end: Alignment.centerRight,
                                ),
                                borderRadius: BorderRadius.circular(14),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary
                                        .withValues(alpha: 0.28),
                                    blurRadius: 12,
                                    offset: const Offset(0, 5),
                                  ),
                                ],
                              ),
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                onPressed: auth.isLoading ? null : _submit,
                                child: auth.isLoading
                                    ? const SizedBox(
                                        width: 22,
                                        height: 22,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2.2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Text('Daftar Sekarang'),
                              ),
                            ),
                            const SizedBox(height: 14),
                            SizedBox(
                              height: 46,
                              child: OutlinedButton.icon(
                                onPressed:
                                    auth.isLoading ? null : _signUpWithGoogle,
                                icon: Container(
                                  width: 20,
                                  height: 20,
                                  alignment: Alignment.center,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF4285F4),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Text(
                                    'G',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ),
                                label: const Text(
                                  'Daftar Cepat dengan Google',
                                  style: TextStyle(fontWeight: FontWeight.w700),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Sudah punya akun?',
                          style: TextStyle(
                            color: AppColors.textSecondaryOf(context),
                            fontSize: 13.5,
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.pop(),
                          child: const Text(
                            'Masuk di sini',
                            style: TextStyle(fontWeight: FontWeight.w800),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RulePill extends StatelessWidget {
  final String label;
  final bool ok;

  const _RulePill(this.label, this.ok);

  @override
  Widget build(BuildContext context) {
    final color = ok ? AppColors.success : AppColors.textMutedOf(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: ok
            ? AppColors.success.withValues(alpha: 0.12)
            : AppColors.subtleOf(context),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: ok
              ? AppColors.success.withValues(alpha: 0.35)
              : AppColors.borderOf(context),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            ok ? Icons.check_circle_rounded : Icons.circle_outlined,
            size: 12,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
