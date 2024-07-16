'use server'
import { UserProfileInformation } from "@/app/models/IUser";
import { prisma } from "@/lib/prisma";


export async function fetchUserFromDb(userId: string): Promise<UserProfileInformation> {    

    // Fetch a user by userId
    const user = await prisma.users.findFirst({
        where: {
            userId: userId,
        },
    });

    return user as UserProfileInformation;
}