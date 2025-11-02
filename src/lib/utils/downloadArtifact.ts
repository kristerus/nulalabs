import { toPng, toSvg } from "html-to-image";

export type DownloadFormat = "png" | "svg";

/**
 * Download an artifact (visualization) as an image file
 * @param elementId - The DOM element ID to capture
 * @param filename - The filename for the download (without extension)
 * @param format - The image format ('png' or 'svg')
 */
export async function downloadArtifact(
  elementId: string,
  filename: string,
  format: DownloadFormat = "png"
): Promise<void> {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    let dataUrl: string;

    // Convert element to image
    if (format === "png") {
      dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2, // Higher quality (2x resolution)
        backgroundColor: "#ffffff", // White background
      });
    } else {
      dataUrl = await toSvg(element, {
        backgroundColor: "#ffffff",
      });
    }

    // Create download link
    const link = document.createElement("a");
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to download artifact:", error);
    throw new Error(`Failed to download artifact: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate a filename for an artifact based on phase and timestamp
 * @param phase - The analysis phase name
 * @param index - Optional index for multiple artifacts in same phase
 */
export function generateArtifactFilename(phase?: string, index?: number): string {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const phaseName = phase
    ? phase.toLowerCase().replace(/\s+/g, "-")
    : "artifact";
  const indexSuffix = index !== undefined ? `-${index + 1}` : "";

  return `${phaseName}${indexSuffix}-${timestamp}`;
}

/**
 * Download multiple artifacts as individual files
 * @param artifacts - Array of artifact elements with metadata
 */
export async function downloadAllArtifacts(
  artifacts: Array<{ elementId: string; phase?: string; index?: number }>,
  format: DownloadFormat = "png"
): Promise<void> {
  for (const artifact of artifacts) {
    try {
      const filename = generateArtifactFilename(artifact.phase, artifact.index);
      await downloadArtifact(artifact.elementId, filename, format);

      // Small delay between downloads to avoid browser blocking
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to download artifact ${artifact.elementId}:`, error);
      // Continue with other artifacts even if one fails
    }
  }
}

/**
 * Copy artifact to clipboard as image
 * @param elementId - The DOM element ID to capture
 */
export async function copyArtifactToClipboard(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    // Convert to PNG blob
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
  } catch (error) {
    console.error("Failed to copy artifact to clipboard:", error);
    throw new Error(
      `Failed to copy to clipboard: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
