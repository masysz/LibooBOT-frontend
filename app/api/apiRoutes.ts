/**
 * The API routes endpoints
 */
export class ApiRoutes {
  /**
   * The dev base url for the application
   */
  static BASE_URL_DEV: string = "http://localhost:4040/";
  // static BASE_URL_DEV: string = "http://192.168.1.226:4040/";

  /**
   * The test base url for the application
   */
  static BASE_URL_TEST: string = "https://buffy-clicker.netlify.app/";

  /**
   * The live base url for the application
   */
  static BASE_URL_LIVE: string = "https://buffy-clicker.netlify.app/";

  /**
   * The route to Users endpoint
   */
  static Users: string = "api/users";

  /**
   * The route to Users Daily Boosts endpoint
   */
  static UsersDailyBoosts: string = "api/users/dailyboosts";

  /**
   * The route to Users Multitap endpoint
   */
  static UsersMultiLevels: string = "api/users/multilevels";

  /**
   * The route to Boost Refill End Time endpoint
   */
  static UsersBoostRefillEndTime: string = "api/users/boost-refill";

  /**
   * The route to Points endpoint
   */
  static Points: string = "api/points";

  /**
   * The route to Referral endpoint
   */
  static Referrals: string = "api/referrals";

  /**
   * The route to Referral bonus endpoint
   */
  static ReferralBonus: string = "api/referrals/bonus";

  /**
   * The route to Leaderboard endpoint
   */
  static Leaderboard: string = "api/leaderboard";
}
