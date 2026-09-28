
/*
|--------------------------------------------------------------------------
| Service Worker Registration
|--------------------------------------------------------------------------
| Smart Village Management ke liye PWA / Offline support.
|
| Features:
| - Service Worker register
| - Offline app shell support
| - Automatic update detection
| - New version available detection
| - Safe unregister helper
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Register Service Worker
|--------------------------------------------------------------------------
*/

export function registerServiceWorker() {
  /*
   * Service Worker sirf browser environment mein
   * aur production build mein register hoga.
   */
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  /*
   * Development mode mein Service Worker avoid karna
   * useful hai, warna old cache development mein
   * problem create kar sakta hai.
   */
  if (
    import.meta?.env?.DEV
  ) {
    return;
  }

  window.addEventListener(
    "load",
    async () => {
      try {
        const registration =
          await navigator.serviceWorker.register(
            "/sw.js",
            {
              scope: "/",
            }
          );

        console.log(
          "Service Worker registered successfully:",
          registration.scope
        );

        /*
        |--------------------------------------------------------------------------
        | Check for updates
        |--------------------------------------------------------------------------
        */

        registration.addEventListener(
          "updatefound",
          () => {
            const newWorker =
              registration.installing;

            if (!newWorker) {
              return;
            }

            newWorker.addEventListener(
              "statechange",
              () => {
                if (
                  newWorker.state ===
                  "installed"
                ) {
                  if (
                    navigator.serviceWorker
                      .controller
                  ) {
                    /*
                     * Existing user ke liye
                     * new version available hai.
                     */
                    console.log(
                      "New version of the village application is available."
                    );

                    window.dispatchEvent(
                      new CustomEvent(
                        "serviceWorkerUpdateAvailable",
                        {
                          detail:
                            registration,
                        }
                      )
                    );
                  } else {
                    /*
                     * First installation.
                     */
                    console.log(
                      "Village application is now available offline."
                    );

                    window.dispatchEvent(
                      new CustomEvent(
                        "serviceWorkerInstalled"
                      )
                    );
                  }
                }
              }
            );
          }
        );

        /*
        |--------------------------------------------------------------------------
        | Periodically check for updated Service Worker
        |--------------------------------------------------------------------------
        */

        const checkForUpdates =
          () => {
            registration
              .update()
              .catch(
                (error) => {
                  console.warn(
                    "Service Worker update check failed:",
                    error
                  );
                }
              );
          };

        /*
         * Har 30 minutes mein update check.
         */
        const updateInterval =
          window.setInterval(
            checkForUpdates,
            30 * 60 * 1000
          );

        /*
         * Browser close hone par interval cleanup.
         */
        window.addEventListener(
          "beforeunload",
          () => {
            window.clearInterval(
              updateInterval
            );
          },
          {
            once: true,
          }
        );
      } catch (error) {
        console.error(
          "Service Worker registration failed:",
          error
        );
      }
    }
  );
}

/*
|--------------------------------------------------------------------------
| Unregister Service Worker
|--------------------------------------------------------------------------
| Agar future mein Service Worker remove karna ho:
|
| unregisterServiceWorker();
|--------------------------------------------------------------------------
*/

export async function unregisterServiceWorker() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return false;
  }

  try {
    const registrations =
      await navigator.serviceWorker.getRegistrations();

    let unregistered = false;

    for (
      const registration of registrations
    ) {
      const result =
        await registration.unregister();

      if (result) {
        unregistered = true;
      }
    }

    /*
     * Optional cache cleanup.
     *
     * Sirf village application ke caches
     * remove kiye jayenge.
     */
    if (
      "caches" in window
    ) {
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
    }

    console.log(
      "Service Worker unregistered."
    );

    return unregistered;
  } catch (error) {
    console.error(
      "Failed to unregister Service Worker:",
      error
    );

    return false;
  }
}

/*
|--------------------------------------------------------------------------
| Listen for controller changes
|--------------------------------------------------------------------------
| New Service Worker activate hone ke baad
| application ko optionally reload kar sakte hain.
|--------------------------------------------------------------------------
*/

export function listenForServiceWorkerUpdates() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return () => {};
  }

  const handleControllerChange =
    () => {
      console.log(
        "New Service Worker is now active."
      );
    };

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    handleControllerChange
  );

  /*
   * Cleanup function
   */
  return () => {
    navigator.serviceWorker.removeEventListener(
      "controllerchange",
      handleControllerChange
    );
  };
}

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default registerServiceWorker;