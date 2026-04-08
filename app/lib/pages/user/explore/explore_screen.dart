import 'dart:async';

import 'package:flutter/material.dart';
import 'package:patreon-clone/models/creator/creator_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon-clone/backend/creator/my_creator_provider.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/creator/my_creator_controller.dart';
import 'package:patreon-clone/constants/constants.dart';
import 'package:patreon-clone/pages/user/creator/component/creator_section.dart';

class ExploreScreen extends StatefulWidget {
  static const String routeName = '/ExploreScreen';

  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> with MySafeState {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All';
  bool _isLoading = true;
  bool _isSearching = false;
  List<CreatorModel> _topCreators = [];
  Map<String, List<CreatorModel>> _categoryCreators = {};
  // ignore: unused_field
  List<CreatorModel> _filteredCreators = [];
  List<CreatorModel> _searchResults = [];
  late MyCreatorController myCreatorController;
  late MyCreatorProvider myCreatorProvider;
  Timer? _searchTimer;

  final List<String> _allCategories = ['All', ...categories];

  @override
  void initState() {
    super.initState();
    myCreatorProvider = context.read<MyCreatorProvider>();
    myCreatorController = MyCreatorController(myCreatorProvider: myCreatorProvider);

    loadCreatorsData(
      isRefresh: false,
      isFromCache: true,
      isNotify: false,
    );
  }

  @override
  void dispose() {
    _searchTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> loadCreatorsData({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    final bool hasCachedData =
        myCreatorProvider.creators.getList().isNotEmpty && myCreatorProvider.categoryCreators.get().isNotEmpty;

    if (!isRefresh && isFromCache && hasCachedData) {
      _topCreators = myCreatorProvider.creators.getList();
      _categoryCreators = myCreatorProvider.categoryCreators.get();
      _isLoading = false;
      _updateFilteredCreators();
      if (isNotify) mySetState();
      return;
    }
    mySetState();
    _isLoading = true;

    if (isRefresh) {
      _topCreators = [];
      _categoryCreators = {};
      _filteredCreators = [];
    }

    _isLoading = true;
    if (isNotify) mySetState();

    try {
      final results = await Future.wait([
        myCreatorController.getTopCreators(),
        myCreatorController.getAllCategoriesCreators(limit: 8),
      ]);

      _topCreators = results[0] as List<CreatorModel>;
      _categoryCreators = results[1] as Map<String, List<CreatorModel>>;

      myCreatorProvider.creators.setList(list: _topCreators, isClear: true, isNotify: isNotify);
      myCreatorProvider.categoryCreators.set(value: _categoryCreators, isNotify: isNotify);

      _updateFilteredCreators();
    } catch (e) {
      MyPrint.printOnConsole("❌ Error loading creators data: $e");
      _topCreators = [];
      _categoryCreators = {};
      _filteredCreators = [];
    } finally {
      mySetState();
      _isLoading = false;
      if (isNotify) mySetState();
    }
  }

  void _updateFilteredCreators() {
    if (_selectedCategory == 'All') {
      _filteredCreators = _topCreators;
    } else {
      _filteredCreators = _categoryCreators[_selectedCategory] ?? [];
    }
  }

  void _onSearchChanged(String query) {
    _searchTimer?.cancel();

    if (query.isEmpty) {
      setState(() {
        _isSearching = false;
        _searchResults = [];
      });
      _updateFilteredCreators();
      return;
    }

    setState(() {
      _isSearching = true;
    });

    _searchTimer = Timer(const Duration(milliseconds: 500), () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    try {
      setState(() => _isSearching = true);

      final searchResults = await myCreatorController.searchCreators(query: query);

      setState(() {
        _searchResults = searchResults;
        _isSearching = false;
      });
    } catch (e) {
      MyPrint.printOnConsole("❌ Error searching creators: $e");
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
    }
  }

  void _onCategorySelected(String category) {
    _selectedCategory = category;
    _searchController.clear();
    _searchResults = [];
    _updateFilteredCreators();
    mySetState();
  }

  List<CreatorModel> get topCreatorsDisplayed => _topCreators.take(6).toList();

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return ModalProgressHUD(
      inAsyncCall: _isLoading,
      child: Scaffold(
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(25),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.1),
                        spreadRadius: 1,
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    decoration: InputDecoration(
                      hintText: 'Search creators or topics',
                      hintStyle: themeData.textTheme.labelMedium?.copyWith(color: Colors.grey).withEpilogue,
                      prefixIcon: _isSearching
                          ? const Padding(
                              padding: EdgeInsets.all(12.0),
                              child: SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              ),
                            )
                          : const Icon(Icons.search, color: Colors.grey),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, color: Colors.grey),
                              onPressed: () {
                                _searchController.clear();
                                _onSearchChanged('');
                              },
                            )
                          : null,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: const BorderRadius.all(Radius.circular(28)),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: const BorderRadius.all(Radius.circular(28)),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: const BorderRadius.all(Radius.circular(28)),
                        borderSide: BorderSide(color: themeData.primaryColor),
                      ),
                    ),
                  ),
                ),
              ),
              if (_searchController.text.isEmpty) ...[
                SizedBox(
                  height: 30,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _allCategories.length,
                    itemBuilder: (context, index) {
                      final category = _allCategories[index];
                      final isSelected = _selectedCategory == category;
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: GestureDetector(
                          onTap: () {
                            _onCategorySelected(category);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: isSelected ? themeData.primaryColor : Colors.white,
                              borderRadius: BorderRadius.circular(25),
                              border: Border.all(
                                color: isSelected ? themeData.primaryColor : Colors.grey[300]!,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                category,
                                style: TextStyle(
                                  color: isSelected ? Colors.white : Colors.grey[700],
                                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                  fontSize: 12,
                                ).withEpilogue,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 24),
              ],
              Expanded(
                child: _buildContent(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_searchController.text.isNotEmpty) {
      return _buildSearchResults();
    }

    if (_selectedCategory == 'All') {
      return _buildAllCategoriesView();
    } else {
      return _buildCategoryView(_selectedCategory);
    }
  }

  Widget _buildSearchResults() {
    if (_isSearching) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Searching creators...'),
          ],
        ),
      );
    }

    if (_searchResults.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No results found for "${_searchController.text}"',
              style: themeData.textTheme.titleMedium?.withEpilogue,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Try searching with different keywords',
              style: themeData.textTheme.bodyMedium
                  ?.copyWith(
                    color: Colors.grey[600],
                  )
                  .withEpilogue,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      child: CreatorSection(
        title: 'Search Results (${_searchResults.length})',
        creators: _searchResults,
      ),
    );
  }

  Widget _buildAllCategoriesView() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (topCreatorsDisplayed.isNotEmpty) ...[
            CreatorSection(
              title: 'Top Creators',
              creators: topCreatorsDisplayed,
            ),
            const SizedBox(height: 32),
          ],
          ...categories.map((category) {
            final categoryCreators = _categoryCreators[category] ?? [];
            if (categoryCreators.isEmpty) return const SizedBox.shrink();

            return Column(
              children: [
                CreatorSection(
                  title: category,
                  creators: categoryCreators,
                ),
                const SizedBox(height: 32),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildCategoryView(String category) {
    final categoryCreators = _categoryCreators[category] ?? [];

    if (categoryCreators.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.category_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No creators found in $category',
              style: themeData.textTheme.titleMedium?.withEpilogue,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      child: CreatorSection(
        title: category,
        creators: categoryCreators,
      ),
    );
  }
}
