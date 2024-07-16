import { StatusCodes } from "../models/IStatusCodes";

interface IApplicationError {
  Text: string;
  Code: string;
}

export class BaseApplicationError {
  /**
   * Internal server error
   */
  static InternalServerError: IApplicationError = {
    Text: "Internal server error",
    Code: `${StatusCodes.InternalServerError}`,
  };

  /**
   * The error message for ~ Method not allowed
   */
  static MethodNotAllowed: IApplicationError = {
    Text: "Method Not Allowed",
    Code: `${StatusCodes.MethodNotAllowed}`,
  };

  /**
   * The error message for ~ Missing Required Parameters
   */
  static MissingRequiredParameters: IApplicationError = {
    Text: "Missing Required Parameters",
    Code: `${StatusCodes.BadRequest}`,
  };
}

/**
 * The ApplicationError class
 */
export class ApplicationError extends BaseApplicationError {
  //#region User Errors

  /**
   * The error message for ~ User with specified User ID not found
   */
  static UserWithIdNotFound: IApplicationError = {
    Text: "User with specified User ID not found",
    Code: "USER_1000",
  };

  /**
   * The error message for ~ User with specified username not found
   */
  static UserWithUsernameNotFound: IApplicationError = {
    Text: "User with specified username not found",
    Code: "USER_1001",
  };

  /**
   * The error message for ~ User with specified token not found
   */
  static UserWithTokenNotFound: IApplicationError = {
    Text: "User with specified token not found",
    Code: "USER_1002",
  };

  /**
   * The error message for ~ User with specified email not found
   */
  static UserWithEmailNotFound: IApplicationError = {
    Text: "User with specified email not found",
    Code: "USER_1003",
  };

  /**
   * The error message for ~ User already exists
   */
  static UserAlreadyExists: IApplicationError = {
    Text: "User already exists",
    Code: "USER_1004",
  };

  /**
   * The error message for ~ User ID is required
   */
  static UserIdIsRequired: IApplicationError = {
    Text: "User ID is required",
    Code: "USER_1005",
  };

  /**
   * The error message for ~ User with specified email already exists
   */
  static UserWithEmailAlreadyExists: IApplicationError = {
    Text: "User with specified email already exists",
    Code: "USER_1006",
  };

  /**
   * The error message for ~ Username is required
   */
  static UsernameIsRequired: IApplicationError = {
    Text: "Username is required",
    Code: "USER_1007",
  };

  /**
   * The error message for ~ User with specified username already exists
   */
  static UserWithUsernameAlreadyExists: IApplicationError = {
    Text: "User with specified username already exists",
    Code: "USER_1008",
  };

  /**
   * The error message for ~ Failed to fetch users
   */
  static FailedToFetchUsers: IApplicationError = {
    Text: "Failed to fetch users",
    Code: "USER_1009",
  };

  /**
   * The error message for ~ Failed to fetch user
   */
  static FailedToFetchUser: IApplicationError = {
    Text: "Failed to fetch user",
    Code: "USER_1010",
  };

  /**
   * The error message for ~ Failed to create user
   */
  static FailedToCreateUser: IApplicationError = {
    Text: "Failed to create user",
    Code: "USER_1011",
  };

  /**
   * The error message for ~ Failed to update user
   */
  static FailedToUpdateUser: IApplicationError = {
    Text: "Failed to update user",
    Code: "USER_1012",
  };

  /**
   * The error message for ~ Failed to update username
   */
  static FailedToUpdateUsername: IApplicationError = {
    Text: "Failed to update username",
    Code: "USER_1013",
  };

  /**
   * The error message for ~ Failed to fetch user dashboard data
   */
  static FailedToFetchUserDashboardData: IApplicationError = {
    Text: "Failed to fetch user dashboard data",
    Code: "USER_1014",
  };

  /**
   * The error message for ~ User email is required
   */
  static UserEmailIsRequired: IApplicationError = {
    Text: "User email is required",
    Code: "USER_1015",
  };

  /**
   * The error message for ~ User email is not valid
   */
  static UserEmailIsNotValid: IApplicationError = {
    Text: "User email is not valid",
    Code: "USER_1016",
  };

  /**
   * The error message for ~ User signed up with third party social media
   */
  static UserSignedUpWithSocialMedia: IApplicationError = {
    Text: "User signed up with third party social media",
    Code: "USER_1017",
  };

  /**
   * The error message for ~ Failed to update user's points
   */
  static FailedToUpdateUserPoints: IApplicationError = {
    Text: "Failed to update user's points",
    Code: "USER_1018",
  };

  //#endregion

  //#region Referral Errors

  /**
   * The error message for ~ Failed to create referral
   */
  static FailedToCreateReferral: IApplicationError = {
    Text: "Failed to create referral",
    Code: "REFERRAL_1000",
  };

  //#endregion

  //#region Boosters Errors

  /**
   * The error message for ~ No free boosters available
   */
  static NoFreeBoosters: IApplicationError = {
    Text: "No free boosters available",
    Code: "BOOSTERS_1000",
  };

  //#endregion

  //#region Tasks Errors

  /**
   * The error message for ~ Telegram task already completed
   */
  static TelegramTaskAlreadyCompleted: IApplicationError = {
    Text: "Telegram task already completed",
    Code: "TASKS_1000",
  };

  /**
   * The error message for ~ Twitter task already completed
   */
  static TwitterTaskAlreadyCompleted: IApplicationError = {
    Text: "Twitter task already completed",
    Code: "TASKS_1001",
  };

  //#endregion

  //#region Level Errors

  /**
   * The error message for ~ Maximum level reached
   */
  static MaximumLevelReached: IApplicationError = {
    Text: "Maximum level reached",
    Code: "LEVEL_1000",
  };

  /**
   * The error message for ~ Invalid level request
   */
  static InvalidLevelRequested: IApplicationError = {
    Text: "Invalid level request",
    Code: "LEVEL_1001",
  };

  /**
   * The error message for ~ Not enough points to upgrade level
   */
  static NotEnoughPointsToUpgradeLevel: IApplicationError = {
    Text: "Not enough points to upgrade level",
    Code: "LEVEL_1002",
  };

  /**
   * The error message for ~ Failed to update user level
   */
  static FailedToUpdateUserLevel: IApplicationError = {
    Text: "Failed to update user level",
    Code: "LEVEL_1003",
  };

  //#endregion

  //#region Referal Errors

  /**
   * The error message for ~ Referral already claimed
   */
  static ReferralAlreadyClaimed: IApplicationError = {
    Text: "Referral already claimed",
    Code: "REFERRAL_1000",
  };

  /**
   * The error message for ~ Insufficient referral count
   */
  static InsufficientReferralCount: IApplicationError = {
    Text: "Insufficient referral count",
    Code: "REFERRAL_1001",
  };

    /**
     * The error message for ~ Invalid Referral Count
     */
    static InvalidReferralCount: IApplicationError = {
      Text: "Invalid Referral Count",
      Code: "REFERRAL_1002",
    }

  //#endregion
}
