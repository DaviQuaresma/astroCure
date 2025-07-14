import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const description = formData.get("description");
  const group = formData.get("group");
  const files = formData.getAll("videos");

  console.log("📦 Vídeos recebidos:", files.length);
  console.log("📝 Descrição:", description);
  console.log("👥 Grupo:", group);

  return NextResponse.json({
    message: `Mock OK – ${files.length} vídeo(s) recebidos.`,
  });
}
