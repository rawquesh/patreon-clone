import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.patreon-clone.app&hl=en";

// Placeholder until App Store link is available
const IOS_URL = "https://apps.apple.com/app/idXXXXXXXXXX";

export function GET(request: Request) {
  const userAgent = request.headers.get("user-agent") || "";
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /(iPhone|iPad|iPod)/i.test(userAgent);

  const destination = isAndroid ? ANDROID_URL : isIOS ? IOS_URL : ANDROID_URL;
  return NextResponse.redirect(destination, { status: 302 });
}
