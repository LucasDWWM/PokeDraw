import type React from "react";
import { useEffect, useRef, useState } from "react";

type Tool = "pen" | "eraser" | "bucket";

interface Props {
  onFinish: (dataUrl: string) => void;
  durationSeconds: number;
}

const COLOR_SWATCHES = [
  "#000000",
  "#ffffff",
  "#ff3b30",
  "#ff9500",
  "#ffcc00",
  "#34c759",
  "#5ac8fa",
  "#007aff",
  "#af52de",
];

const BRUSH_SIZES = [4, 8, 12, 18, 26];

const CanvasDrawing = ({ onFinish, durationSeconds }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(8);
  const [brushColor, setBrushColor] = useState("#000000");
  const [tool, setTool] = useState<Tool>("pen");

  // Resize + fond blanc
  useEffect(() => {
    const resize = () => {
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      if (!wrap || !canvas) return;

      const rect = wrap.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      onFinish(canvas.toDataURL("image/png"));
      return;
    }
    const id = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearInterval(id);
  }, [timeLeft, onFinish]);

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  };

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "bucket") {
      handleBucket();
      return;
    }

    setIsDrawing(true);
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = pointerPos(e);

    const color = tool === "eraser" ? "#ffffff" : brushColor;

    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleBucket = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = brushColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="space-y-4">
      {/* Top bar : timer */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-neutral-700">
          Time left: <span className="font-semibold">{timeLeft}s</span>
        </p>
      </div>

      {/* Tools */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm">
        {/* Palette de couleurs */}
        <div className="flex items-center gap-2 flex-wrap">
          {COLOR_SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                setBrushColor(color);
                setTool("pen");
              }}
              className={`h-7 w-7 rounded-full border ${color === "#ffffff" ? "border-neutral-300" : "border-transparent"
                } ${brushColor === color && tool === "pen" ? "ring-2 ring-neutral-900" : ""}`}
              style={{ backgroundColor: color }}
            />
          ))}
          <label className="ml-2 flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-neutral-500">
              Custom
            </span>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => {
                setBrushColor(e.target.value);
                setTool("pen");
              }}
              className="h-7 w-7 rounded-full border border-neutral-300 p-0"
            />
          </label>
        </div>

        {/* Tailles de pinceau */}
        <div className="flex items-center gap-2">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setBrushSize(size)}
              className={`flex items-center justify-center rounded-full border h-8 w-8 bg-white ${brushSize === size ? "bg-neutral-900 border-neutral-900" : ""
                }`}
            >
              <span
                className={`rounded-full ${brushSize === size ? "bg-white" : "bg-neutral-900"
                  }`}
                style={{ width: size / 2, height: size / 2 }}
              />
            </button>
          ))}
        </div>

        {/* Outils */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTool("bucket")}
            className={`px-3 py-1 rounded-full border text-xs flex items-center gap-1 ${tool === "bucket"
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white"
              }`}
          >
            🪣 Bucket
          </button>
          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`px-3 py-1 rounded-full border text-xs flex items-center gap-1 ${tool === "eraser"
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white"
              }`}
          >
            🩹 Eraser
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="px-3 py-1 rounded-full border text-xs flex items-center gap-1 bg-white"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={wrapRef}
        className="w-full h-[320px] sm:h-[420px] bg-white rounded-2xl shadow-inner overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

export default CanvasDrawing;