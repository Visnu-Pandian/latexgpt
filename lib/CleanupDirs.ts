"use server"

import { rm } from "fs/promises";
import { join } from "path";

export async function cleanupDirs() {
  try {
    const uploadsDir = join(process.cwd(), "public", "files", "uploads");
    const downloadsDir = join(process.cwd(), "public", "files", "downloads");

    // Clean uploads directory
    try {
      await rm(uploadsDir, { recursive: true, force: true });
      console.log("✓ Cleaned uploads directory");
    } catch (err) {
      console.log("ℹ Uploads directory cleanup skipped (may not exist)");
    }

    // Clean downloads directory
    try {
      await rm(downloadsDir, { recursive: true, force: true });
      console.log("✓ Cleaned downloads directory");
    } catch (err) {
      console.log("ℹ Downloads directory cleanup skipped (may not exist)");
    }

    // Recreate directories
    await import("fs/promises").then((fs) => {
      fs.mkdir(uploadsDir, { recursive: true });
      fs.mkdir(downloadsDir, { recursive: true });
    });

    console.log("✓ Recreated clean directories");
  } catch (error) {
    console.error("Error during directory cleanup:", error);
  }
}