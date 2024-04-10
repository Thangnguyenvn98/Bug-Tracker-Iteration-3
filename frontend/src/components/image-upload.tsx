/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "./ui/button";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
declare const cloudinary: any;

interface CloudinaryUploadError {
  message: string;
  // other properties...
}

interface CloudinaryUploadResult {
  event: string;
  info: {
    secure_url: string;
    // other properties...
  };
}
interface ImageUploadProps {
  onChange: (url: string) => void;
  // Defines the type for the onChange prop
  className?: string;
}
const CLOUDNAME = import.meta.env.VITE_CLOUDINARY_CLOUDNAME || "";
const UPLOADPRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  className = "",
}) => {
  const openCloudinaryWidget = () => {
    const myWidget = cloudinary.createUploadWidget(
      {
        cloudName: CLOUDNAME,
        uploadPreset: UPLOADPRESET,
      },
      (error: CloudinaryUploadError | null, result: CloudinaryUploadResult) => {
        if (!error && result && result.event === "success") {
          console.log("File uploaded successfully:", result.info);

          onChange(result.info.secure_url);
        }
      }
    );

    myWidget.open();
  };

  return (
    <div className={cn(className)}>
      <Button
        type="button"
        onClick={openCloudinaryWidget}
        className="bg-transparent hover:bg-transparent"
      >
        <Paperclip />
      </Button>
    </div>
  );
};
export default ImageUpload;
