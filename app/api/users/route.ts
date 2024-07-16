import { NextRequest, NextResponse } from "next/server";
import { customNextResponseError } from "../utils/customNextResponseError";
import { StatusCodes } from "@/app/models/IStatusCodes";
import { validateRequestMethod } from "../services/reusable-services/requestMethodValidator";
import { ApplicationError } from "@/app/constants/applicationError";
import { createUser, fetchUsers } from "../services/usersService";

export async function GET(req: NextRequest) {
  // Call the request validation method
  await validateRequestMethod(req, "GET");

  try {
    // Call the function to fetch users
    const operation = await fetchUsers(req);

    // If the operation fails, return an error
    if (operation.error) {
      return customNextResponseError(operation);
    }

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

export async function POST(req: NextRequest) {
  // Call the request validation method
  await validateRequestMethod(req, "POST");

  try {
    // Call the createUser function
    const operation = await createUser(req);

    // If the operation fails, return an error
    if (operation.error) { 
      return customNextResponseError(operation);
    }

    // Return the response
    return NextResponse.json(operation, { status: StatusCodes.Created });
  } catch(error) {
    console.log("🚀 ~ POST ~ error:", error);
    // Return an error if the operation fails
    return NextResponse.json(
      { error },
      { status: StatusCodes.InternalServerError }
    );
  }
}

// export async function PUT(req: NextRequest) {
//   // Call the request validation method
//   await validateRequestMethod(req, "PUT");

//   try {
//     // Call the updateUser function
//     const operation = await updateUser(req);

//     // If the operation fails, return an error
//     if (operation.error) {
//       return customNextResponseError(operation);
//     }

//     // Return the response
//     return NextResponse.json(operation.data, { status: StatusCodes.Success });
//   } catch {
//     // Return an error if the operation fails
//     return NextResponse.json(
//       { error: ApplicationError.FailedToUpdateUser.Text },
//       { status: StatusCodes.InternalServerError }
//     );
//   }
// }