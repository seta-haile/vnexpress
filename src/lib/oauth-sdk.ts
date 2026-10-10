"use client";

import { User } from "@/types/auth";

declare global {
  interface Window {
    google?: any;
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

// -------------------------------------------------------------
// 1. Google OAuth (Google Identity Services - GIS Token Client)
// -------------------------------------------------------------
let isGoogleSdkLoaded = false;
let googleSdkLoadingPromise: Promise<void> | null = null;

export function loadGoogleSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (isGoogleSdkLoaded && window.google?.accounts?.oauth2) return Promise.resolve();

  if (googleSdkLoadingPromise) return googleSdkLoadingPromise;

  googleSdkLoadingPromise = new Promise((resolve, reject) => {
    // Check if already in DOM
    if (document.getElementById("google-jssdk")) {
      isGoogleSdkLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-jssdk";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isGoogleSdkLoaded = true;
      resolve();
    };
    script.onerror = () => {
      googleSdkLoadingPromise = null;
      reject(new Error("Không thể tải Google Identity SDK"));
    };
    document.head.appendChild(script);
  });

  return googleSdkLoadingPromise;
}

export async function loginWithRealGoogle(
  clientId: string
): Promise<User> {
  await loadGoogleSdk();

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity SDK chưa sẵn sàng.");
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid profile email",
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          try {
            // Fetch real user profile from Google UserInfo API
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const profile = await res.json();

            if (!profile.email) {
              reject(new Error("Không thể lấy email từ tài khoản Google."));
              return;
            }

            const user: User = {
              id: `google_${profile.sub}`,
              name: profile.name || profile.given_name || "Google User",
              email: profile.email,
              avatar: profile.picture,
              provider: "google",
              providerId: profile.sub,
              role: "learner",
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };

            resolve(user);
          } catch (err) {
            reject(err);
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err.message || "Đăng nhập Google bị hủy hoặc gặp lỗi."));
        }
      });

      // Trigger the real Google OAuth consent popup
      client.requestAccessToken({ prompt: "consent" });
    } catch (e) {
      reject(e);
    }
  });
}

// -------------------------------------------------------------
// 2. Facebook OAuth (Meta Facebook JavaScript SDK)
// -------------------------------------------------------------
let isFacebookSdkLoaded = false;
let facebookSdkLoadingPromise: Promise<void> | null = null;

export function loadFacebookSdk(appId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (isFacebookSdkLoaded && window.FB) return Promise.resolve();

  if (facebookSdkLoadingPromise) return facebookSdkLoadingPromise;

  facebookSdkLoadingPromise = new Promise((resolve) => {
    // Check if script already exists
    if (document.getElementById("facebook-jssdk") && window.FB) {
      isFacebookSdkLoaded = true;
      resolve();
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: "v19.0"
      });
      isFacebookSdkLoaded = true;
      resolve();
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  return facebookSdkLoadingPromise;
}

export async function loginWithRealFacebook(
  appId: string
): Promise<User> {
  await loadFacebookSdk(appId);

  if (!window.FB) {
    throw new Error("Facebook SDK chưa được tải.");
  }

  return new Promise((resolve, reject) => {
    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          // Fetch real user profile from Facebook Graph API
          window.FB.api(
            "/me",
            { fields: "id,name,email,picture.type(large)" },
            (profile: any) => {
              if (profile.error) {
                reject(new Error(profile.error.message || "Lỗi đọc thông tin Facebook."));
                return;
              }

              const user: User = {
                id: `fb_${profile.id}`,
                name: profile.name || "Facebook User",
                email: profile.email || `${profile.id}@facebook.com`,
                avatar: profile.picture?.data?.url,
                provider: "facebook",
                providerId: profile.id,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              };

              resolve(user);
            }
          );
        } else {
          reject(new Error("Người dùng đã hủy đăng nhập Facebook hoặc không cấp quyền."));
        }
      },
      { scope: "public_profile,email" }
    );
  });
}
