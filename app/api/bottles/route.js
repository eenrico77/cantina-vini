import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("bottles")
    .select(`
      id,
      year,
      quantity,
      wines (
        id,
        name,
        producer
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(data);
}