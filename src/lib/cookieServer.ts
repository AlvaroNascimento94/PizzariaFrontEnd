import { cookies } from "next/headers";

export async function getCookieServer(){
    const token = (await cookies()).get("session")?.value;
    return token || null;
}