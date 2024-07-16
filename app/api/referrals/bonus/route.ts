import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "@/app/models/IStatusCodes";
import { validateRequestMethod } from "../../services/reusable-services/requestMethodValidator";
import { claimReferralBonus } from "../../services/referralService";
import { customNextResponseError } from "../../utils/customNextResponseError";

export async function POST(req: NextRequest) {
  // Call the request validation method
  await validateRequestMethod(req, "POST");

  try {
    // Call the function to claim a referral bonus
    const operation = await claimReferralBonus(req);

    // If the operation fails, return an error
    if (operation.error) {
      return customNextResponseError(operation);
    }

    // Return the response
    return NextResponse.json(operation, { status: StatusCodes.Created });
  } catch(error) {
    // Return an error if the operation fails
    return NextResponse.json(
      { error },
      { status: StatusCodes.InternalServerError }
    );
  }
}
