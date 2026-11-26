
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
  const loopRef = useRef<boolean>(false);
  const busyRef = useRef<boolean>(false);

  // Start camera
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
    } catch (error) {
      setCameraError("Unable to access camera. Check camera permissions.");
    }
  };

  // Stop camera and live analysis
  const stopCamera = () => {
    stopLiveAnalysis();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  // Stop continuous analysis
  const stopLiveAnalysis = () => {
    loopRef.current = false;
    busyRef.current = false;
    setLiveAnalysis(false);
  };

  // Live frame processing loop
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
    } catch (error) {
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

  // Start continuous analysis
  const startLiveAnalysis = () => {
    if (!cameraActive || loopRef.current) return;

    setLiveError(null);
    setLiveResults(null);

    loopRef.current = true;
    setLiveAnalysis(true);

    analyzeLiveFrame();
  };

  // File selection
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

  // Image/video upload detection
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
    } catch (error) {
      alert("Detection failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Attach camera stream to video
  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Cleanup when page is removed
  useEffect(() => {
    return () => {
      loopRef.current = false;

      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Video Intelligence</h1>
        <p className="text-gray-500">
          Image, video and live camera analysis
        </p>
      </div>

      {/* Modes */}
      <div className="flex gap-3">
        <button
          onClick={() => setMode("image")}
          className={`rounded-lg border px-4 py-2 ${
            mode === "image" ? "bg-blue-600 text-white" : ""
          }`}
        >
          Image
        </button>

        <button
          onClick={() => setMode("video")}
          className={`rounded-lg border px-4 py-2 ${
            mode === "video" ? "bg-blue-600 text-white" : ""
          }`}
        >
          Video
        </button>
      </div>

      {/* Live Camera */}
      <div className="space-y-4 rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Live Camera</h2>

          <span className={cameraActive ? "text-green-600" : "text-gray-500"}>
            {cameraActive ? "Camera Active" : "Camera Offline"}
          </span>
        </div>

        <div className="aspect-video overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-contain"
          />
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
              className="rounded-lg border px-4 py-2"
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

        {cameraError && (
          <p className="text-red-500">{cameraError}</p>
        )}

        {liveAnalysis && (
          <p className="font-medium text-green-600">
            Live AI Analysis Running
          </p>
        )}

        {liveError && (
          <p className="text-red-500">{liveError}</p>
        )}
      </div>

      {/* Live results */}
{liveResults && (
  <div className="space-y-4 rounded-xl border border-gray-700 bg-gray-900 p-5">
    <h2 className="text-xl font-bold text-white">
      Live AI Analysis
    </h2>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <div className="rounded-lg bg-gray-800 p-4">
        <p className="text-sm text-gray-400">Objects Detected</p>
        <p className="mt-2 text-2xl font-bold text-white">
          {liveResults.total_objects ?? 0}
        </p>
      </div>

      <div className="rounded-lg bg-gray-800 p-4">
        <p className="text-sm text-gray-400">Processing Time</p>
        <p className="mt-2 text-2xl font-bold text-green-400">
          {liveResults.inference_time_ms ?? 0} ms
        </p>
      </div>

      <div className="rounded-lg bg-gray-800 p-4">
        <p className="text-sm text-gray-400">AI Model</p>
        <p className="mt-2 text-lg font-bold text-blue-400">
          {liveResults.model_used ?? "YOLO"}
        </p>
      </div>
    </div>

    <div className="rounded-lg bg-gray-800 p-4">
      <h3 className="mb-3 font-semibold text-white">
        Detected Objects
      </h3>

      {liveResults.total_objects > 0 ? (
        <div className="space-y-3">
          {liveResults.detections?.map((detection: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-700 p-3"
            >
              <span className="font-medium text-white">
                {detection.detection_class ?? detection.class_name ?? "Object"}
              </span>

              <span className="rounded-full bg-green-900 px-3 py-1 text-sm text-green-300">
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

    <div className="rounded-lg border border-blue-900 bg-blue-950/30 p-4">
      <p className="font-medium text-blue-300">
        Frame Analysis Status
      </p>

      <p className="mt-2 text-sm text-gray-300">
        {liveResults.total_objects > 0
          ? "Objects are being detected and analysed by the vision model."
          : "The camera frame was processed successfully. Waiting for detectable objects."}
      </p>
    </div>
  </div>
)}
      {liveResults && (
        <div className="space-y-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">
            Latest Live Detection
          </h2>

         <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 text-green-400 p-4 text-sm">
          {JSON.stringify(liveResults, null, 2)}
          </pre>
        </div>
      )}

      {/* Upload */}
      <div className="space-y-4 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">
          Upload {mode === "image" ? "Image" : "Video"}
        </h2>

        <input
          type="file"
          accept={mode === "image" ? "image/*" : "video/*"}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
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

      {/* Upload results */}
      {uploadResults && (
        <div className="space-y-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Detection Results</h2>

          <pre className="max-h-96 overflow-auto rounded-lg bg-gray-100 p-4 text-sm">
            {JSON.stringify(uploadResults, null, 2)}
          </pre>
        </div>
      )}

      <p className="text-sm text-gray-500">
        AI observations are automated and should be reviewed by a human.
      </p>
    </div>
  );
}
