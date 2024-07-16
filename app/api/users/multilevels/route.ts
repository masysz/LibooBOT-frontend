import { NextRequest, NextResponse } from "next/server";
import { validateRequestMethod } from "../../services/reusable-services/requestMethodValidator";
import { updateUserLevel } from "../../services/usersService";
import { customNextResponseError } from "../../utils/customNextResponseError";
import { StatusCodes } from "@/app/models/IStatusCodes";
import { ApplicationError } from "@/app/constants/applicationError";

export async function POST(req: NextRequest) {
    // Call the request validation method
    await validateRequestMethod(req, "POST");
  
    try {
      // Call the updateUserLevel method
      const operation = await updateUserLevel(req);
  
      // If the operation fails, return an error
      if (operation.error) { 
        return customNextResponseError(operation);
      }
  
      // Return the response
      return NextResponse.json(operation, { status: StatusCodes.Success });
    } catch {
      // Return an error if the operation fails
      return NextResponse.json(
        { error: ApplicationError.FailedToUpdateUserLevel.Text },
        { status: StatusCodes.InternalServerError }
      );
    }
  }