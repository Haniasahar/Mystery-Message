import { NextResponse } from "next/server";

export const ApiResponse = {
  success(message: string, data: any = {}, status: number = 200) {
    return NextResponse.json(
      { success: true, message, ...data },
      { status }
    );
  },

  error(message: string, status: number = 400, data: any = {}) {
    return NextResponse.json(
      { success: false, message, ...data },
      { status }
    );
  },
};
