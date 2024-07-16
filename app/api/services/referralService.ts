import { ApplicationError } from "@/app/constants/applicationError";
import { referralMetrics } from "@/app/constants/referralMetrics";
import {
  BonusClaimRequest,
  ReferralCreationRequest,
} from "@/app/models/IReferral";
import { StatusCodes } from "@/app/models/IStatusCodes";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function fetchReferrals(req: NextRequest) {
  // Get the search params from the request url
  const searchParams = new URLSearchParams(req.url.split("?")[1]);

  // Get the userId from the search params
  const userId = searchParams.get("userId") as string;

  // if userid is not provided, return 400
  if (!userId) {
    return {
      error: ApplicationError.MissingRequiredParameters.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // If a userId is provided, find the user with that id
  const user = await prisma.users.findUnique({
    where: {
      userId: userId,
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

  // Get all referrals for the user
  const referrals = await prisma.referrals.findMany({
    where: {
      userId: userId,
    },
  });

  // Return all users
  return { data: referrals };
}

export async function createReferral(req: NextRequest) {
  // Get the body from the request
  const request = (await req.json()) as ReferralCreationRequest;

  // if referralId or username is not provided, return 400
  if (!request.referrerId || !request.userId) {
    return {
      error: ApplicationError.MissingRequiredParameters.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  const referrerId = request.referrerId; // The id of the user who referred the new user
  const userId = request.userId; // The new user's userId

  // If a referrerId is provided, find the user with that id
  const user = await prisma.users.findUnique({
    where: {
      referralCode: referrerId,
    },
  });

  // If a userId is provided, find the user with that userId
  const referredUser = await prisma.users.findUnique({
    where: {
      userId: userId,
    },
  });

  // If user or referredUser is not found, return 404
  if (!user || !referredUser) {
    return {
      error: ApplicationError.UserWithIdNotFound.Text,
      errorCode: ApplicationError.UserWithIdNotFound.Code,
      statusCode: StatusCodes.NotFound,
    };
  }

  // Create a referral record for the user, and update the points and referral count for the referrer
  await prisma.$transaction([
    prisma.referrals.create({
      data: {
        userId: user.userId,
        referredId: referredUser.userId,
      },
    }),
    prisma.users.update({
      where: {
        userId: user.userId,
      },
      data: {
        points: {
          increment: 1000,
        },
        referralCount: {
          increment: 1,
        },
      },
    }),
  ]);

  // Return the response
  return { message: "Referral created successfully" };
}

export async function claimReferralBonus(req: NextRequest) {
  // Get the body from the request
  const request = (await req.json()) as BonusClaimRequest;

  // if userId is not provided, return 400
  if (!request.userId || !request.referralCount) {
    return {
      error: ApplicationError.MissingRequiredParameters.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  const userId = request.userId;
  const referralCount = request.referralCount;

  // If a userId is provided, find the user with that id
  const user = await prisma.users.findUnique({
    where: {
      userId,
    },
  });

  // If user or referredUser is not found, return 404
  if (!user) {
    return {
      error: ApplicationError.UserWithIdNotFound.Text,
      errorCode: ApplicationError.UserWithIdNotFound.Code,
      statusCode: StatusCodes.NotFound,
    };
  }

  // check if the user has up to the referral count
  if (user.referralCount < referralCount) {
    return {
      error: ApplicationError.InsufficientReferralCount.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // check if the user has claimed the bonus for the referral count

  // Get the equivalent bonus for the referral count provided
  const equivBonus = referralMetrics.find(
    (metric) => metric.friends == referralCount
  );

  if(!equivBonus) {
    return {
      error: ApplicationError.InvalidReferralCount.Text,
      statusCode: StatusCodes.BadRequest,
    };
  }

  // Update the referredUser's points and set the referredBonusClaimed flag to true
  await prisma.$transaction([
    prisma.users.update({
      where: {
        userId: userId,
      },
      data: {
        points: {
          increment: equivBonus?.bonus || 0,
        },
        highestReferralBonusClaimed: referralCount,
      },
    }),
  ]);

  // Return the response
  return { message: "Referral bonus claimed successfully" };
}
