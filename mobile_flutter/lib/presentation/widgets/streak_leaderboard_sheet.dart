import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/finance_provider.dart';
import 'user_avatar.dart';

class LeaderboardEntry {
  final String userId;
  final String displayName;
  final String username;
  final String? profilePicture;
  final String subtitle;
  final int streakDays;
  final int xpPoints;
  final int financialLevel;
  final bool isCurrentUser;

  const LeaderboardEntry({
    required this.userId,
    required this.displayName,
    required this.username,
    this.profilePicture,
    required this.subtitle,
    required this.streakDays,
    required this.xpPoints,
    required this.financialLevel,
    this.isCurrentUser = false,
  });
}

class StreakLeaderboardSheet extends ConsumerStatefulWidget {
  const StreakLeaderboardSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const StreakLeaderboardSheet(),
    );
  }

  @override
  ConsumerState<StreakLeaderboardSheet> createState() =>
      _StreakLeaderboardSheetState();
}

class _StreakLeaderboardSheetState
    extends ConsumerState<StreakLeaderboardSheet> {
  bool _loading = true;
  List<LeaderboardEntry> _entries = const [];

  @override
  void initState() {
    super.initState();
    _loadLeaderboard();
  }

  Future<void> _loadLeaderboard() async {
    final auth = ref.read(authProvider);
    final finance = ref.read(financeProvider);
    final currentUser = auth.user;

    final myEntry = LeaderboardEntry(
      userId: currentUser?.id ?? 'me',
      displayName: currentUser?.displayName ?? 'Anda',
      username: currentUser?.effectiveUsername ?? 'pengguna',
      profilePicture: currentUser?.profilePicture ?? 'avatar2d:raka_tech',
      subtitle: [
        if ((currentUser?.occupation ?? '').trim().isNotEmpty)
          currentUser!.occupation!.trim(),
        if ((currentUser?.city ?? '').trim().isNotEmpty)
          currentUser!.city!.trim(),
      ].join(' - '),
      streakDays: finance.streakDays,
      xpPoints: finance.xpPoints,
      financialLevel: finance.financialLevel,
      isCurrentUser: true,
    );

    final list = <LeaderboardEntry>[];
    try {
      final remote =
          await ref.read(sadarApiServiceProvider).getStreakLeaderboard();
      for (final r in remote) {
        final uid = (r['userId'] ?? r['users_id'] ?? '').toString();
        final isMe = uid.isNotEmpty && uid == myEntry.userId;
        final occ = (r['occupation'] ?? '').toString().trim();
        final city = (r['city'] ?? '').toString().trim();
        list.add(
          LeaderboardEntry(
            userId: uid.isEmpty ? 'u_${list.length}' : uid,
            displayName: isMe
                ? myEntry.displayName
                : (r['displayName'] ?? r['firstName'] ?? 'Pengguna').toString(),
            username: isMe
                ? myEntry.username
                : (r['username'] ?? 'user').toString().replaceAll('@', ''),
            profilePicture: isMe
                ? myEntry.profilePicture
                : r['profilePicture']?.toString(),
            subtitle: isMe && myEntry.subtitle.isNotEmpty
                ? myEntry.subtitle
                : [if (occ.isNotEmpty) occ, if (city.isNotEmpty) city]
                    .join(' - '),
            streakDays: isMe
                ? (myEntry.streakDays > (int.tryParse('${r['streakDays'] ?? 0}') ?? 0)
                    ? myEntry.streakDays
                    : (int.tryParse('${r['streakDays'] ?? 0}') ?? 0))
                : (int.tryParse('${r['streakDays'] ?? 0}') ?? 0),
            xpPoints: isMe
                ? (myEntry.xpPoints > (int.tryParse('${r['xpPoints'] ?? 0}') ?? 0)
                    ? myEntry.xpPoints
                    : (int.tryParse('${r['xpPoints'] ?? 0}') ?? 0))
                : (int.tryParse('${r['xpPoints'] ?? 0}') ?? 0),
            financialLevel: isMe
                ? myEntry.financialLevel
                : (int.tryParse('${r['financialLevel'] ?? 1}') ?? 1),
            isCurrentUser: isMe,
          ),
        );
      }
    } catch (_) {}

    if (!list.any((e) => e.isCurrentUser)) {
      list.add(myEntry);
    }

    list.sort((a, b) {
      final cmp = b.streakDays.compareTo(a.streakDays);
      if (cmp != 0) return cmp;
      return b.xpPoints.compareTo(a.xpPoints);
    });

    if (mounted) {
      setState(() {
        _entries = list;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final textPrimary = AppColors.textPrimaryOf(context);
    final textSecondary = AppColors.textSecondaryOf(context);

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: BoxDecoration(
        color: AppColors.surfaceOf(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(26)),
        border: Border.all(color: AppColors.borderOf(context)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 10),
            Container(
              width: 42,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderOf(context),
                borderRadius: BorderRadius.circular(99),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 14, 12),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.primary, AppColors.accent],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.emoji_events_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Leaderboard Streak Finansial',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Peringkat konsistensi pencatatan harian pengguna SADAR',
                          style: TextStyle(
                            fontSize: 12,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(40),
                child: Center(child: CircularProgressIndicator()),
              )
            else
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
                  itemCount: _entries.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (ctx, idx) {
                    final item = _entries[idx];
                    final rank = idx + 1;
                    final rankColor = rank == 1
                        ? const Color(0xFFF59E0B)
                        : rank == 2
                            ? const Color(0xFF94A3B8)
                            : rank == 3
                                ? const Color(0xFFD97706)
                                : AppColors.textMutedOf(context);

                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: item.isCurrentUser
                            ? AppColors.accent.withValues(alpha: 0.12)
                            : AppColors.subtleOf(context),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: item.isCurrentUser
                              ? AppColors.accent
                              : AppColors.borderOf(context),
                          width: item.isCurrentUser ? 1.6 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 30,
                            height: 30,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: rank <= 3
                                  ? rankColor.withValues(alpha: 0.18)
                                  : AppColors.surfaceOf(context),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: rank <= 3
                                    ? rankColor
                                    : AppColors.borderOf(context),
                              ),
                            ),
                            child: Text(
                              '$rank',
                              style: TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w900,
                                color: rank <= 3 ? rankColor : textPrimary,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          UserAvatar(
                            profilePicture: item.profilePicture,
                            apiBaseUrl: auth.apiBaseUrl,
                            initials: item.displayName.isNotEmpty
                                ? item.displayName[0].toUpperCase()
                                : 'S',
                            radius: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        item.displayName,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 14,
                                          color: textPrimary,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      '@${item.username}',
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.accentOf(context),
                                      ),
                                    ),
                                    if (item.isCurrentUser) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.accent,
                                          borderRadius:
                                              BorderRadius.circular(6),
                                        ),
                                        child: const Text(
                                          'ANDA',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  item.subtitle.isNotEmpty
                                      ? 'Lv.${item.financialLevel} - ${item.subtitle} - ${item.xpPoints} XP'
                                      : 'Lv.${item.financialLevel} - ${item.xpPoints} XP',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    color: textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF97316)
                                  .withValues(alpha: 0.14),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.local_fire_department_rounded,
                                  size: 15,
                                  color: Color(0xFFF97316),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${item.streakDays} Hari',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFFF97316),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    context.push('/profile-account/edit');
                  },
                  icon: const Icon(Icons.alternate_email_rounded, size: 17),
                  label: const Text('Atur Username & Nama Panggilan'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
