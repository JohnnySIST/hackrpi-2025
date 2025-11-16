import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-500 via-teal-400 to-green-300 font-sans">
      <Image
        src="/earth.png"
        alt="Earth"
        width={180}
        height={180}
        className="mb-8 drop-shadow-xl"
        priority
      />
      <h1 className="text-6xl font-extrabold text-white drop-shadow-lg mb-6 text-center">EarthScope</h1>
      <p className="text-2xl text-white/90 font-medium mb-10 text-center max-w-2xl drop-shadow">
        Explore the intricate relationship between the development of human civilization and the natural environment. Discover how our progress impacts the world around us through interactive visualizations and insightful data.
      </p>
      <a
        href="/globe"
        className="px-12 py-5 text-2xl font-bold rounded-full bg-white text-teal-500 shadow-xl hover:bg-teal-500 hover:text-white transition-colors duration-200"
      >
        Enter Visualization
      </a>
    </div>
  );
}
