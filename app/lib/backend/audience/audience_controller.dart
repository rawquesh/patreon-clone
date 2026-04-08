import 'dart:convert';
import 'dart:io';

import 'package:csv/csv.dart';
import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';
import 'package:patreon-clone/models/audience/member_model.dart';
import 'package:patreon-clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon-clone/models/common/data_model/paginated_request_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import 'audience_provider.dart';

class AudienceController {
  final AudienceProvider audienceProvider;
  final ApiService _apiService = ApiService();

  AudienceController({required this.audienceProvider});

  Future<void> getMembersPaginatedList({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
    String searchQuery = '',
  }) async {
    await _apiService.getPaginatedList(PaginatedRequestModel<MemberModel>(
      paginatedListModel: audienceProvider.membersPaginationModel.get(),
      endpoint: ApiEndpoints.members,
      dataListKey: 'members',
      queryParams: searchQuery.isNotEmpty ? {'search': searchQuery} : {},
      isRefresh: isRefresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
      fromMap: (data) {
        try {
          return MemberModel.fromMap(data);
        } catch (e) {
          MyPrint.printOnConsole('Error parsing member: $e');
          return null;
        }
      },
    ));
  }

  Future<bool> exportMembersToCSV({
    String? searchQuery,
    Map<String, String>? filters,
  }) async {
    try {
      List<MemberModel> allMembers = await _getAllMembersForExport(
        searchQuery: searchQuery,
        filters: filters,
      );

      if (allMembers.isEmpty) {
        MyPrint.printOnConsole('No members data to export');
        return false;
      }

      String csvContent = _generateCSVContent(allMembers);

      await _saveAndShareCSV(csvContent);

      return true;
    } catch (e) {
      MyPrint.printOnConsole('Error exporting to CSV: $e');
      return false;
    }
  }

  Future<List<MemberModel>> _getAllMembersForExport({
    String? searchQuery,
    Map<String, String>? filters,
  }) async {
    List<MemberModel> allMembers = [];
    int currentPage = 1;
    const int pageSize = 100;
    bool hasMoreData = true;

    while (hasMoreData) {
      try {
        APIDocumentsPaginatedListModel<MemberModel> tempPaginationModel = APIDocumentsPaginatedListModel<MemberModel>();

        Map<String, String> queryParams = {
          'page': currentPage.toString(),
          'limit': pageSize.toString(),
        };

        if (searchQuery?.isNotEmpty == true) {
          queryParams['search'] = searchQuery!;
        }

        if (filters != null) {
          filters.forEach((key, value) {
            if (value != 'All' && value.isNotEmpty) {
              queryParams[key.toLowerCase().replaceAll(' ', '_')] = value;
            }
          });
        }

        await _apiService.getPaginatedList(PaginatedRequestModel<MemberModel>(
          paginatedListModel: tempPaginationModel,
          endpoint: ApiEndpoints.members,
          dataListKey: 'members',
          queryParams: queryParams,
          isRefresh: true,
          isFromCache: false,
          isNotify: false,
          pageLimit: pageSize,
          fromMap: (data) {
            try {
              return MemberModel.fromMap(data);
            } catch (e) {
              MyPrint.printOnConsole('Error parsing member: $e');
              return null;
            }
          },
        ));

        List<MemberModel> pageMembers = tempPaginationModel.contentsList.getList(isNewInstance: false);

        if (pageMembers.isEmpty) {
          hasMoreData = false;
        } else {
          allMembers.addAll(pageMembers);
          currentPage++;
          hasMoreData = tempPaginationModel.hasMoreContents.get();
        }
      } catch (e) {
        MyPrint.printOnConsole('Error fetching page $currentPage: $e');
        hasMoreData = false;
      }
    }

    return allMembers;
  }

  String _generateCSVContent(List<MemberModel> members) {
    List<String> headers = [
      'Name',
      'Email',
      'Status',
      'Membership Tier',
      'Join Date',
      'Profile Picture URL',
      'Member ID',
    ];

    List<List<String>> rows = [];
    rows.add(headers);

    for (MemberModel member in members) {
      List<String> row = [
        member.name.isNotEmpty ? member.name : 'Unknown User',
        member.email.isNotEmpty ? member.email : 'No email provided',
        member.status.isNotEmpty ? member.status : 'Unknown',
        member.tier?.name ?? 'Free',
        _formatDateForCSV(member.joinDate),
        member.profilePicture.isNotEmpty ? member.profilePicture : '',
        member.id,
      ];
      rows.add(row);
    }

    String csvContent = const ListToCsvConverter().convert(rows);
    return csvContent;
  }

  String _formatDateForCSV(dynamic date) {
    if (date == null) return '';

    try {
      if (date is DateTime) {
        return '${date.day.toString().padLeft(2, '0')}-${date.month.toString().padLeft(2, '0')}-${date.year}';
      } else if (date is String && date.isNotEmpty) {
        DateTime? parsedDate = DateTime.tryParse(date);
        if (parsedDate != null) {
          return '${parsedDate.day.toString().padLeft(2, '0')}-${parsedDate.month.toString().padLeft(2, '0')}-${parsedDate.year}';
        }
        return date;
      }
    } catch (e) {
      MyPrint.printOnConsole('Error formatting date: $e');
    }

    return date.toString();
  }

  Future<void> _saveAndShareCSV(String csvContent) async {
    try {
      Directory tempDir = await getTemporaryDirectory();

      String timestamp = DateTime.now().millisecondsSinceEpoch.toString();
      String fileName = 'audience_members_$timestamp.csv';

      String filePath = '${tempDir.path}/$fileName';

      File csvFile = File(filePath);
      await csvFile.writeAsString(csvContent, encoding: utf8);

      await Share.shareXFiles(
        [XFile(filePath)],
        subject: 'Audience Members Export',
        text: 'Exported audience members data',
      );

      MyPrint.printOnConsole('CSV file created and shared: $filePath');
    } catch (e) {
      MyPrint.printOnConsole('Error saving/sharing CSV: $e');
      rethrow;
    }
  }
}
