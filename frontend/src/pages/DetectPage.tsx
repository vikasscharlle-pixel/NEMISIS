
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

type Mode = "image" | "video";

export function DetectPage() {
  const [mode, setMode] = useState<Mode>("image");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [liveAnalysis, setLiveAnalysis] = useState(false);
  const [liveResults, setLiveResults] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);

  const [uploadResults, setUploadResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef(false);
  const busyRef = useRef(false);

  const startCamera = async () => {
    try {
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
    } catch {
      setCameraError("Unable to access camera. Check camera permissions.");
    }
  };

  const stopCamera = () => {
    stopLiveAnalysis();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setLiveResults(null);
  };

  const stopLiveAnalysis = () => {
    loopRef.current = false;
    setLiveAnalysis(false);
  };

  const analyzeLiveFrame = async () => {
    if (!loopRef.current || busyRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) {
      if (loopRef.current) {
        setTimeout(analyzeLiveFrame, 1500);
      }
      return;
    }

    busyRef.current = true;

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        busyRef.current = false;
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.75);
      });

      if (!blob || !loopRef.current) {
        busyRef.current = false;
        return;
      }

      const form = new FormData();
      form.append("file", blob, "live-frame.jpg");

      const response = await api.post("/detect/image", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (loopRef.current) {
        setLiveResults(response.data);
        setLiveError(null);
      }
    } catch {
      if (loopRef.current) {
        setLiveError("Frame analysis failed. Check backend connection.");
      }
    } finally {
      busyRef.current = false;

      if (loopRef.current) {
        setTimeout(analyzeLiveFrame, 1500);
      }
    }
  };

  const startLiveAnalysis = () => {
    if (!cameraActive || loopRef.current) return;

    setLiveError(null);
    setLiveResults(null);

    loopRef.current = true;
    setLiveAnalysis(true);

    analyzeLiveFrame();
  };

  const handleFile = (selectedFile: File | null) => {
    setFile(selectedFile);
    setUploadResults(null);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleDetect = async () => {
    if (!file) return;

    setLoading(true);
    setUploadResults(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const endpoint =
        mode === "image"
          ? "/detect/image"
          : "/detect/video?sample_every_n_frames=30";

      const response = await api.post(endpoint, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadResults(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        "Detection failed. Check backend connection.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  useEffect(() => {
    return () => {
      loopRef.current = false;

      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const detections = liveResults?.detections ?? [];

  const classCounts = uploadResults?.classes_found ?? {};
  const reasoningEvents = uploadResults?.reasoning_events ?? [];

  return (
    <div className="space-y-6 p-4 text-white">
      <div>
        <h1 className="text-2xl font-bold">Video Intelligence</h1>
        <p className="text-gray-400">
          Image, video and live camera analysis
        </p>
      </div>

      {/* Modes */}
      <div className="flex gap-3">
        <button
          onClick={() => setMode("image")}
          className={`rounded-lg border px-4 py-2 ${
            mode === "image"
              ? "border-blue-500 bg-blue-600 text-white"
              : "border-gray-700 bg-gray-900"
          }`}
        >
          Image
        </button>

        <button
          onClick={() => setMode("video")}
          className={`rounded-lg border px-4 py-2 ${
            mode === "video"
              ? "border-blue-500 bg-blue-600 text-white"
              : "border-gray-700 bg-gray-900"
          }`}
        >
          Video
        </button>
      </div>

      {/* Live Camera */}
      <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-950 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Live Camera</h2>

          <span className={cameraActive ? "text-green-400" : "text-gray-500"}>
            {cameraActive ? "Camera Active" : "Camera Offline"}
          </span>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-contain"
          />

          {liveResults && videoRef.current && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 ${0} ${
                videoRef.current.videoWidth || 1280
              } ${videoRef.current.videoHeight || 720}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {detections.map((detection: any, index: number) => {
                const box = detection.bounding_box;
                if (!box) return null;

                const label =
                  detection.detection_class ??
                  detection.class_name ??
                  "Object";

                const confidence = detection.confidence ?? 0;

                return (
                  <g key={index}>
                    <rect
                      x={box.x1}
                      y={box.y1}
                      width={box.x2 - box.x1}
                      height={box.y2 - box.y1}
                      fill="none"
                      stroke="#00E5FF"
                      strokeWidth="4"
                    />

                    <rect
                      x={box.x1}
                      y={Math.max(box.y1 - 30, 0)}
                      width={Math.max(label.length * 12 + 90, 140)}
                      height="30"
                      fill="#00B8D4"
                      rx="4"
                    />

                    <text
                      x={box.x1 + 8}
                      y={Math.max(box.y1 - 10, 20)}
                      fill="white"
                      fontSize="22"
                      fontWeight="bold"
                    >
                      {label} {(confidence * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex flex-wrap gap-3">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="rounded-lg border border-gray-700 px-4 py-2"
            >
              Stop Camera
            </button>
          )}

          {!liveAnalysis ? (
            <button
              onClick={startLiveAnalysis}
              disabled={!cameraActive}
              className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              Start AI Analysis
            </button>
          ) : (
            <button
              onClick={stopLiveAnalysis}
              className="rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              Stop AI Analysis
            </button>
          )}
        </div>

        {cameraError && <p className="text-red-400">{cameraError}</p>}

        {liveAnalysis && (
          <p className="font-medium text-green-400">
            Live AI Analysis Running
          </p>
        )}

        {liveError && <p className="text-red-400">{liveError}</p>}
      </div>

      {/* Live Results */}
      {liveResults && (
        <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-950 p-5">
          <h2 className="text-xl font-bold">Live AI Analysis</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Metric
              label="Objects Detected"
              value={liveResults.total_objects ?? 0}
            />

            <Metric
              label="Processing Time"
              value={`${liveResults.inference_time_ms ?? 0} ms`}
            />

            <Metric
              label="AI Model"
              value={liveResults.model_used ?? "YOLO"}
            />
          </div>

          <div className="rounded-lg border border-gray-800 p-4">
            <h3 className="mb-3 font-semibold">Detected Objects</h3>

            {liveResults.total_objects > 0 ? (
              <div className="space-y-2">
                {detections.map((detection: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-800 p-3"
                  >
                    <span>
                      {detection.detection_class ??
                        detection.class_name ??
                        "Object"}
                    </span>

                    <span className="rounded-full bg-green-950 px-3 py-1 text-sm text-green-300">
                      {((detection.confidence ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">
                No objects detected in the current frame.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Upload */}
      <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-950 p-5">
        <h2 className="text-lg font-semibold">
          Upload {mode === "image" ? "Image" : "Video"}
        </h2>

        <input
          type="file"
          accept={mode === "image" ? "image/*" : "video/*"}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-300"
        />

        {preview && mode === "image" && (
          <img
            src={preview}
            alt="Preview"
            className="max-h-96 rounded-xl object-contain"
          />
        )}

        {preview && mode === "video" && (
          <video
            src={preview}
            controls
            className="max-h-96 w-full rounded-xl"
          />
        )}

        <button
          onClick={handleDetect}
          disabled={!file || loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : "Run Detection"}
        </button>
      </div>

      {/* Upload Results Dashboard */}
      {uploadResults && (
        <div className="space-y-5 rounded-xl border border-gray-800 bg-gray-950 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Analysis Results</h2>
            <span className="rounded-full bg-green-950 px-3 py-1 text-sm text-green-400">
              Analysis Complete
            </span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Metric
              label={mode === "video" ? "Frames Processed" : "Objects Detected"}
              value={
                mode === "video"
                  ? uploadResults.total_frames_processed ?? 0
                  : uploadResults.total_objects ?? 0
              }
            />

            <Metric
              label="Total Detections"
              value={
                mode === "video"
                  ? uploadResults.total_detections ?? 0
                  : uploadResults.total_objects ?? 0
              }
            />

            <Metric
              label="Inference Time"
              value={`${uploadResults.inference_time_ms ?? 0} ms`}
            />

            <Metric
              label="AI Model"
              value={uploadResults.model_used ?? "YOLO"}
            />
          </div>

          {/* Class Breakdown */}
          <div className="rounded-xl border border-gray-800 p-4">
            <h3 className="mb-4 font-semibold">Detected Objects</h3>

            {Object.keys(classCounts).length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {Object.entries(classCounts).map(([name, count]: any) => (
                  <div
                    key={name}
                    className="rounded-lg border border-gray-800 bg-gray-900 p-4"
                  >
                    <p className="capitalize text-gray-400">{name}</p>
                    <p className="mt-1 text-2xl font-bold text-blue-400">
                      {count}
                    </p>
                    <p className="text-xs text-gray-500">detections</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No objects detected.</p>
            )}
          </div>

          {/* Reasoning Summary */}
          {uploadResults.reasoning_summary && (
            <div className="rounded-xl border border-blue-900 bg-blue-950/30 p-4">
              <h3 className="font-semibold text-blue-300">
                AI Video Analysis
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">
                {uploadResults.reasoning_summary}
              </p>
            </div>
          )}

          {/* Reasoning Events */}
          {reasoningEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Observed Events</h3>

              {reasoningEvents.map((event: any, index: number) => (
                <div
                  key={index}
                  className="space-y-2 rounded-xl border border-gray-800 bg-gray-900 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-blue-300">
                      {event.event_type ??
                        event.type ??
                        "Observation"}
                    </h4>

                    {event.object && (
                      <span className="rounded-full bg-gray-800 px-3 py-1 text-sm capitalize text-gray-300">
                        {event.object}
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-300">
                      {event.description}
                    </p>
                  )}

                  {event.observations !== undefined && (
                    <p className="text-sm text-gray-400">
                      Observations: {event.observations}
                    </p>
                  )}

                  {event.duration_frames !== undefined && (
                    <p className="text-sm text-gray-400">
                      Duration: {event.duration_frames} frames
                    </p>
                  )}

                  {event.details && (
                    <p className="text-sm text-gray-400">
                      {typeof event.details === "string"
                        ? event.details
                        : JSON.stringify(event.details)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Annotated Evidence */}
          {(uploadResults.sample_annotated_path ||
            uploadResults.annotated_image_path) && (
            <div className="rounded-xl border border-gray-800 p-4">
              <h3 className="font-semibold">Annotated Evidence</h3>
              <p className="mt-2 break-all text-sm text-gray-400">
                {uploadResults.sample_annotated_path ??
                  uploadResults.annotated_image_path}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Evidence image generated by the detection pipeline.
              </p>
            </div>
          )}

          {/* Image-specific detections */}
          {mode === "image" && uploadResults.detections?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Detection Details</h3>

              {uploadResults.detections.map((detection: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-800 p-3"
                >
                  <span className="capitalize">
                    {detection.detection_class ?? detection.class_name}
                  </span>

                  <span className="text-green-400">
                    {((detection.confidence ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500">
            AI observations are automated and should be reviewed by a human.
          </p>
        </div>
      )}

      <p className="text-sm text-gray-500">
        AI observations are automated and should be reviewed by a human.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 break-words text-xl font-bold text-white">{value}</p>
    </div>
  );
}
