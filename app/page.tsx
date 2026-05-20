import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-amber-200 p-8">
      <h1 className="mb-2 text-center text-4xl font-bold text-amber-950 md:text-5xl">
        時光柑仔店
      </h1>
      <p className="mb-8 max-w-md text-center text-lg text-amber-900">
        走進阿嬤的柑仔店，翻開回憶裡的便條紙，解開五道機關。
      </p>
      <Link
        href="/store"
        className="rounded-xl border-4 border-amber-900 bg-amber-50 px-8 py-4 text-xl font-bold text-amber-950 shadow-lg transition hover:bg-amber-100 hover:shadow-xl"
      >
        進入柑仔店
      </Link>
      <p className="mt-12 text-sm text-amber-800">
        第七組 · 林芮竫、黃品恩、洪秀蓮、盧家愛、陳昱銓
      </p>
    </main>
  );
}
