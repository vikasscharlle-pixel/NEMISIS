import React, { useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Activity, AlertCircle, CheckCircle2, Cpu, Image, Upload, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { drawDetections, getClassColor } from "@/lib/detectionDraw";
import type { ImageDetectionResponse, VideoDetectionResponse } from "@/types/detection";

type Mode = "image" | "video";

const ACCEPTED_IMAGE = "image/jpeg,image/png,image/webp,image/bmp";
const ACCEPTED_VIDEO = "video/mp4,video/avi,video/quicktime,video/x-matroska,video/x-msvideo";

export function DetectPage() {
  const [mode, setMode] = useState<Mode>("image");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageResult, setImageResult] = useState<ImageDetectionResponse | null>(null);
  const [videoResult, setVideoResult] = useState<VideoDetectionResponse | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image detection mutation ──────────────────────────────────────────────
  const imageMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const form = new FormData();
      form.append("file", uploadFile);
      const res = await api.post<ImageDetectionResponse>("/detect/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setImageResult(data);
      // Draw bounding boxes once image has loaded
      if (imgRef.current && canvasRef.current) {
        const draw = () => {
          const img = imgRef.current!;
          const canvas = canvasRef.current!;
          canvas.width = img.clientWidth;
          canvas.height = img.clientHeight;
          drawDetections(canvas, img, data.detections);
        };
        if (imgRef.current.complete) draw();
        else imgRef.current.onload = draw;
      }
    },
  });

  // ── Video detection mutation ──────────────────────────────────────────────
  const videoMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const form = new FormData();
      form.append("file", uploadFile);
      const res = await api.post<VideoDetectionResponse>("/detect/video?sample_every_n_frames=30", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => setVideoResult(data),
  });

  // ── File selection ──────────────────────────────────────────────────────
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setFile(f);
      setImageResult(null);
      setVideoResult(null);
      if (mode === "image") {
        setPreview(URL.createObjectURL(f));
      } else {
        setPreview(null);
      }
    },
    [mode]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (!f) return;
      setFile(f);
      setImageResult(null);
      setVideoResult(null);
      if (mode === "image") setPreview(URL.createObjectURL(f));
    },
    [mode]
  );

  const handleRun = () => {
    if (!file) return;
    if (mode === "image") imageMutation.mutate(file);
    else videoMutation.mutate(file);
  };

  const isLoading = imageMutation.isPending || videoMutation.isPending;
  const result = mode === "image" ? imageResult : videoResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Object Detection</h1>
          <p className="text-sm text-muted-foreground">
            Upload an image or video to run YOLOv11 detection — person, bag, car, dustbin &amp; more.
          </p>
        </div>
        <Badge variant="info">Phase 2 · YOLOv11</Badge>
      </div>

      {/* Mode toggle */}
      <div className="inline-flex rounded-lg bg-slate-900 p-1">
        {(["image", "video"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setFile(null); setPreview(null); setImageResult(null); setVideoResult(null); }}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
              mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "image" ? <Image className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            {m === "image" ? "Image" : "Video"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Upload {mode === "image" ? "Image" : "Video"}
            </CardTitle>
            <CardDescription>
              {mode === "image"
                ? "Accepts JPG, PNG, WebP, BMP — max 50 MB"
                : "Accepts MP4, AVI, MOV, MKV — max 500 MB · sampled every 30 frames"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop Zone */}
            <div
              className="relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-slate-900/40 transition hover:border-primary/60 hover:bg-slate-900/70"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {file ? (
                <div className="text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag &amp; drop or <span className="text-primary">click to browse</span>
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={mode === "image" ? ACCEPTED_IMAGE : ACCEPTED_VIDEO}
                onChange={handleFileChange}
              />
            </div>

            <Button
              className="w-full"
              disabled={!file || isLoading}
              onClick={handleRun}
            >
              {isLoading ? (
                <><Activity className="mr-2 h-4 w-4 animate-spin" />Running YOLOv11...</>
              ) : (
                <><Cpu className="mr-2 h-4 w-4" />Run Detection</>
              )}
            </Button>

            {/* Error */}
            {(imageMutation.isError || videoMutation.isError) && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Detection failed:{" "}
                  {((imageMutation.error || videoMutation.error) as { response?: { data?: { detail?: string } } })
                    ?.response?.data?.detail ?? "Server error. Check backend logs."}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview + Canvas Overlay */}
        {mode === "image" && preview && (
          <Card>
            <CardHeader>
              <CardTitle>Detection Preview</CardTitle>
              <CardDescription>Bounding boxes drawn client-side from API results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative select-none overflow-hidden rounded-lg border border-border bg-black">
                <img
                  ref={imgRef}
                  src={preview}
                  alt="Detection preview"
                  className="block w-full object-contain"
                  onLoad={() => {
                    if (imageResult && imgRef.current && canvasRef.current) {
                      const img = imgRef.current;
                      const canvas = canvasRef.current;
                      canvas.width = img.clientWidth;
                      canvas.height = img.clientHeight;
                      drawDetections(canvas, img, imageResult.detections);
                    }
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="pointer-events-none absolute inset-0"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result summary */}
        {result && (
          <Card className={mode === "image" && preview ? "lg:col-span-2" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Detection Results
              </CardTitle>
              <CardDescription>
                Model: <strong>{result.model_used}</strong> · Inference:{" "}
                <strong>{result.inference_time_ms.toFixed(0)} ms</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    label: "Total Objects",
                    value: mode === "image"
                      ? (result as ImageDetectionResponse).total_objects
                      : (result as VideoDetectionResponse).total_detections,
                    color: "text-sky-300",
                  },
                  {
                    label: "Classes Found",
                    value: Object.keys(result.classes_found).length,
                    color: "text-emerald-300",
                  },
                  {
                    label: mode === "image" ? "Inference" : "Frames Proc.",
                    value: mode === "image"
                      ? `${result.inference_time_ms.toFixed(0)}ms`
                      : (result as VideoDetectionResponse).total_frames_processed,
                    color: "text-amber-300",
                  },
                  {
                    label: "Model",
                    value: result.model_used,
                    color: "text-purple-300",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-lg border border-border bg-slate-900/60 p-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className={`text-lg font-bold ${color}`}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Class breakdown badges */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Classes Detected</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.classes_found).map(([cls, count]) => (
                    <span
                      key={cls}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${getClassColor(cls)}22`,
                        color: getClassColor(cls),
                        border: `1px solid ${getClassColor(cls)}55`,
                      }}
                    >
                      {cls}
                      <span className="rounded-full bg-black/30 px-1.5 py-0.5 text-[10px] font-bold">{count}</span>
                    </span>
                  ))}
                  {Object.keys(result.classes_found).length === 0 && (
                    <span className="text-sm text-muted-foreground">No target-class objects detected.</span>
                  )}
                </div>
              </div>

              {/* Per-detection table (image mode) */}
              {mode === "image" && (result as ImageDetectionResponse).detections.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Bounding Boxes ({(result as ImageDetectionResponse).detections.length})
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Bounding Box (x1,y1 → x2,y2)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(result as ImageDetectionResponse).detections.map((det) => (
                          <TableRow key={det.id}>
                            <TableCell>
                              <span
                                className="inline-block rounded px-2 py-0.5 text-xs font-medium"
                                style={{
                                  backgroundColor: `${getClassColor(det.detection_class)}22`,
                                  color: getClassColor(det.detection_class),
                                }}
                              >
                                {det.detection_class}
                              </span>
                            </TableCell>
                            <TableCell>{(det.confidence * 100).toFixed(1)}%</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              ({det.bounding_box.x1},{det.bounding_box.y1}) →&nbsp;
                              ({det.bounding_box.x2},{det.bounding_box.y2})
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
