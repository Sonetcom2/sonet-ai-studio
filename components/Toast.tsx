"use client";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
};

export default function Toast({
  message,
  type = "info",
}: ToastProps) {
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white animate-pulse ${colors[type]}`}
    >
      {message}
    </div>
  );
}