import api from "./api";

/*
|--------------------------------------------------------------------------
| Get Homepage Data
|--------------------------------------------------------------------------
|
| Single API request:
|
| GET /api/v1/home
|
| Backend is request me:
| - Upcoming Events
| - Latest Notices
|
| dono data ek saath return karega.
|--------------------------------------------------------------------------
*/

export const getHomeData = async () => {
  const response = await api.get("/home");

  return response;
};