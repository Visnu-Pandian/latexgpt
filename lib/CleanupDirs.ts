"use server"

import { rm, mkdir } from "fs/promises";
import { join } from "path";
import os from "os";

export async function cleanupDirs() {
  try {
    const uploadsDir = join(os.tmpdir(), "uploads");
    const downloadsDir = join(os.tmpdir(), "downloads");

    await mkdir(uploadsDir, { recursive: true });
    await mkdir(downloadsDir, { recursive: true });

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