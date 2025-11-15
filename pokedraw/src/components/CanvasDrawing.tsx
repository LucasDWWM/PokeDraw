import type React from "react";
import { useEffect, useRef, useState } from "react";

type Tool = "pen" | "eraser" | "bucket";

interface Props {
  onFinish: (dataUrl: string) => void;
  durationSeconds: number;
}

const CanvasDrawing = ({ onFinish, durationSeconds }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(8);
  const [brushColor, setBrushColor] = useState("#000000");
  const [tool, setTool] = useState<Tool>("pen");

  // Resize comme dans ton script
  useEffect(() => {
    const resize = () => {
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      if (!wrap || !canvas) return;

      const rect = wrap.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);

      // fond blanc (sinon transparent)
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
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
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
    ctx.lineTo(x, y);

    const color = tool === "eraser" ? "#ffffff" : brushColor;

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

  const quickSize = (size: number) => {
    setBrushSize(size);
  };

  return (
    <div className="space-y-4">
      {/* Top bar : timer + tools */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
        <span className="text-neutral-700">
          Time left: <span className="font-semibold">{timeLeft}s</span>
        </span>

        <div className="flex flex-wrap items-center gap-3">
          {/* Couleur */}
          <label className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-neutral-500">
              Color
            </span>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="h-7 w-7 rounded-full border border-neutral-300 p-0"
            />
          </label>

          {/* Tailles rapides */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => quickSize(4)}
              className={`h-6 w-6 rounded-full border ${
                brushSize === 4 ? "bg-neutral-900 border-neutral-900" : ""
              }`}
            />
            <button
              onClick={() => quickSize(8)}
              className={`h-7 w-7 rounded-full border ${
                brushSize === 8 ? "bg-neutral-900 border-neutral-900" : ""
              }`}
            />
            <button
              onClick={() => quickSize(14)}
              className={`h-8 w-8 rounded-full border ${
                brushSize === 14 ? "bg-neutral-900 border-neutral-900" : ""
              }`}
            />
          </div>

          {/* Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool("pen")}
              className={`px-3 py-1 rounded-full border text-xs ${
                tool === "pen"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white"
              }`}
            >
              Pen
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`px-3 py-1 rounded-full border text-xs ${
                tool === "eraser"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white"
              }`}
            >
              Eraser
            </button>
            <button
              onClick={() => setTool("bucket")}
              className={`px-3 py-1 rounded-full border text-xs ${
                tool === "bucket"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white"
              }`}
            >
              Bucket
            </button>
          </div>

          <button
            onClick={clearCanvas}
            className="px-3 py-1 rounded-full border text-xs"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Zone de dessin */}
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
