import { NextRequest, NextResponse } from "next/server";
import { validateRequestMethod } from "../services/reusable-services/requestMethodValidator";
import { fetchLeaderboard } from "../services/usersService";
import { customNextResponseError } from "../utils/customNextResponseError";
import { StatusCodes } from "@/app/models/IStatusCodes";
import { ApplicationError } from "@/app/constants/applicationError";

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    // Call the request validation method
    await validateRequestMethod(req, "GET");
  
    try {
      // Call the function to fetch leaderboard
      const operation = await fetchLeaderboard(req);
  
      // Return the response
      return NextResponse.json(operation.data, { status: StatusCodes.Success });
    } catch {
      // Return an error if the operation fails
      return NextResponse.json(
        { error: ApplicationError.FailedToFetchUsers.Text },
        { status: StatusCodes.InternalServerError }
      );
    }
  }