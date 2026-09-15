import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// GET /api/documents - fetch all documents
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ documents: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST /api/documents - upload file and save document record using service role (bypasses storage RLS)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "";
    const category = (formData.get("category") as string) || "Grade / Transcript";
    const description = (formData.get("description") as string) || "";
    const isPublic = formData.get("is_public") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Ensure documents bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === "documents");
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket("documents", { public: true });
    }

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `uploads/${timestamp}_${sanitizedName}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("documents")
      .getPublicUrl(storagePath);

    const fileUrl = urlData.publicUrl;

    // Insert metadata into documents table
    const { data: insertedDoc, error: insertError } = await supabaseAdmin
      .from("documents")
      .insert({
        title: title.trim(),
        description: description.trim(),
        category,
        file_url: fileUrl,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        is_public: isPublic,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: `Database save failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ document: insertedDoc });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/documents - delete file from storage and database
export async function DELETE(request: Request) {
  try {
    const { id, storage_path } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    // Delete from storage
    if (storage_path) {
      await supabaseAdmin.storage.from("documents").remove([storage_path]);
    }

    // Delete from database
    const { error } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
