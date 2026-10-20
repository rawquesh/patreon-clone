import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:html_unescape/html_unescape.dart';
import 'package:patreon_clone/styles/styles.dart';
import 'package:patreon_clone/models/creator/creator_model.dart';
import 'package:patreon_clone/models/membership/membership_model.dart';
import 'package:patreon_clone/models/social_link/social_links.dart';
import 'package:patreon_clone/models/subscription/subscription_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon_clone/backend/creator/my_creator_controller.dart';
import 'package:patreon_clone/backend/creator/my_creator_provider.dart';
import 'package:patreon_clone/backend/collections/collection_controller.dart';
import 'package:patreon_clone/backend/collections/collection_provider.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:patreon_clone/pages/user/creator/component/sliver_tab_bar_delegate.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

import 'package:patreon_clone/backend/creator_section/my_creator_page_controller.dart';
import 'package:patreon_clone/pages/creator/main/components/collection_card.dart';
import 'package:patreon_clone/pages/user/memberships/components/subscription_details_widget.dart';
import 'package:patreon_clone/pages/user/creator/component/creator_post_section_widget.dart';
import 'package:patreon_clone/pages/user/creator/component/creator_profile_details_widget.dart';
import 'package:patreon_clone/pages/user/creator/component/membership_section_widget.dart';

class CreatorProfilePage extends StatefulWidget {
  final CreatorModel? creatorModel;
  final String creatorUsername;

  const CreatorProfilePage({
    super.key,
    this.creatorModel,
    required this.creatorUsername,
  });

  @override
  State<CreatorProfilePage> createState() => _CreatorProfilePageState();
}

class _CreatorProfilePageState extends State<CreatorProfilePage> with TickerProviderStateMixin, MySafeState {
  late TabController _tabController;
  late ScrollController _scrollController;
  late AnimationController _searchAnimationController;

  bool _isSearchActive = false;
  String _searchQuery = '';
  final FocusNode _searchFocusNode = FocusNode();
  final TextEditingController _searchController = TextEditingController();

  Timer? _debounce;

  String _selectedPostType = 'All';
  String _selectedTier = 'All';
  String _selectedDateFilter = 'All Time';

  late MyCreatorProvider myCreatorProvider;
  late MyCreatorController myCreatorController;
  List<MembershipModel> memberships = [];
  late CollectionProvider _collectionProvider;
  late CollectionController _collectionController;

  final List<String> _postTypes = ['All', 'Video', 'Audio', 'Text', 'Image'];
  // ADD this list for the tier dropdown to match web functionality
  final List<String> _tiers = ['All', 'Free', 'Paid'];
  // UPDATE this list to match the values the backend expects for 'dateRange'
  final List<String> _dateFilters = ['All Time', 'Most Recent', 'This Week', 'This Month', 'This Year'];

  late MyCreatorPageController myCreatorPageController;
  String introVideoUrl = '';
  String bio = '';
  List<SocialLinkModel> socialLinks = [];
  YoutubePlayerController? _youtubeController;
  bool _isVideoUrlValid = false;
  bool _isAboutLoading = true;

  String? get _creatorId => widget.creatorModel?.id ?? myCreatorProvider.creatorModel.get()?.id;

