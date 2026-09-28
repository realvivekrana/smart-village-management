
/*
|--------------------------------------------------------------------------
| Kakarcholi Village Management
| Service Worker
|--------------------------------------------------------------------------
|
| Purpose:
| - Offline support
| - Cache important frontend files
| - Faster loading
| - Basic PWA support
| - Network fallback
|
|--------------------------------------------------------------------------
*/

const CACHE_VERSION =
  "kakarcholi-village-v1";

const STATIC_CACHE =
  `${CACHE_VERSION}-static`;

const RUNTIME_CACHE =
  `${CACHE_VERSION}-runtime`;

const API_CACHE =
  `${CACHE_VERSION}-api`;

/*
|--------------------------------------------------------------------------
| App Shell
|--------------------------------------------------------------------------
| Important public files jo offline mode mein available
| rehne chahiye.
|--------------------------------------------------------------------------
*/

const APP_SHELL = [
  "/",
  "/index.html",
];

/*
|--------------------------------------------------------------------------
| Install
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "install",
  (event) => {
    console.log(
      "[SW] Installing Service Worker..."
    );

    event.waitUntil(
      caches
        .open(STATIC_CACHE)
        .then((cache) => {
          return cache.addAll(
            APP_SHELL
          );
        })
        .then(() => {
          /*
           * New Service Worker ko immediately
           * waiting state mein na rakhkar activate karna.
           */
          return self.skipWaiting();
        })
        .catch((error) => {
          console.error(
            "[SW] Failed to cache app shell:",
            error
          );
        })
    );
  }
);

/*
|--------------------------------------------------------------------------
| Activate
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "activate",
  (event) => {
    console.log(
      "[SW] Activating Service Worker..."
    );

    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map(
              (cacheName) => {
                /*
                 * Sirf purane Kakarcholi caches delete
                 * karenge.
                 */
                if (
                  cacheName.startsWith(
                    "kakarcholi-village-"
                  ) &&
                  ![
                    STATIC_CACHE,
                    RUNTIME_CACHE,
                    API_CACHE,
                  ].includes(
                    cacheName
                  )
                ) {
                  console.log(
                    "[SW] Removing old cache:",
                    cacheName
                  );

                  return caches.delete(
                    cacheName
                  );
                }

                return null;
              }
            )
          );
        })
        .then(() => {
          /*
           * Existing tabs ko immediately
           * new Service Worker control kare.
           */
          return self.clients.claim();
        })
    );
  }
);

/*
|--------------------------------------------------------------------------
| Fetch Handler
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "fetch",
  (event) => {
    const request =
      event.request;

    /*
     * Sirf GET requests cache karenge.
     *
     * POST / PUT / PATCH / DELETE ko
     * Service Worker handle nahi karega.
     */
    if (
      request.method !== "GET"
    ) {
      return;
    }

    const url =
      new URL(request.url);

    /*
     * Cross-origin requests ko mostly
     * browser/network ke through jane do.
     *
     * Isse external APIs aur payment services
     * accidentally cache nahi hongi.
     */
    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }

    /*
     |--------------------------------------------------------------------------
     | Navigation Request
     |--------------------------------------------------------------------------
     |
     | Example:
     | /dashboard
     | /services
     | /complaints
     |
     | Offline hone par index.html return karne ki
     | koshish karenge.
     |--------------------------------------------------------------------------
     */

    if (
      request.mode ===
      "navigate"
    ) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            /*
             * Successful response ko runtime cache
             * mein save karo.
             */
            if (
              response &&
              response.ok
            ) {
              const responseClone =
                response.clone();

              caches
                .open(
                  RUNTIME_CACHE
                )
                .then((cache) => {
                  cache.put(
                    request,
                    responseClone
                  );
                });
            }

            return response;
          })
          .catch(() => {
            /*
             * Network unavailable:
             * cached page return karo.
             */
            return caches
              .match(request)
              .then(
                (cachedPage) => {
                  if (
                    cachedPage
                  ) {
                    return cachedPage;
                  }

                  return caches.match(
                    "/index.html"
                  );
                }
              );
          })
      );

      return;
    }

    /*
     |--------------------------------------------------------------------------
     | API Request
     |--------------------------------------------------------------------------
     |
     | Basic network-first strategy.
     |
     | Fresh API data ko priority.
     | Network fail hone par cached response.
     |--------------------------------------------------------------------------
     */

    if (
      url.pathname.startsWith(
        "/api/"
      )
    ) {
      event.respondWith(
        networkFirstAPI(
          request
        )
      );

      return;
    }

    /*
     |--------------------------------------------------------------------------
     | Static Assets
     |--------------------------------------------------------------------------
     |
     | JS / CSS / images / fonts etc.
     |
     | Cache-first:
     | pehle cache check,
     | nahi mila to network.
     |--------------------------------------------------------------------------
     */

    event.respondWith(
      cacheFirst(
        request
      )
    );
  }
);

/*
|--------------------------------------------------------------------------
| Network First API
|--------------------------------------------------------------------------
*/

