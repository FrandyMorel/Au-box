import { apiClient } from "./client";

import type {
  User,
  UpdateUserNameRequest,
  UpdateUserNameResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "./types";

export async function getCurrentUser(): Promise<User> {
  return apiClient<User>("/users/me", {
    method: "GET",
  });
}

export async function updateUserName(
  data: UpdateUserNameRequest,
): Promise<UpdateUserNameResponse> {
  return apiClient<UpdateUserNameResponse>("/users/name", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function changePassword(
  data: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  return apiClient<ChangePasswordResponse>(
    "/users/change-password",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}