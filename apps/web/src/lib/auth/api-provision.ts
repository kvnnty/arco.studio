import { randomBytes } from "node:crypto";

import {
  ApiError,
  apiLogin,
  apiRegister,
  type AuthResponse,
} from "@/lib/api/client";
import {
  getUserByEmail,
  updateUserApiCredentials,
  type StoredUser,
} from "@/lib/auth/users";

function generateApiPassword(): string {
  return randomBytes(24).toString("base64url");
}

export async function ensureApiAuthForUser(
  user: StoredUser,
): Promise<AuthResponse> {
  if (user.apiPassword && user.apiUserId) {
    try {
      return await apiLogin({ email: user.email, password: user.apiPassword });
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    }
  }

  const password = user.apiPassword ?? generateApiPassword();

  try {
    const registered = await apiRegister({
      email: user.email,
      password,
      name: user.name,
    });
    await updateUserApiCredentials(user.email, {
      apiPassword: password,
      apiUserId: registered.user.id,
    });
    return registered;
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      const loggedIn = await apiLogin({ email: user.email, password });
      await updateUserApiCredentials(user.email, {
        apiPassword: password,
        apiUserId: loggedIn.user.id,
      });
      return loggedIn;
    }
    throw error;
  }
}

export async function ensureApiAuthForEmail(
  email: string,
): Promise<AuthResponse> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("No account found for this email.");
  }
  return ensureApiAuthForUser(user);
}
