import 'package:patreon-clone/backend/common/common_provider.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';

class AuthenticationProvider extends CommonProvider {
  AuthenticationProvider() {
    userId = CommonProviderPrimitiveParameter<String>(
      value: "",
      notify: notify,
    );
    mobileNumber = CommonProviderPrimitiveParameter<String>(
      value: "",
      notify: notify,
    );
    email = CommonProviderPrimitiveParameter<String>(
      value: "",
      notify: notify,
    );
    userModel = CommonProviderPrimitiveParameter<UserModel?>(
      value: null,
      notify: notify,
    );
    loginSessionId = CommonProviderPrimitiveParameter<String>(
      value: "",
      notify: notify,
    );
  }

  late CommonProviderPrimitiveParameter<String> userId;
  late CommonProviderPrimitiveParameter<String> mobileNumber;
  late CommonProviderPrimitiveParameter<String> email;
  late CommonProviderPrimitiveParameter<UserModel?> userModel;
  late CommonProviderPrimitiveParameter<String> loginSessionId;

  void resetData({bool isNotify = true}) {
    userId.set(value: "", isNotify: false);
    mobileNumber.set(value: "", isNotify: false);
    email.set(value: "", isNotify: false);
    userModel.set(value: null, isNotify: false);
    loginSessionId.set(value: "", isNotify: isNotify);
  }

  // Convenience Getters
  String get currentUserId => userId.get();
  String get currentMobileNumber => mobileNumber.get();
  String get currentEmail => email.get();
  UserModel? get currentUserModel => userModel.get();
  String get currentLoginSessionId => loginSessionId.get();
}
