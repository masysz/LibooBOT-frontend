import { NextRequest, NextResponse } from "next/server";
import { validateRequestMethod } from "../services/reusable-services/requestMethodValidator";
import { customNextResponseError } from "../utils/customNextResponseError";
import { StatusCodes } from "@/app/models/IStatusCodes";
import { ApplicationError } from "@/app/constants/applicationError";
import { updateUserPoints } from "../services/usersService";

export async function POST(req: NextRequest) {
    // Call the request validation method
    await validateRequestMethod(req, "POST");
  
    try {
      // Call the update user points function
      const operation = await updateUserPoints(req);
  
      // If the operation fails, return an error
      if (operation.error) { 
        return customNextResponseError(operation);
      }
  
      // Return the response
      return NextResponse.json(operation, { status: StatusCodes.Created });
    } catch {
      // Return an error if the operation fails
      return NextResponse.json(
        { error: ApplicationError.FailedToUpdateUserPoints.Text },
        { status: StatusCodes.InternalServerError }
      );
    }
  }