async function networkFirstAPI(
  request
) {
  try {
    const response =
      await fetch(request);

    /*
     * Successful API response cache karo.
     */
    if (
      response &&
      response.ok
    ) {
      const cache =
        await caches.open(
          API_CACHE
        );

      await cache.put(
        request,
        response.clone()
      );
    }

    return response;
  } catch (error) {
    console.warn(
      "[SW] API network failed:",
      request.url
    );

    const cachedResponse =
      await caches.match(
        request
      );

    if (
      cachedResponse
    ) {
      return cachedResponse;
    }

    /*
     * JSON fallback
     */
    return new Response(
      JSON.stringify({
        success: false,
        offline: true,
        message:
          "You are currently offline. Please try again when the internet connection is available.",
      }),
      {
        status: 503,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| Cache First
|--------------------------------------------------------------------------
*/

async function cacheFirst(
  request
) {
  const cachedResponse =
    await caches.match(
      request
    );

  if (
    cachedResponse
  ) {
    return cachedResponse;
  }

  try {
    const response =
      await fetch(request);

    /*
     * Sirf successful same-origin
     * responses cache karo.
     */
    if (
      response &&
      response.ok
    ) {
      const cache =
        await caches.open(
          RUNTIME_CACHE
        );

      await cache.put(
        request,
        response.clone()
      );
    }

    return response;
  } catch (error) {
    /*
     * Image request offline hone par
     * request fail hone do.
     */
    return new Response(
      "",
      {
        status: 503,
        statusText:
          "Offline",
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| Message Handler
|--------------------------------------------------------------------------
| Frontend se Service Worker ko command bhejne ke
| liye useful.
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "message",
  (event) => {
    if (
      !event.data
    ) {
      return;
    }

    /*
     * New version activate karna.
     */
    if (
      event.data.type ===
      "SKIP_WAITING"
    ) {
      self.skipWaiting();
    }

    /*
     * Saare Kakarcholi caches clear.
     */
    if (
      event.data.type ===
      "CLEAR_CACHE"
    ) {
      event.waitUntil(
        clearVillageCaches()
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Clear Caches
|--------------------------------------------------------------------------
*/

async function clearVillageCaches() {
  const cacheNames =
    await caches.keys();

  await Promise.all(
    cacheNames
      .filter((cacheName) =>
        cacheName.startsWith(
          "kakarcholi-village-"
        )
      )
      .map((cacheName) =>
        caches.delete(
          cacheName
        )
      )
  );

  console.log(
    "[SW] Village caches cleared."
  );
}

/*
|--------------------------------------------------------------------------
| Background Sync
|--------------------------------------------------------------------------
|
| Browser support available ho to future mein:
| - complaints
| - volunteer registration
| - applications
|
| jaise offline actions ko queue kiya ja sakta hai.
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "sync",
  (event) => {
    if (
      event.tag ===
      "village-offline-actions"
    ) {
      event.waitUntil(
        processOfflineActions()
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Offline Actions
|--------------------------------------------------------------------------
|
| Abhi placeholder hai.
| Actual queue implementation future API/service
| layer mein add ki ja sakti hai.
|--------------------------------------------------------------------------
*/

async function processOfflineActions() {
  console.log(
    "[SW] Processing offline village actions..."
  );

  /*
   * Future implementation:
   *
   * 1. IndexedDB se pending actions read karo.
   * 2. Network available hone par API call karo.
   * 3. Successful request ke baad action delete karo.
   */
}

/*
|--------------------------------------------------------------------------
| Push Notification Support
|--------------------------------------------------------------------------
|
| Future SMS/Push notification integration ke liye
| basic handler.
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "push",
  (event) => {
    let data = {};

    try {
      data = event.data
        ? event.data.json()
        : {};
    } catch (error) {
      data = {
        title:
          "Kakarcholi Village",
        body:
          "You have a new notification.",
      };
    }

    const title =
      data.title ||
      "Kakarcholi Village";

    const options = {
      body:
        data.body ||
        "You have a new notification.",
      icon:
        data.icon ||
        "/icons/icon-192.png",
      badge:
        data.badge ||
        "/icons/icon-192.png",
      data:
        data.data || {},
      vibrate: [
        200,
        100,
        200,
      ],
    };

    event.waitUntil(
      self.registration.showNotification(
        title,
        options
      )
    );
  }
);

/*
|--------------------------------------------------------------------------
| Notification Click
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const targetUrl =
      event.notification
        ?.data?.url ||
      "/";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then(
          (clientList) => {
            /*
             * Existing app window mil jaye to
             * usko focus karo.
             */
            for (
              const client of clientList
            ) {
              if (
                "focus" in
                  client
              ) {
                client.navigate(
                  targetUrl
                );

                return client.focus();
              }
            }

            /*
             * Existing window nahi hai,
             * new window open karo.
             */
            if (
              clients.openWindow
            ) {
              return clients.openWindow(
                targetUrl
              );
            }

            return null;
          }
        )
    );
  }
);

console.log(
  "[SW] Kakarcholi Village Service Worker loaded."
);