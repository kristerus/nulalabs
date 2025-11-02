"use client";

import { useState } from "react";
import { Download, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  downloadArtifact,
  generateArtifactFilename,
  type DownloadFormat,
} from "@/lib/utils/downloadArtifact";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ArtifactDownloadButtonProps {
  artifactId: string;
  phase?: string;
  index?: number;
  variant?: "icon" | "button";
  className?: string;
}

type DownloadState = "idle" | "downloading" | "success" | "error";

export function ArtifactDownloadButton({
  artifactId,
  phase,
  index,
  variant = "icon",
  className,
}: ArtifactDownloadButtonProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");

  const handleDownload = async (format: DownloadFormat = "png") => {
    setDownloadState("downloading");

    try {
      const filename = generateArtifactFilename(phase, index);
      await downloadArtifact(artifactId, filename, format);

      setDownloadState("success");

      // Reset after 2 seconds
      setTimeout(() => {
        setDownloadState("idle");
      }, 2000);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadState("error");

      // Reset after 3 seconds
      setTimeout(() => {
        setDownloadState("idle");
      }, 3000);
    }
  };

  const getIcon = () => {
    switch (downloadState) {
      case "downloading":
        return <Loader2 size={16} className="animate-spin" />;
      case "success":
        return <Check size={16} />;
      case "error":
        return <AlertCircle size={16} />;
      default:
        return <Download size={16} />;
    }
  };

  const getButtonVariant = () => {
    switch (downloadState) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      default:
        return "ghost";
    }
  };

  if (variant === "icon") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={getButtonVariant()}
            size="icon"
            className={cn("h-8 w-8", className)}
            disabled={downloadState === "downloading"}
          >
            {getIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDownload("png")}>
            <Download size={14} className="mr-2" />
            Download PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("svg")}>
            <Download size={14} className="mr-2" />
            Download SVG
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={getButtonVariant()}
          size="sm"
          className={cn("gap-2", className)}
          disabled={downloadState === "downloading"}
        >
          {getIcon()}
          {downloadState === "downloading"
            ? "Downloading..."
            : downloadState === "success"
              ? "Downloaded!"
              : downloadState === "error"
                ? "Failed"
                : "Download"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("png")}>
          <Download size={14} className="mr-2" />
          Download PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("svg")}>
          <Download size={14} className="mr-2" />
          Download SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
