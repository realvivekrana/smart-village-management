const Event = require("../models/Event");
const Notice = require("../models/Notice");

/*
|--------------------------------------------------------------------------
| HOME PAGE CACHE
|--------------------------------------------------------------------------
|
| Homepage par events aur notices frequently change nahi hote.
| Isliye 30 seconds ka short server-side cache use kiya gaya hai.
|
| Isse same data ke liye MongoDB ko baar-baar query nahi karna padega.
|--------------------------------------------------------------------------
*/

let homeCache = null;
let homeCacheTime = 0;

const HOME_CACHE_TTL = 30 * 1000; // 30 seconds

/*
|--------------------------------------------------------------------------
| GET HOME DATA
|--------------------------------------------------------------------------
|
| GET /api/v1/home
|
| Homepage ke liye:
| - Upcoming Events
| - Latest Notices
|
| ek hi API request me return honge.
|--------------------------------------------------------------------------
*/

const getHomeData = async (req, res, next) => {
  try {
    const now = Date.now();

    /*
    |--------------------------------------------------------------------------
    | Return cached data
    |--------------------------------------------------------------------------
    */

    if (
      homeCache &&
      now - homeCacheTime < HOME_CACHE_TTL
    ) {
      res.set(
        "Cache-Control",
        "public, max-age=30, stale-while-revalidate=60"
      );

      return res.status(200).json({
        success: true,
        cached: true,
        data: homeCache,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Current date
    |--------------------------------------------------------------------------
    */

    const currentDate = new Date();

    /*
    |--------------------------------------------------------------------------
    | Fetch Events + Notices in parallel
    |--------------------------------------------------------------------------
    |
    | Promise.all() dono database queries ko parallel me run karta hai.
    |
    | Isse:
    |
    | Events query
    | +
    | Notices query
    |
    | ek ke baad ek wait nahi karte.
    |--------------------------------------------------------------------------
    */

    const [events, notices] = await Promise.all([
      /*
      |--------------------------------------------------------------------------
      | Upcoming Events
      |--------------------------------------------------------------------------
      */

      Event.find({
        isActive: true,
        endDate: {
          $gte: currentDate,
        },
      })
        .select(
          "_id title category startDate endDate location images"
        )
        .sort({
          startDate: 1,
        })
        .limit(3)
        .lean(),

      /*
      |--------------------------------------------------------------------------
      | Latest Notices
      |--------------------------------------------------------------------------
      */

      Notice.find({
        isActive: true,
        $or: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              $gte: currentDate,
            },
          },
        ],
      })
        .select(
          "_id title content category priority publishedAt expiresAt"
        )
        .sort({
          publishedAt: -1,
        })
        .limit(4)
        .lean(),
    ]);

    /*
    |--------------------------------------------------------------------------
    | Prepare response
    |--------------------------------------------------------------------------
    */

    const data = {
      events,
      notices,
    };

    /*
    |--------------------------------------------------------------------------
    | Save response in server memory
    |--------------------------------------------------------------------------
    */

    homeCache = data;
    homeCacheTime = Date.now();

    /*
    |--------------------------------------------------------------------------
    | Browser Cache
    |--------------------------------------------------------------------------
    */

    res.set(
      "Cache-Control",
      "public, max-age=30, stale-while-revalidate=60"
    );

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      cached: false,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CLEAR HOME CACHE
|--------------------------------------------------------------------------
|
| Future me jab admin:
|
| - Event create kare
| - Event update kare
| - Event delete kare
| - Notice create kare
| - Notice update kare
| - Notice delete kare
|
| tab cache clear kiya ja sakta hai.
|--------------------------------------------------------------------------
*/

const clearHomeCache = () => {
  homeCache = null;
  homeCacheTime = 0;
};

module.exports = {
  getHomeData,
  clearHomeCache,
};