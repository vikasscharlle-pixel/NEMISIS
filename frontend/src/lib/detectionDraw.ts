// Class-to-colour mapping for bounding box drawing on canvas
export const CLASS_COLORS: Record<string, string> = {
  person:     "#00E5FF",
  bag:        "#00FF99",
  backpack:   "#00FF99",
  suitcase:   "#00FF99",
  car:        "#FFC857",
  motorcycle: "#FF7043",
  bicycle:    "#FF7043",
  "trash can": "#CE93D8",
};

export const DEFAULT_BOX_COLOR = "#90A4AE";

export function getClassColor(cls: string): string {
  return CLASS_COLORS[cls.toLowerCase()] ?? DEFAULT_BOX_COLOR;
}

/** Draw all detections onto a canvas that overlays the image element. */
export function drawDetections(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  detections: Array<{
    detection_class: string;
    confidence: number;
    bounding_box: { x1: number; y1: number; x2: number; y2: number };
  }>
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Scale bounding boxes from original image dims to displayed dims
  const scaleX = canvas.width / img.naturalWidth;
  const scaleY = canvas.height / img.naturalHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const det of detections) {
    const { x1, y1, x2, y2 } = det.bounding_box;
    const color = getClassColor(det.detection_class);
    const sx1 = x1 * scaleX;
    const sy1 = y1 * scaleY;
    const sw = (x2 - x1) * scaleX;
    const sh = (y2 - y1) * scaleY;

    // Box
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(sx1, sy1, sw, sh);

    // Label background
    const label = `${det.detection_class} ${(det.confidence * 100).toFixed(0)}%`;
    ctx.font = "bold 13px JetBrains Mono, monospace";
    const labelWidth = ctx.measureText(label).width + 10;
    const labelHeight = 20;
    const labelY = sy1 > labelHeight ? sy1 - labelHeight : sy1 + 2;

    ctx.fillStyle = color;
    ctx.fillRect(sx1, labelY, labelWidth, labelHeight);

    // Label text
    ctx.fillStyle = "#020817";
    ctx.fillText(label, sx1 + 5, labelY + 14);
  }
}
