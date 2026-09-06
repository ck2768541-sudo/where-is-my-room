import * as SecureStore from "expo-secure-store";

const TOKEN_KEY =
  "where_is_my_room_auth_token";

const USER_KEY =
  "where_is_my_room_auth_user";

export const saveAuthSession = async (
  token: string,
  user: object
) => {
  await SecureStore.setItemAsync(
    TOKEN_KEY,
    token
  );

  await SecureStore.setItemAsync(
    USER_KEY,
    JSON.stringify(user)
  );
};

export const getAuthToken = async () => {
  return SecureStore.getItemAsync(
    TOKEN_KEY
  );
};

export const getAuthUser = async () => {
  const user =
    await SecureStore.getItemAsync(
      USER_KEY
    );

  if (!user) {
    return null;
  }

  return JSON.parse(user);
};

export const saveAuthUser = async (
  user: object
) => {
  await SecureStore.setItemAsync(
    USER_KEY,
    JSON.stringify(user)
  );
};

export const clearAuthSession =
  async () => {
    await SecureStore.deleteItemAsync(
      TOKEN_KEY
    );

    await SecureStore.deleteItemAsync(
      USER_KEY
    );
  };