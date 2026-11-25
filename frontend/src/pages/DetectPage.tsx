import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Activity,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import type {
  ImageDetectionResponse,
  VideoDetectionResponse,
} from "@/types/detection";

type Mode = "image" | "video";

export function DetectPage() {
  const [mode, setMode] = useState<Mode>("image");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const imageMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const form = new FormData();
      form.append("file", uploadFile);

      const res = await api.post<ImageDetectionResponse>(
        "/detect/image",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return res.data;
    },
  });

  const videoMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const form = new FormData();
      form.append("file", uploadFile);

      const res = await api.post<VideoDetectionResponse>(
        "/detect/video?sample_every_n_frames=30",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return res.data;
    },
  });

  const handleFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(null);
    imageMutation.reset();
    videoMutation.reset();

    if (mode === "image") {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDetect = () => {
    if (!file) return;

    if (mode === "image") {
      imageMutation.mutate(file);
    } else {
      videoMutation.mutate(file);
    }
  };

  const isLoading =
    imageMutation.isPending || videoMutation.isPending;

  const imageResult = imageMutation.data;
  const videoResult = videoMutation.data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Object Detection
        </h1>
        <p className="text-muted-foreground mt-2">
          Analyze images and videos using AI-powered object detection
          and temporal intelligence.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-3">
        <Button
          variant={mode === "image" ? "default" : "outline"}
          onClick={() => {
            setMode("image");
            setFile(null);
            setPreview(null);
            imageMutation.reset();
            videoMutation.reset();
          }}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Image
        </Button>

        <Button
          variant={mode === "video" ? "default" : "outline"}
          onClick={() => {
            setMode("video");
            setFile(null);
            setPreview(null);
            imageMutation.reset();
            videoMutation.reset();
          }}
        >
          <Video className="h-4 w-4 mr-2" />
          Video
        </Button>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "image" ? "Upload Image" : "Upload Video"}
          </CardTitle>
          <CardDescription>
            {mode === "image"
              ? "Select an image for object detection."
              : "Select a video for frame-based analysis and event reasoning."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-dashed p-8 text-center space-y-4">
            <div className="flex justify-center">
              {mode === "image" ? (
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              ) : (
                <Video className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Select a {mode} file from your computer
            </p>

            <input
              type="file"
              accept={
                mode === "image"
                  ? "image/*"
                  : "video/*"
              }
              className="block mx-auto max-w-full text-sm"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {file && (
            <div className="rounded-lg border p-3 flex flex-col gap-2">
              <p className="font-medium break-all">
                {file.name}
              </p>

              <p className="text-sm text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>

              <Badge variant="secondary" className="w-fit">
                {mode === "image" ? "Image selected" : "Video selected"}
              </Badge>
            </div>
          )}

          {mode === "image" && preview && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={preview}
                alt="Uploaded preview"
                className="w-full max-h-[500px] object-contain"
              />
            </div>
          )}

          <Button
            className="w-full"
            disabled={!file || isLoading}
            onClick={handleDetect}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Run Detection
              </>
            )}
          </Button>
        </CardContent>
      </Card>      {/* Error Display */}
      {(imageMutation.isError || videoMutation.isError) && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-semibold">Detection Failed</p>
              <p className="text-sm text-muted-foreground">
                {(imageMutation.error || videoMutation.error) instanceof Error
                  ? (imageMutation.error || videoMutation.error)?.message
                  : "Something went wrong while processing the file."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Results */}
      {mode === "image" && imageResult && (
        <Card>
          <CardHeader>
            <CardTitle>Image Detection Results</CardTitle>
            <CardDescription>
              Objects detected in the uploaded image.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Objects Detected
                </p>
                <p className="text-2xl font-bold">
                  {imageResult.total_objects}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Inference Time
                </p>
                <p className="text-2xl font-bold">
                  {imageResult.inference_time_ms} ms
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Model
                </p>
                <p className="font-bold break-all">
                  {imageResult.model_used}
                </p>
              </div>
            </div>

            {imageResult.classes_found?.length > 0 && (
              <div>
                <p className="font-medium mb-2">
                  Detected Categories
                </p>

                <div className="flex flex-wrap gap-2">
                  {imageResult.classes_found.map((cls, index) => (
                    <Badge key={index} variant="secondary">
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {imageResult.detections?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">
                  Detection Details
                </h3>

                {imageResult.detections.map((detection, index) => (
                  <div
                    key={detection.id ?? index}
                    className="border rounded-lg p-3 flex flex-wrap justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium">
                        {detection.detection_class}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Detection #{detection.id ?? index + 1}
                      </p>
                    </div>

                    <Badge variant="outline">
                      {(detection.confidence * 100).toFixed(1)}% confidence
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {imageResult.detections?.length === 0 && (
              <p className="text-muted-foreground">
                No objects were detected.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Video Results */}
      {mode === "video" && videoResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Video Intelligence
            </CardTitle>

            <CardDescription>
              Frame analysis and temporal event observations.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Total Detections
                </p>
                <p className="text-2xl font-bold">
                  {videoResult.total_detections}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Frames Processed
                </p>
                <p className="text-2xl font-bold">
                  {videoResult.total_frames_processed}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Processing Time
                </p>
                <p className="text-2xl font-bold">
                  {videoResult.inference_time_ms} ms
                </p>
              </div>
            </div>

            {/* Video Summary */}
            {videoResult.reasoning_summary && (
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">
                  Intelligence Summary
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {videoResult.reasoning_summary}
                </p>
              </div>
            )}

            {/* Events */}
            {videoResult.reasoning_events &&
              videoResult.reasoning_events.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">
                    Observed Events
                  </h3>

                  {videoResult.reasoning_events.map((event, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {event.event_type}
                        </Badge>

                        <Badge variant="outline">
                          {event.object}
                        </Badge>

                        {event.confidence !== undefined && (
                          <Badge variant="outline">
                            {(event.confidence * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </div>

                      {event.explanation && (
                        <p className="text-sm text-muted-foreground">
                          {event.explanation}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {event.observations !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Observations
                            </p>
                            <p className="font-medium">
                              {event.observations}
                            </p>
                          </div>
                        )}

                        {event.duration_frames !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Duration
                            </p>
                            <p className="font-medium">
                              {event.duration_frames} frames
                            </p>
                          </div>
                        )}

                        {event.direction && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Direction
                            </p>
                            <p className="font-medium">
                              {event.direction}
                            </p>
                          </div>
                        )}

                        {event.movement_distance_pixels !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Movement
                            </p>
                            <p className="font-medium">
                              {event.movement_distance_pixels.toFixed(1)} px
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {(!videoResult.reasoning_events ||
              videoResult.reasoning_events.length === 0) && (
              <p className="text-sm text-muted-foreground border rounded-lg p-4">
                Detection completed, but no temporal events were generated.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      {(imageResult || videoResult) && (
        <div className="border rounded-lg p-3 text-sm text-muted-foreground">
          AI results represent detected visual observations and should
          be reviewed in context. They are not definitive conclusions
          about a person's actions or intentions.
        </div>
      )}
    </div>
  );
}