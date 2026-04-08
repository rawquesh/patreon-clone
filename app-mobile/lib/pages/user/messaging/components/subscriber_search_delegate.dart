import 'package:flutter/material.dart';
import 'package:patreon-clone/models/audience/subscriber.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';

import 'package:patreon-clone/backend/messaging/direct_message_controller.dart';

class SubscriberSearchDelegate extends SearchDelegate<Subscriber?> {
  final DirectMessageController controller;

  SubscriberSearchDelegate(this.controller);

  @override
  List<Widget>? buildActions(BuildContext context) {
    return [
      IconButton(
        icon: const Icon(Icons.search),
        onPressed: () {
          showResults(context);
        },
      ),
      IconButton(
        icon: const Icon(Icons.clear),
        onPressed: () {
          query = '';
          showSuggestions(context);
        },
      ),
    ];
  }

  @override
  Widget? buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, null);
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    if (query.isEmpty) {
      return const Center(child: Text('Please enter a name to search'));
    }

    return FutureBuilder<List<Subscriber>>(
      future: controller.searchSubscribers(query),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return const Center(child: Text('Error searching for subscribers'));
        }
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('No subscribers found'));
        }

        final subscribers = snapshot.data!;
        return ListView.builder(
          itemCount: subscribers.length,
          itemBuilder: (context, index) {
            Subscriber subscriber = subscribers[index];
            MyPrint.printOnConsole(
                'Tapped subscriber from Search: ${subscriber.subscriberId} ${subscriber.firstName} ${subscriber.lastName} (${subscriber.email}), ALl Details: $subscriber');
            return ListTile(
              leading: CommonCachedNetworkImage(
                imageUrl: subscriber.profilePicture,
                height: 40,
                width: 40,
                borderRadius: 20,
              ),
              title: Text('${subscriber.firstName} ${subscriber.lastName}'),
              subtitle: Text(subscriber.email),
              onTap: () {
                close(context, subscriber);
              },
            );
          },
        );
      },
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return const Center(
      child: Text('Search for subscribers by name'),
    );
  }

  @override
  TextInputAction get textInputAction => TextInputAction.search;
}
