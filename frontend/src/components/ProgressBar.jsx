export default function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-[#1f2430] rounded-full h-2 overflow-hidden border border-gray-800">
      <div
        className="h-full bg-blue-600 transition-all duration-700 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}