  @override
  void initState() {
    super.initState();
    myCreatorProvider = context.read<MyCreatorProvider>();
    myCreatorController = MyCreatorController(
      myCreatorProvider: myCreatorProvider,
    );
    _collectionProvider = context.read<CollectionProvider>();
    _collectionController = CollectionController(provider: _collectionProvider);

    myCreatorPageController = MyCreatorPageController();

    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);

    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        mySetState();
      }
    });

    _searchAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _searchController.addListener(_onSearchInputChanged);

    _loadAllInitialData();
  }

  Future<void> _loadAllInitialData() async {
    if (widget.creatorModel != null) {
      myCreatorController.getCreator(userName: widget.creatorUsername);
      _fetchAllSubData();
    } else {
      MyPrint.printOnConsole("myusername: ${widget.creatorUsername}");
      await myCreatorController.getCreator(userName: widget.creatorUsername);
      if (!mounted) return;
      _fetchAllSubData();
    }
  }

  Future<void> _fetchAllSubData() async {
    if (_creatorId == null) {
      MyPrint.printOnConsole("Error: Creator ID is null. Cannot fetch sub-data.", tag: "CreatorProfileInit");
      return;
    }

    MyPrint.printOnConsole("Fetching sub-data for creator: $_creatorId.", tag: "CreatorProfileInit");

    if (myCreatorProvider.postsCacheCreatorId.get() != _creatorId) {
      myCreatorProvider.clearAllCreatorData(isNotify: false);
    }

    await Future.wait([
      _fetchMemberships(isRefresh: true),
      _loadInitialPosts(isRefresh: true),
      getData(isNotify: true),
      myCreatorController.getUserSubscribedMembershipsPaginatedList(isRefresh: true),
      _fetchAboutData(),
    ]);
  }

  Future<void> _loadInitialPosts({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    final model = myCreatorProvider.postsListPaginationModel.get();
    if (isRefresh || model.contentsLength == 0) {
      await _refreshData(
        isRefresh: isRefresh,
        isFromCache: isFromCache,
        isNotify: isNotify,
      );
    } else if (isFromCache) {
      await _refreshData(isRefresh: false, isFromCache: true, isNotify: isNotify);
    }
  }

  Future<void> _fetchMemberships({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    if (_creatorId == null) return;
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole("_fetchMemberships() started", tag: tag);

    if (!isRefresh &&
        isFromCache &&
        myCreatorProvider.membershipsCacheCreatorId.get() == _creatorId &&
        myCreatorProvider.creatorMemberships.getList().isNotEmpty) {
      memberships = myCreatorProvider.creatorMemberships.getList();
      mySetState();
      MyPrint.printOnConsole('Loaded memberships from cache', tag: tag);
      return;
    }

    if (isRefresh) {
      memberships = [];
      mySetState();
      MyPrint.printOnConsole("Cleared memberships list", tag: tag);
    }

    try {
      MyPrint.printOnConsole("Calling getCreatorMemberships for creatorId: $_creatorId", tag: tag);

      await myCreatorController.getCreatorMemberships(
        creatorId: _creatorId!,
        isRefresh: isRefresh,
        isFromCache: isFromCache,
        isNotify: isNotify,
      );

      if (mounted) {
        final fetchedMemberships = myCreatorProvider.creatorMemberships.getList();
        MyPrint.printOnConsole("Fetched ${fetchedMemberships.length} memberships from provider", tag: tag);
        memberships = fetchedMemberships;
        mySetState();
      }
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in _fetchMemberships: $e", tag: tag);
      memberships = [];
      mySetState();
    }
  }

  Future<void> getData({bool isNotify = true}) async {
    if (_creatorId == null) return;
    await _collectionController.getCreatorCollections(
      creatorId: _creatorId!,
      isNotify: isNotify,
    );
  }

  Future<void> _fetchAboutData() async {
    if (!mounted) return;
    setState(() => _isAboutLoading = true);
    final about = await myCreatorPageController.fetchCreatorAbout(widget.creatorUsername);
    if (mounted && about != null) {
      introVideoUrl = about.introVideoUrl;
      bio = about.bio;
      socialLinks = about.socialLinks;
      _initializeVideoPlayer();
    }
    if (mounted) {
      setState(() => _isAboutLoading = false);
    }
  }

  void _initializeVideoPlayer() {
    _youtubeController?.dispose();
    _youtubeController = null;
    _isVideoUrlValid = false;

    if (introVideoUrl.isNotEmpty) {
      final videoId = YoutubePlayer.convertUrlToId(introVideoUrl);
      if (videoId != null) {
        _youtubeController = YoutubePlayerController(
          initialVideoId: videoId,
          flags: const YoutubePlayerFlags(
            autoPlay: false,
            mute: false,
            enableCaption: true,
            captionLanguage: 'en',
          ),
        );
        _isVideoUrlValid = true;
      }
    }
  }

  void _onSearchInputChanged() {
    if (_searchController.text != _searchQuery) {
      _searchQuery = _searchController.text;
      mySetState();
    }

    if (_isSearchActive) {
      if (_debounce?.isActive ?? false) _debounce!.cancel();
      _debounce = Timer(const Duration(milliseconds: 750), () {
        if (!mounted) return;
        _refreshData(isRefresh: true, isFromCache: false, isNotify: true);
      });
    }
  }

  Future<void> _refreshData({
    String? searchQuery,
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    if (_creatorId == null) return;
    final String queryToUse = searchQuery ?? _searchQuery;

    final List<Future<void>> futures = [];

    futures.add(myCreatorController.getCreatorPostsPaginatedList(
      creatorId: _creatorId!,
      searchQuery: queryToUse,
      postType: _selectedPostType,
      tier: _selectedTier,
      datePublished: _selectedDateFilter,
      isRefresh: isRefresh,
      isNotify: isNotify,
      isFromCache: isFromCache,
    ));

    if (isRefresh) {
      futures.add(_fetchMemberships(isRefresh: true, isNotify: true));
      futures.add(myCreatorController.getUserSubscribedMembershipsPaginatedList(
        isRefresh: true,
        isFromCache: false,
        isNotify: true,
      ));
      futures.add(_fetchAboutData());
    }
    await Future.wait(futures);
  }

  Future<void> _loadMoreData() async {
    if (_creatorId == null) return;
    final model = myCreatorProvider.postsListPaginationModel.get();
    if (!model.isContentsLoading.get() && model.hasMoreContents.get()) {
      await myCreatorController.getCreatorPostsPaginatedList(
        creatorId: _creatorId!,
        searchQuery: _searchQuery,
        postType: _selectedPostType,
        tier: _selectedTier,
        datePublished: _selectedDateFilter,
        isRefresh: false,
        isNotify: true,
      );
    }
  }

  void _activateSearch() {
    if (!_isSearchActive) {
      setState(() => _isSearchActive = true);
      _searchAnimationController.forward();
      _searchFocusNode.requestFocus();

      if (_searchQuery.isEmpty) {
        _refreshData(isRefresh: true);
      }
    }
  }

  void _deactivateSearch() {
    if (_isSearchActive) {
      if (_debounce?.isActive ?? false) _debounce!.cancel();
      _isSearchActive = false;
      _searchQuery = '';
      mySetState();
      _searchController.clear();
      _searchAnimationController.reverse();
      _searchFocusNode.unfocus();
      _refreshData(isRefresh: false, isFromCache: true, isNotify: true);
    }
  }

  @override
  void dispose() {
    myCreatorProvider.clearAllCreatorData(isNotify: false);
    _debounce?.cancel();
    _tabController.dispose();
    _scrollController.dispose();
    _searchAnimationController.dispose();
    _searchFocusNode.dispose();
    _searchController.removeListener(_onSearchInputChanged);
    _searchController.dispose();
    _scrollController.removeListener(_onScroll);
    _youtubeController?.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 300.0 &&
        !myCreatorProvider.postsListPaginationModel.get().isContentsLoading.get() &&
        myCreatorProvider.postsListPaginationModel.get().hasMoreContents.get()) {
      _loadMoreData();
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      body: Consumer<MyCreatorProvider>(
        builder: (context, provider, child) {
          final creatorModel = (provider.creatorModel.get() ?? widget.creatorModel);

          MyPrint.printOnConsole("Building CreatorProfilePage for creator: ${creatorModel?.toMap().toString() ?? 'null'}");

          if (creatorModel == null) {
            return const Center(child: LoadingWidget());
          }

          return _isSearchActive ? _buildSearchView(themeData, creatorModel) : _buildProfileView(themeData, creatorModel);
        },
      ),
    );
  }

  Widget _buildProfileView(ThemeData themeData, CreatorModel creatorModel) {
    return RefreshIndicator(
      onRefresh: () => _refreshData(isRefresh: true),
      child: DefaultTabController(
        length: 3,
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            CreatorProfileDetailsWidget(
              creatorModel: creatorModel,
              scrollController: _scrollController,
            ),
            SliverPersistentHeader(
              pinned: true,
              delegate: SliverTabBarDelegate(
                TabBar(
                  controller: _tabController,
                  labelColor: themeData.primaryColor,
                  unselectedLabelColor: Colors.grey,
                  indicatorColor: themeData.primaryColor,
                  indicatorWeight: 1,
                  dividerColor: Colors.transparent,
                  labelStyle: const TextStyle(fontWeight: FontWeight.w600),
                  tabs: const [
                    Tab(text: 'Home'),
                    Tab(text: 'Collection'),
                    Tab(text: 'About'),
                  ],
                ),
                backgroundColor: Styles.scaffoldBackground,
              ),
            ),
            if (_tabController.index == 0)
              ..._buildHomeTabSlivers(themeData, creatorModel)
            else if (_tabController.index == 1)
              ..._buildCollectionTabSlivers()
            else if (_tabController.index == 2)
              ..._buildAboutTabSlivers(themeData),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchView(ThemeData themeData, CreatorModel creatorModel) {
    return Column(
      children: [
        _buildSearchAppBar(themeData),
        Expanded(child: _buildSearchResults(themeData, creatorModel)),
      ],
    );
  }

  SubscriptionModel? _getSubscription(MyCreatorProvider provider) {
    if (_creatorId == null) return null;
    final subscriptions = provider.userSubscriptionsPaginationModel.get().contentsList.getList();
    try {
      return subscriptions.firstWhere((sub) => sub.creator?.id == _creatorId && sub.status.toLowerCase() == 'active');
    } catch (e) {
      return null;
    }
  }

  List<Widget> _buildHomeTabSlivers(ThemeData themeData, CreatorModel creatorModel) {
    final subscription = _getSubscription(myCreatorProvider);
    final isPaidSubscription = subscription != null && (subscription.monthlyRate > 0);

    // final availableTiers = ['All', ...memberships.map((m) => m.name)];

    // if (!availableTiers.contains(_selectedTier)) {
    //   _selectedTier = 'All';
    // }
    return [
      SliverPadding(
        padding: const EdgeInsets.all(12),
        sliver: SliverList(
          delegate: SliverChildListDelegate(
            [
              if (isPaidSubscription)
                SubscriptionDetailsWidget(
                  subscription: subscription,
                  creatorId: _creatorId!,
                )
              else
                MembershipSectionWidget(
                  memberships: memberships,
                  creatorId: _creatorId!,
                ),
              CreatorPostsSectionWidget(
                creatorModel: creatorModel,
                myCreatorProvider: myCreatorProvider,
                memberships: memberships,
                scrollController: _scrollController,
                postTypes: _postTypes,
                tiers: _tiers,
                dateFilters: _dateFilters,
                selectedPostType: _selectedPostType,
                selectedTier: _selectedTier,
                selectedDateFilter: _selectedDateFilter,
                onPostTypeChanged: (value) {
                  setState(() => _selectedPostType = value!);
                  _refreshData(isRefresh: true);
                },
                onTierChanged: (value) {
                  setState(() => _selectedTier = value!);
                  _refreshData(isRefresh: true);
                },
                onDateFilterChanged: (value) {
                  setState(() => _selectedDateFilter = value!);
                  _refreshData(isRefresh: true);
                },
                activateSearchCallback: _activateSearch,
                displaySearchBoxAsHeader: true,
              ),
            ],
          ),
        ),
      ),
    ];
  }

  List<Widget> _buildCollectionTabSlivers() {
    final provider = context.watch<CollectionProvider>();
    final collections = provider.collections.getList();
    final isLoading = provider.isLoading.get();

    if (isLoading && collections.isEmpty) {
      return [
        const SliverToBoxAdapter(
          child: Center(child: LoadingWidget()),
        ),
      ];
    }

    if (!isLoading && collections.isEmpty) {
      return [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 50),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.collections_outlined, size: 64, color: Colors.grey),
                const SizedBox(height: 16),
                Text(
                  'No Collections',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold).withEpilogue,
                ),
                const SizedBox(height: 8),
                Text(
                  'Creator collections will be displayed here',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 16, color: Colors.grey).withEpilogue,
                ),
              ],
            ),
          ),
        ),
      ];
    }

    return [
      SliverPadding(
        padding: const EdgeInsets.all(16.0),
        sliver: SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final collection = collections[index];
              return CollectionCard(
                collection: collection,
              );
            },
            childCount: collections.length,
          ),
        ),
      ),
    ];
  }

  List<Widget> _buildAboutTabSlivers(ThemeData themeData) {
    final HtmlUnescape unescape = HtmlUnescape();
    final String decodedBio = unescape.convert(bio);
    final bool hasContent = introVideoUrl.isNotEmpty || bio.isNotEmpty || socialLinks.isNotEmpty;

    List<Widget> content = [];

    content.add(
      Container(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Consumer<MyCreatorProvider>(
          builder: (context, provider, child) {
            final stats = provider.creatorStats.get();
            final totalMembers = stats?.totalMembers ?? 0;
            final totalPosts = stats?.totalPosts ?? 0;
            int paidMembers = 0;
            if (stats != null) {
              paidMembers = stats.tierBreakdown.where((e) => e.monthlyRate > 0).fold(0, (p, e) => p + e.count);
            }
            return Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildStatColumn(label: "Total Members", value: totalMembers.toString(), color: Colors.grey[600]),
                Container(height: 40, width: 1, color: Colors.grey[300]),
                _buildStatColumn(label: "Paid Members", value: paidMembers.toString(), color: Colors.grey[600]),
                Container(height: 40, width: 1, color: Colors.grey[300]),
                _buildStatColumn(label: "Posts", value: totalPosts.toString(), color: Colors.grey[600]),
              ],
            );
          },
        ),
      ),
    );
    content.add(const SizedBox(height: 16));

    if (_isAboutLoading) {
      content.add(const Center(child: CircularProgressIndicator()));
    } else if (!hasContent) {
      content.add(_buildEmptyState());
    } else {
      if (_isVideoUrlValid && _youtubeController != null) {
        content.add(_buildVideoSection(themeData));
        content.add(const SizedBox(height: 16));
      }
      if (bio.isNotEmpty) {
        content.add(_buildBioSection(themeData, decodedBio));
        content.add(const SizedBox(height: 16));
      }
      if (socialLinks.isNotEmpty) {
        content.add(_buildSocialLinksSection(themeData));
      }
    }

    return [
      SliverPadding(
        padding: const EdgeInsets.all(16.0),
        sliver: SliverList(
          delegate: SliverChildListDelegate(content),
        ),
      ),
    ];
  }

  Widget _buildEmptyState() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[200]!),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          Icon(Icons.info_outline, size: 40, color: Colors.grey[400]),
          const SizedBox(height: 8),
          Text(
            'No About Information',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.grey[700]).withEpilogue,
          ),
          const SizedBox(height: 4),
          Text(
            'The creator has not added any information here yet.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: Colors.grey[600]).withEpilogue,
          ),
        ],
      ),
    );
  }

  Widget _buildVideoSection(ThemeData themeData) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(Icons.play_circle_outline, size: 18, color: themeData.primaryColor),
            const SizedBox(width: 8),
            Text('Intro Video', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600).withEpilogue),
          ]),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: YoutubePlayer(controller: _youtubeController!, showVideoProgressIndicator: true),
          ),
        ],
      ),
    );
  }

  Widget _buildBioSection(ThemeData themeData, String decodedBio) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(Icons.person_outline, size: 18, color: themeData.primaryColor),
            const SizedBox(width: 8),
            Text('About Me', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600).withEpilogue),
          ]),
          const SizedBox(height: 6),
          Html(
            data: decodedBio.trim().isNotEmpty ? decodedBio : "<p>No bio added yet.</p>",
            style: {
              "p": Style(fontSize: FontSize(14), color: themeData.textTheme.labelMedium?.color),
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSocialLinksSection(ThemeData themeData) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(Icons.link, size: 18, color: themeData.primaryColor),
            const SizedBox(width: 8),
            Text('Connect With Me', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600).withEpilogue),
          ]),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: socialLinks.map((link) {
              return GestureDetector(
                onTap: () => _launchUrl(link.url),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getSocialColor(link.platform).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _getSocialColor(link.platform).withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      FaIcon(_getSocialIcon(link.platform), size: 14, color: _getSocialColor(link.platform)),
                      const SizedBox(width: 6),
                      Text(
                        link.platform.replaceFirst(link.platform[0], link.platform[0].toUpperCase()),
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: _getSocialColor(link.platform))
                            .withEpilogue,
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.inAppBrowserView);
    }
  }

  IconData _getSocialIcon(String platform) {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return FontAwesomeIcons.youtube;
      case 'instagram':
        return FontAwesomeIcons.instagram;
      case 'twitter':
        return FontAwesomeIcons.xTwitter;
      case 'facebook':
        return FontAwesomeIcons.facebook;
      case 'tiktok':
        return FontAwesomeIcons.tiktok;
      case 'twitch':
        return FontAwesomeIcons.twitch;
      default:
        return FontAwesomeIcons.link;
    }
  }

  Color _getSocialColor(String platform) {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return const Color(0xFFFF0000);
      case 'instagram':
        return const Color(0xFFE4405F);
      case 'twitter':
        return const Color(0xFF1DA1F2);
      case 'facebook':
        return const Color(0xFF1877F2);
      case 'tiktok':
        return const Color(0xFF000000);
      case 'twitch':
        return const Color(0xFF9146FF);
      default:
        return Colors.grey[600]!;
    }
  }

  Widget _buildSearchAppBar(ThemeData themeData) {
    return Container(
      color: Colors.white,
      child: SafeArea(
        child: Container(
          height: 56,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left, color: Colors.black, size: 34),
                onPressed: _deactivateSearch,
              ),
              Expanded(
                child: Container(
                  margin: const EdgeInsets.only(right: 16),
                  child: TextField(
                    controller: _searchController,
                    focusNode: _searchFocusNode,
                    autofocus: true,
                    decoration: InputDecoration(
                      hintText: 'Search posts...',
                      hintStyle: const TextStyle(
                        color: Colors.grey,
                        fontSize: 16,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: Colors.grey.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: themeData.primaryColor.withOpacity(0.3),
                          width: 1.5,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: Colors.grey.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchController.clear();
                                mySetState();
                              },
                            )
                          : null,
                    ),
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.black,
                    ),
                    onChanged: (value) {
                      mySetState();
                      _debounce?.cancel();
                      _debounce = Timer(const Duration(milliseconds: 500), () {
                        _refreshData(isRefresh: true, searchQuery: value);
                      });
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchResults(ThemeData themeData, CreatorModel creatorModel) {
    return RefreshIndicator(
      onRefresh: () => _refreshData(isRefresh: true),
      child: SingleChildScrollView(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_searchQuery.isNotEmpty) ...[
              Text(
                'Search results for "$_searchQuery"',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: themeData.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 16),
            ] else ...[
              Text(
                'Type to search posts by ${creatorModel.displayName}...',
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 16),
            ],
            CreatorPostsSectionWidget(
              creatorModel: creatorModel,
              myCreatorProvider: myCreatorProvider,
              scrollController: _scrollController,
              memberships: memberships,
              tiers: _tiers,
              postTypes: _postTypes,
              dateFilters: _dateFilters,
              selectedPostType: _selectedPostType,
              selectedTier: _selectedTier,
              selectedDateFilter: _selectedDateFilter,
              onPostTypeChanged: (value) {
                _selectedPostType = value!;
                mySetState();
                _refreshData(isRefresh: true);
              },
              onTierChanged: (value) {
                _selectedTier = value!;
                mySetState();
                _refreshData(isRefresh: true);
              },
              onDateFilterChanged: (value) {
                _selectedDateFilter = value!;
                mySetState();
                _refreshData(isRefresh: true);
              },
              displaySearchBoxAsHeader: false,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatColumn({
    required String label,
    required String value,
    Color? color,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: color ?? Colors.grey[600],
            fontWeight: FontWeight.w400,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
