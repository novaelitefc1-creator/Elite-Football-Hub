import { useRef, useState } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { useUpdatePlayer } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetPlayerDashboardSummaryQueryKey, getGetMyPlayerProfileQueryKey } from "@workspace/api-client-react";
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  playerId: number;
  label: string;
  fieldName: "passportUrl" | "govIdUrl";
  currentUrl: string | null | undefined;
  accept?: string;
}

export function DocumentUpload({ playerId, label, fieldName, currentUrl, accept = "image/*,.pdf" }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();
  const updatePlayer = useUpdatePlayer();

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await updatePlayer.mutateAsync(
        { id: playerId, data: { [fieldName]: response.objectPath } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetPlayerDashboardSummaryQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetMyPlayerProfileQueryKey() });
            setJustUploaded(true);
            setUploadError(null);
            setTimeout(() => setJustUploaded(false), 3000);
          },
          onError: () => {
            setUploadError("Saved upload but failed to update profile.");
          },
        }
      );
    },
    onError: (err) => {
      setUploadError(err.message ?? "Upload failed. Please try again.");
    },
  });

  const handleFile = async (file: File) => {
    setUploadError(null);
    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`File must be under ${maxSizeMB}MB.`);
      return;
    }
    await uploadFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const isUploaded = !!currentUrl || justUploaded;

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        data-testid={`input-file-${fieldName}`}
      />

      <div
        className={cn(
          "border border-white/10 transition-all duration-200",
          isDragging && "border-primary/60 bg-primary/5",
          isUploading && "opacity-75"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between p-4 bg-secondary/40">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 flex items-center justify-center",
              isUploaded ? "bg-primary/10" : "bg-white/5"
            )}>
              {isUploading ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : isUploaded ? (
                <CheckCircle className="w-4 h-4 text-primary" />
              ) : (
                <FileText className="w-4 h-4 text-white/40" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isUploading
                  ? "Uploading..."
                  : isUploaded
                  ? "Document on file"
                  : "PDF or image, max 10MB"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUploaded && currentUrl && (
              <a
                href={`/api/storage${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`link-view-${fieldName}`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs font-bold uppercase tracking-wider rounded-none border border-white/10 hover:border-primary/40 hover:text-primary"
                  disabled={isUploading}
                >
                  <Eye className="w-3 h-3 mr-1.5" /> View
                </Button>
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 px-3 text-xs font-bold uppercase tracking-wider rounded-none",
                isUploaded
                  ? "border-white/10 hover:border-primary/40"
                  : "border-primary/40 text-primary hover:bg-primary/5"
              )}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              data-testid={`button-upload-${fieldName}`}
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Upload className="w-3 h-3 mr-1.5" />
                  {isUploaded ? "Replace" : "Upload"}
                </>
              )}
            </Button>
          </div>
        </div>

        {isUploading && (
          <div className="px-4 pb-3 pt-1">
            <Progress value={progress} className="h-1 bg-white/5" />
            <p className="text-xs text-muted-foreground mt-1.5">{progress}% uploaded</p>
          </div>
        )}

        {justUploaded && (
          <div className="px-4 pb-3 pt-1 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="w-3 h-3" /> Document saved successfully
          </div>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider px-1" data-testid={`error-${fieldName}`}>
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {uploadError}
        </div>
      )}
    </div>
  );
}
