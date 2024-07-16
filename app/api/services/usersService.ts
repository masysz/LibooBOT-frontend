import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { ApplicationError } from "@/app/constants/applicationError";
import { StatusCodes } from "@/app/models/IStatusCodes";
import { UserProfileInformation } from "@/app/models/IUser";
import { PointsUpdateRequest } from "@/app/models/IPoints";
import { Task } from "@/app/enums/ITask";
import { MultiLevelRequest } from "@/app/models/ILevel";
import { levels } from "@/app/constants/levels";
import { dailyBoostLimit } from "@/app/constants/user";

export async function createUser(req: NextRequest) {
  // Get the body of the request
  const request = (await req.json()) as UserProfileInformation;

  // Check if all required fields are provided
  if (!request.userId || !request.username) {
    return {
      error: ApplicationError.MissingRequiredParameters.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // Check if user already exists
  const user = await prisma.users.findUnique({
    where: {
      userId: request.userId,
    },
  });

  // If user exists, return message
  if (user) {
    return { user };
  }

  // If user does not exist, create a new user...
  const newUser = await prisma.users.create({
    data: {
      userId: `${request.userId}`,
      username: request.username,
      referralCode: `${request.username}${request.userId}`,
    },
  });

  // Return the response
  return { newUser };
}

export async function fetchUsers(req: NextRequest) {
  // Get the search params from the request url
  const searchParams = new URLSearchParams(req.url.split("?")[1]);

  // Get the userId from the search params
  const userId = searchParams.get("userId");

  // If a userId is provided, find the user with that id
  if (userId) {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    // If user is not found, return 404
    if (!user) {
      return {
        error: ApplicationError.UserWithIdNotFound.Text,
        errorCode: ApplicationError.UserWithIdNotFound.Code,
        statusCode: StatusCodes.NotFound,
      };
    }

    // If user is found, return it
    return { data: user };
  }

  // Fetch all users
  const users = await prisma.users.findMany({
    orderBy: {
      points: "desc",
    },
  });

  // Return all users
  return { data: users };
}

export async function updateUserPoints(req: NextRequest) {
  // Get the body of the request
  const request = (await req.json()) as PointsUpdateRequest;

  // Check if all required fields are provided
  if (!request.userId) {
    return {
      error: ApplicationError.MissingRequiredParameters.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // Check if user exists
  const user = await prisma.users.findUnique({
    where: {
      userId: request.userId,
    },
  });

  // If user does not exists, return error
  if (!user) {
    return {
      error: ApplicationError.UserWithIdNotFound.Text,
      errorCode: ApplicationError.UserWithIdNotFound.Code,
      statusCode: StatusCodes.NotFound,
    };
  }

  // If a specific task was provided, check if the task has not been done yet
  if (request.task) {
    const specifiedTask = request.task;

    // If the specified task is telegram
    if (specifiedTask === Task.TELEGRAM) {
      // If the user has done the task, show error
      if (user.telegramTaskDone) {
        return {
          error: ApplicationError.TelegramTaskAlreadyCompleted.Text,
          errorCode: ApplicationError.TelegramTaskAlreadyCompleted.Code,
          statusCode: StatusCodes.BadRequest,
        };
      }

      // if we get here, it means the user has not done the task...

      // increment the user's points
      await incrementUserPoints(request.points, request.userId, user.points);

      // update the user's telegram task status
      await prisma.users.update({
        where: {
            userId: request.userId,
        },
        data: {
          telegramTaskDone: true,
        },
      });
    }

    // If the specified task is twitter and the user has done the task, show error
    if (specifiedTask === Task.TWITTER) {
      // If the user has done the task, show error
      if (user.twitterTaskDone) {
        return {
          error: ApplicationError.TwitterTaskAlreadyCompleted.Text,
          errorCode: ApplicationError.TwitterTaskAlreadyCompleted.Code,
          statusCode: StatusCodes.BadRequest,
        };
      }

      // if we get here, it means the user has not done the task...

      // increment the user's points
      await incrementUserPoints(request.points, request.userId, user.points);

      // update the user's telegram task status
      await prisma.users.update({
        where: {
            userId: request.userId,
        },
        data: {
          twitterTaskDone: true,
        },
      });
    }

    // Return the response
    return { message: "Successfully updated user's point & task status" };
  }

  // Update the user's points
  const updatedUser = await prisma.users.update({
    where: {
        userId: request.userId,
    },
    data: {
      points: request.points,
    },
  });

  // Return the response
  return { message: "Successfully updated user's point", data: updatedUser };
}

async function fetchUserByUserId(userId: string) {
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  // If user is not found, return 404
  if (!user) {
    return {
      error: ApplicationError.UserWithIdNotFound.Text,
      errorCode: ApplicationError.UserWithIdNotFound.Code,
      statusCode: StatusCodes.NotFound,
    };
  }

  // If user is found, return it
  return { user };
}

export async function fetchLeaderboard(req: NextRequest) {
  // Fetch all users
  const users = await prisma.users.findMany({
    orderBy: {
      // order by points in descending order
      points: "desc",
    },
  });

  // Return all users
  return { data: users };
}

export async function updateFreeDailyBoosters(req: NextRequest) {
  // Use search params to get the userId
  const searchParams = new URLSearchParams(req.url.split("?")[1]);

  const userId = searchParams.get("userId");

  const mode = searchParams.get("mode");

  // Check if all required fields are provided
  if (!userId) {
    return {
      error: ApplicationError.MissingRequiredParameters.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // Check if user exists
  const user = await prisma.users.findUnique({
    where: {
        userId: userId,
    },
  });

  // If user exists, return error
  if (!user) {
    return {
      error: ApplicationError.UserWithIdNotFound.Text,
      errorCode: ApplicationError.UserWithIdNotFound.Code,
      statusCode: StatusCodes.NotFound,
    };
  }

  if (mode === "fetch") {
    // If the expiration date is in the past, reset the user's free daily boosters
    if (
      (user.dailyBoostersExp && user.dailyBoostersExp < new Date()) ||
      user.dailyFreeBoosters > dailyBoostLimit
    ) {
      const updatedUser = await prisma.users.update({
        where: {
            userId: userId,
        },
        data: {
          dailyFreeBoosters: dailyBoostLimit,
          dailyBoostersExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return {
        message: "Successfully updated user's free daily boosters",
        data: updatedUser,
      };
    } else {
      return {
        message: "Successfully fetched user's free daily boosters",
        data: user,
      };
    }
  }

  // if we are updating the user's free daily boosters...

  // Check if user has no free daily boosters and the expiration date is in the future
  if (
    user.dailyFreeBoosters <= 0 &&
    user.dailyBoostersExp &&
    user.dailyBoostersExp > new Date()
  ) {
    // We can not give the user more free daily boosters today
    return {
      error: ApplicationError.NoFreeBoosters.Text,
      errorCode: ApplicationError.NoFreeBoosters.Code,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // Update the user's free daily boosters and expiration date
  const updatedUser = await prisma.users.update({
    where: {
        userId: userId,
    },
    data: {
      dailyFreeBoosters: {
        decrement: 1,
      },
      // set the expiration date to 24 hours from now if it is not set or if it is set to a date in the past
      dailyBoostersExp:
        user.dailyBoostersExp && user.dailyBoostersExp > new Date()
          ? user.dailyBoostersExp
          : new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Return the response
  return {
    message: "Successfully updated user's free daily boosters",
    data: updatedUser,
  };
}

export async function updateBoostRefillEndTime(req: NextRequest) {
  // Use search params to get the userId
  const searchParams = new URLSearchParams(req.url.split("?")[1]);

  const userId = searchParams.get("userId");

  const refillEndTime = searchParams.get("refillEndTime");

  // Check if all required fields are provided
  if (!userId || !refillEndTime) {
    return {
      error: ApplicationError.MissingRequiredParameters.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // Check if user exists
  const user = await prisma.users.findUnique({
    where: {
        userId: userId,
    },
  });

  // If user exists, return error
  if (!user) {
    return {
      error: ApplicationError.UserWithIdNotFound.Text,
      errorCode: ApplicationError.UserWithIdNotFound.Code,
      statusCode: StatusCodes.NotFound,
    };
  }

  // Update the user's boost refill time
  const updatedUser = await prisma.users.update({
    where: {
        userId: userId,
    },
    data: {
      boostRefillEndTime: new Date(refillEndTime),
    },
  });

  // Return the response
  return {
    message: "Successfully updated user's boost refill end time",
    data: updatedUser,
  };
}

export async function fetchBoostRefillEndTime(req: NextRequest) {
  // Use search params to get the userId
  const searchParams = new URLSearchParams(req.url.split("?")[1]);

  const userId = searchParams.get("userId");

  // Check if all required fields are provided
  if (!userId) {
    return {
      error: ApplicationError.MissingRequiredParameters.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // Check if user exists
  const user = await prisma.users.findUnique({
    where: {
        userId: userId,
    },
  });

  // If user exists, return error
  if (!user) {
    return {
      error: ApplicationError.UserWithIdNotFound.Text,
      errorCode: ApplicationError.UserWithIdNotFound.Code,
      statusCode: StatusCodes.NotFound,
    };
  }

  // Return the response
  return {
    message: "Successfully fetched user's boost refill end time",
    data: user,
  };
}

async function incrementUserPoints(
  points: number,
  userId: string,
  currentPoints: number
) {
  await prisma.users.update({
    where: {
        userId: userId,
    },
    data: {
      points: currentPoints + points,
    },
  });
}

export async function updateUserLevel(req: NextRequest) {
  // Get the body of the request
  const request = (await req.json()) as MultiLevelRequest;

  // Check if all required fields are provided
  if (!request.userId) {
    return {
      error: ApplicationError.MissingRequiredParameters.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // Check if user exists
  const user = await prisma.users.findUnique({
    where: {
        userId: request.userId,
    },
  });

  // If user does not exists, return error
  if (!user) {
    return {
      error: ApplicationError.UserWithIdNotFound.Text,
      errorCode: ApplicationError.UserWithIdNotFound.Code,
      statusCode: StatusCodes.NotFound,
    };
  }

  // get the user's current level
  const currentLevel = user.level;

  // define the maximum level
  const maximumLevel = 10;

  // If the user's level is already at the maximum level, return error
  if (currentLevel >= maximumLevel) {
    return {
      error: ApplicationError.MaximumLevelReached.Text,
      errorCode: ApplicationError.MaximumLevelReached.Code,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // initialize the requested level
  const requestedLevel = levels.find((level) => level.level === request.level);

  // If the level requested is not valid, return error
  if (!requestedLevel) {
    return {
      error: ApplicationError.InvalidLevelRequested.Text,
      errorCode: ApplicationError.InvalidLevelRequested.Code,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // initialize the level fee
  const requestedLevelFee = requestedLevel.fee;

  console.log("🚀 ~ updateUserLevel ~ requestedLevelFee:", requestedLevelFee);
  console.log("🚀 ~ updateUserLevel ~ points:", user.points);

  // Check if the user's points are enough to level up
  if (user.points < requestedLevelFee) {
    return {
      error: ApplicationError.NotEnoughPointsToUpgradeLevel.Text,
      errorCode: ApplicationError.NotEnoughPointsToUpgradeLevel.Code,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // Update the user's level and deduct the level fee from the user's points
  const updatedUser = await prisma.users.update({
    where: {
        userId: request.userId,
    },
    data: {
      level: request.level,
      points: {
        decrement: requestedLevelFee,
      },
    },
  });

  // Return the response
  return { message: "Successfully updated user's level", data: updatedUser };
}
